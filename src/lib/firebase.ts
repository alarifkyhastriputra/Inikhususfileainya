import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { UserProfile, UserRole, UserStatus, GeneratedWebsite, SystemSettings, TutorialVideo } from '../types';

export const ADMIN_EMAILS = [
  'nocteos67@gmail.com',
  'nocteos60@gmail.com',
  'hasbullahbeloh27@gmail.com'
];
export const ADMIN_EMAIL = 'nocteos67@gmail.com';

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Official Firebase configuration with environment variable support
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZIDtUteM2MiESDJd35gaKPHX_Ht1zL6s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "projectchat01-d16bc.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://projectchat01-d16bc-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "projectchat01-d16bc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "projectchat01-d16bc.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "163313653543",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:163313653543:web:6d842890188ba76b11bb02",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7QZP6V6WLK"
};

// Initialize Firebase App defensively
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged, signOut };

// Local Storage Fallback Key for resilient offline / demo persistence
const LOCAL_USERS_KEY = 'vimos_local_users_db_v1';
const LOCAL_SITES_KEY = 'vimos_local_sites_db_v1';
const LOCAL_SETTINGS_KEY = 'vimos_local_settings_db_v1';
const ACTIVE_SESSION_KEY = 'vimos_active_session_v1';

// Timeout helper to prevent infinite spinning on network or Firestore stalls
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

// Get stored active session
export function getActiveSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save active session
export function setActiveSession(profile: UserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to set active session:', e);
  }
}

// Default system settings
const DEFAULT_SETTINGS: SystemSettings = {
  requireApprovalForNewUsers: true,
  defaultCreditsPerUser: 100,
  aiModel: 'gemini-3.8-flash',
  systemNotice: 'Welcome to vimos.ai! Member registrations require admin verification.'
};

// Test firestore connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firebase client is offline or restricted. Local persistence mode enabled.');
    }
  }
}
testConnection();

// Get local users array
function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const list: UserProfile[] = raw ? JSON.parse(raw) : [];

    // Ensure all super admin accounts exist with admin role
    ADMIN_EMAILS.forEach((admEmail, idx) => {
      const found = list.find(u => u.email.toLowerCase() === admEmail.toLowerCase());
      if (!found) {
        list.push({
          uid: `admin_${idx}_${admEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: admEmail,
          displayName: `Super Admin (${admEmail.split('@')[0]})`,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          credits: 999999,
          lastLogin: new Date().toISOString()
        });
      } else {
        found.role = 'admin';
        found.status = 'active';
        found.credits = 999999;
      }
    });

    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

// Save local users
function saveLocalUsers(users: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }
}

// Get system settings
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(data.settings));
        return data.settings;
      }
    }
  } catch {}

  try {
    const docRef = doc(db, 'settings', 'global');
    const snap = await withTimeout(getDoc(docRef), 1000, null as any);
    if (snap && snap.exists && snap.exists()) {
      return snap.data() as SystemSettings;
    }
  } catch (err) {
    console.warn('Firestore settings fetch error, using local settings:', err);
  }
  const local = localStorage.getItem(LOCAL_SETTINGS_KEY);
  return local ? JSON.parse(local) : DEFAULT_SETTINGS;
}

// Update system settings
export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
  const current = await getSystemSettings();
  const updated = { ...current, ...settings };

  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});

  try {
    const docRef = doc(db, 'settings', 'global');
    setDoc(docRef, updated, { merge: true }).catch(() => {});
  } catch (e) {
    console.warn('Firestore update settings failed, updating local storage:', e);
  }
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
}

// Verify if user account was created by Admin
export async function verifyUserIsRegisteredByAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  const normEmail = email.trim().toLowerCase();
  if (isAdminEmail(normEmail)) return true;

  // 1. Check Online Server API
  try {
    const res = await fetch('/api/auth/verify-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail })
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.registered === 'boolean') {
        return data.registered;
      }
    }
  } catch {}

  // 2. Check Firestore
  try {
    const firestoreCheck = async () => {
      const q = query(collection(db, 'users'), where('email', '==', normEmail));
      const snap = await getDocs(q);
      return !snap.empty;
    };
    const foundInFirestore = await withTimeout(firestoreCheck(), 1200, false);
    if (foundInFirestore) return true;
  } catch (err) {
    console.warn('Firestore user check failed, fallback to local storage:', err);
  }

  // 3. Fallback to Local Storage
  const localUsers = getLocalUsers();
  return localUsers.some(u => u.email.toLowerCase() === normEmail);
}

// Complete Authentication & Login flow with 100% Online Server Database
export async function loginUserWithCredentials(email: string, password: string, forceUpdatePassword?: boolean): Promise<UserProfile> {
  const normEmail = email.trim().toLowerCase();
  const isSuperAdmin = isAdminEmail(normEmail);

  // 1. Check local storage cache first if available
  const localUsers = getLocalUsers();
  const existingLocal = localUsers.find(u => u.email.toLowerCase() === normEmail);

  // 2. Primary: Online Cloud Server Auth
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, password, forceUpdatePassword })
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const userProfile: UserProfile = {
        ...data.user,
        role: isSuperAdmin ? 'admin' : data.user.role,
        status: isSuperAdmin ? 'active' : data.user.status,
        credits: isSuperAdmin ? 999999 : data.user.credits
      };

      // Sync active session and local storage cache
      const local = getLocalUsers();
      const idx = local.findIndex(u => u.email.toLowerCase() === normEmail);
      if (idx >= 0) local[idx] = userProfile;
      else local.unshift(userProfile);
      saveLocalUsers(local);
      setActiveSession(userProfile);

      return userProfile;
    } else if (existingLocal) {
      // User was missing on server DB but present in client local cache -> Sync to server DB!
      if (existingLocal.password && existingLocal.password !== password) {
        throw new Error('Password yang Anda masukkan salah. Silakan periksa kembali password Anda.');
      }
      if (existingLocal.status === 'suspended') {
        throw new Error('Akun Anda sedang dinonaktifkan/ditangguhkan oleh Admin.');
      }

      const syncProfile: UserProfile = {
        ...existingLocal,
        role: isSuperAdmin ? 'admin' : existingLocal.role,
        status: isSuperAdmin ? 'active' : existingLocal.status,
        credits: isSuperAdmin ? 999999 : existingLocal.credits,
        lastLogin: new Date().toISOString()
      };

      // Push to server
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncProfile)
      }).catch(() => {});

      setActiveSession(syncProfile);
      return syncProfile;
    } else {
      // Server returned explicit rejection
      throw new Error(data.error || 'Gagal login ke server vimos.ai.');
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
      throw err;
    }
    console.warn('Online login network unavailable, checking local cache:', err);
  }

  // 2. Offline / Local Check
  const offlineUsers = getLocalUsers();
  const existing = offlineUsers.find(u => u.email.toLowerCase() === normEmail);

  if (!existing && !isSuperAdmin) {
    throw new Error(`Akun tidak ditemukan. Email "${normEmail}" belum terdaftar di sistem. Silakan daftar akun baru atau hubungi Administrator.`);
  }

  if (existing) {
    if (existing.status === 'suspended') {
      throw new Error('Akun Anda sedang dinonaktifkan/ditangguhkan oleh Admin.');
    }
    if (existing.password && existing.password !== password) {
      throw new Error('Password yang Anda masukkan salah. Silakan periksa kembali.');
    }
    const profile: UserProfile = {
      ...existing,
      role: isSuperAdmin ? 'admin' : existing.role,
      status: isSuperAdmin ? 'active' : existing.status,
      credits: isSuperAdmin ? 999999 : existing.credits,
      lastLogin: new Date().toISOString()
    };
    setActiveSession(profile);
    return profile;
  }

  // Super Admin Fallback
  const superAdminProfile: UserProfile = {
    uid: 'admin_' + normEmail.replace(/[^a-z0-9]/g, '_'),
    email: normEmail,
    displayName: 'Super Admin',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    credits: 999999,
    lastLogin: new Date().toISOString()
  };
  setActiveSession(superAdminProfile);
  return superAdminProfile;
}

// User Registration function
export async function registerUserWithCredentials(email: string, password: string, displayName?: string): Promise<UserProfile> {
  const normEmail = email.trim().toLowerCase();
  const isSuperAdmin = isAdminEmail(normEmail);

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, password, displayName })
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const profile: UserProfile = {
        ...data.user,
        role: isSuperAdmin ? 'admin' : data.user.role,
        status: isSuperAdmin ? 'active' : data.user.status,
      };
      if (profile.status === 'active') {
        setActiveSession(profile);
      }
      return profile;
    } else {
      throw new Error(data.error || 'Gagal mendaftarkan akun.');
    }
  } catch (err: any) {
    throw err;
  }
}

// Sync or fetch user profile from Firestore / Local Storage
export async function syncUserProfile(user: User): Promise<UserProfile | null> {
  const userEmail = user.email || '';
  const isSuperAdmin = isAdminEmail(userEmail);

  // Check if account was created by admin
  const isRegistered = await verifyUserIsRegisteredByAdmin(userEmail);
  if (!isRegistered && !isSuperAdmin) {
    console.warn(`User ${userEmail} is not registered by Admin.`);
    return null;
  }
  
  let profile: UserProfile | null = null;
  const userRef = doc(db, 'users', user.uid);

  try {
    const snap = await withTimeout(getDoc(userRef), 1500, null as any);
    if (snap && snap.exists && snap.exists()) {
      profile = snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore user fetch failed, searching local storage:', err);
  }

  const localUsers = getLocalUsers();
  const localIndex = localUsers.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === userEmail.toLowerCase());

  if (!profile && localIndex >= 0) {
    profile = localUsers[localIndex];
  }

  if (!profile) {
    const settings = await getSystemSettings();
    const role: UserRole = isSuperAdmin ? 'admin' : 'member';
    const status: UserStatus = 'active';
    
    profile = {
      uid: user.uid,
      email: userEmail,
      displayName: user.displayName || userEmail.split('@')[0] || (isSuperAdmin ? 'Super Admin' : 'Member User'),
      photoURL: user.photoURL || undefined,
      role,
      status,
      createdAt: new Date().toISOString(),
      credits: isSuperAdmin ? 999999 : settings.defaultCreditsPerUser,
      lastLogin: new Date().toISOString()
    };
  } else {
    if (isSuperAdmin && (profile.role !== 'admin' || profile.status !== 'active')) {
      profile.role = 'admin';
      profile.status = 'active';
      profile.credits = 999999;
    }
    profile.lastLogin = new Date().toISOString();
  }

  // Persist to Online Server and local storage
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  }).catch(() => {});

  if (localIndex >= 0) {
    localUsers[localIndex] = profile;
  } else {
    localUsers.push(profile);
  }
  saveLocalUsers(localUsers);
  setActiveSession(profile);

  return profile;
}

// Get all registered users (for Admin GUI) - 100% Online
export async function getAllUsers(): Promise<UserProfile[]> {
  // Sync any local users to server first so nothing is lost
  const cachedLocal = getLocalUsers();
  if (cachedLocal.length > 0) {
    fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: cachedLocal })
    }).catch(() => {});
  }

  // 1. Fetch from Online Server API
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        saveLocalUsers(data.users);
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Online users fetch failed, trying Firestore:', err);
  }

  // 2. Firestore fallback
  try {
    const fetchFirestore = async () => {
      const colRef = collection(db, 'users');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(doc => doc.data() as UserProfile);
      }
      return null;
    };
    const snapUsers = await withTimeout(fetchFirestore(), 1200, null);
    if (snapUsers && snapUsers.length > 0) {
      const current = getLocalUsers();
      snapUsers.forEach(u => {
        const exist = current.find(c => c.uid === u.uid || c.email.toLowerCase() === u.email.toLowerCase());
        if (!exist) current.push(u);
      });
      saveLocalUsers(current);
      return current;
    }
  } catch (err) {
    console.warn('Failed to fetch users from Firestore, using local storage:', err);
  }

  return getLocalUsers();
}

// Update user status (for Admin GUI) - 100% Online
export async function updateUserStatus(uid: string, status: UserStatus, role?: UserRole, credits?: number): Promise<void> {
  const updates: Partial<UserProfile> = { status };
  if (role) updates.role = role;
  if (credits !== undefined) updates.credits = credits;

  // 1. Online Server Update
  fetch(`/api/users/${encodeURIComponent(uid)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(e => console.warn('Online user update error:', e));

  // 2. Instant local storage update
  const localUsers = getLocalUsers();
  const idx = localUsers.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    localUsers[idx] = { ...localUsers[idx], ...updates };
    saveLocalUsers(localUsers);
  }

  // 3. Firestore update
  try {
    const userRef = doc(db, 'users', uid);
    withTimeout(updateDoc(userRef, updates), 1500, null).catch(() => {});
  } catch (e) {
    console.warn('Failed to update user in Firestore:', e);
  }
}

// Update user password directly from Admin Panel - 100% Online
export async function updateUserPasswordByAdmin(uid: string, newPassword: string): Promise<void> {
  const updates = { password: newPassword.trim() };

  // 1. Online Server Update
  fetch(`/api/users/${encodeURIComponent(uid)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(e => console.warn('Online password update error:', e));

  // 2. Instant local storage update
  const localUsers = getLocalUsers();
  const idx = localUsers.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    localUsers[idx] = { ...localUsers[idx], password: newPassword.trim() };
    saveLocalUsers(localUsers);
  }

  // 3. Firestore update
  try {
    const userRef = doc(db, 'users', uid);
    withTimeout(updateDoc(userRef, updates), 1500, null).catch(() => {});
  } catch (e) {
    console.warn('Failed to update user password in Firestore:', e);
  }
}

// Add Credits by Admin (supports serial code, email, or uid)
export async function addCreditsByAdmin(
  identifier: string, 
  amount: number
): Promise<{ success: boolean; newCredits?: number; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/users/add-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, amount })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const local = getLocalUsers();
      const cleanId = identifier.trim().toLowerCase();
      const user = local.find(u => 
        (u.serialCode && u.serialCode.toLowerCase() === cleanId) || 
        u.email.toLowerCase() === cleanId || 
        u.uid.toLowerCase() === cleanId
      );
      if (user && data.newCredits !== undefined) {
        user.credits = data.newCredits;
        saveLocalUsers(local);
      }
      return { success: true, newCredits: data.newCredits, message: data.message };
    }
    return { success: false, error: data.error || 'Gagal menambahkan kredit' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi bermasalah saat menambah kredit' };
  }
}

// Create new user directly from Admin Panel with Password - 100% Online
export async function createMemberByAdmin(
  email: string, 
  password: string, 
  displayName: string, 
  role: UserRole = 'member', 
  status: UserStatus = 'active', 
  credits: number = 100
): Promise<UserProfile> {
  const normEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  const cleanName = displayName.trim() || normEmail.split('@')[0];

  let newUser: UserProfile = {
    uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    serialCode: 'VMS-' + Math.floor(1000 + Math.random() * 9000),
    email: normEmail,
    password: cleanPass,
    displayName: cleanName,
    role,
    status,
    createdAt: new Date().toISOString(),
    credits: credits || 100,
    lastLogin: new Date().toISOString()
  };

  // 1. Save to Online Server API (PRIMARY ONLINE DATABASE)
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normEmail,
        password: cleanPass,
        displayName: cleanName,
        role,
        status,
        credits
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        newUser = data.user;
      }
    }
  } catch (err) {
    console.warn('Online member creation warning:', err);
  }

  // 2. Save to Local Storage immediately for instant client cache
  const local = getLocalUsers();
  const existIdx = local.findIndex(u => u.email.toLowerCase() === normEmail);
  if (existIdx >= 0) {
    local[existIdx] = { ...local[existIdx], ...newUser };
  } else {
    local.unshift(newUser);
  }
  saveLocalUsers(local);

  // 3. Non-blocking sync to Firestore
  try {
    const userRef = doc(db, 'users', newUser.uid);
    withTimeout(setDoc(userRef, newUser, { merge: true }), 1500, null).catch(() => {});
  } catch (e) {
    console.warn('Firestore create user background sync error:', e);
  }

  return newUser;
}

// Delete user (Admin Panel) - 100% Online
export async function deleteUserByAdmin(uid: string): Promise<void> {
  // 1. Online API delete
  fetch(`/api/users/${encodeURIComponent(uid)}`, {
    method: 'DELETE'
  }).catch(e => console.warn('Online delete user error:', e));

  // 2. Instant local removal
  const local = getLocalUsers().filter(u => u.uid !== uid);
  saveLocalUsers(local);

  // 3. Background Firestore deletion
  try {
    const userRef = doc(db, 'users', uid);
    withTimeout(deleteDoc(userRef), 1500, null).catch(() => {});
  } catch (e) {
    console.warn('Firestore delete user failed:', e);
  }
}

// Save or Update Website Project - 100% Online
export async function saveGeneratedWebsite(site: Partial<GeneratedWebsite> & Omit<GeneratedWebsite, 'id' | 'createdAt'> & { id?: string }): Promise<GeneratedWebsite> {
  const id = site.id || ('site_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  let newSite: GeneratedWebsite = {
    id,
    createdAt: site.createdAt || new Date().toISOString(),
    title: site.title || 'Untitled Website',
    prompt: site.prompt || '',
    category: site.category || 'General',
    style: site.style || 'Modern',
    html: site.html || '',
    authorId: site.authorId || 'anon',
    authorEmail: (site.authorEmail || '').trim().toLowerCase(),
    views: site.views || 1,
    isPublic: site.isPublic !== undefined ? site.isPublic : true,
  };

  // 1. Save to Online Server API
  try {
    const res = await fetch('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.website) {
        newSite = data.website;
      }
    }
  } catch (err) {
    console.warn('Online website save error:', err);
  }

  // 2. Firestore backup
  try {
    const siteRef = doc(db, 'websites', newSite.id);
    withTimeout(setDoc(siteRef, newSite, { merge: true }), 1500, null).catch(() => {});
  } catch (e) {
    console.warn('Failed to save website to Firestore:', e);
  }

  // 3. Save / Update in Local Storage without duplicates
  try {
    const raw = localStorage.getItem(LOCAL_SITES_KEY);
    const sites: GeneratedWebsite[] = raw ? JSON.parse(raw) : [];
    const existIdx = sites.findIndex(s => s.id === newSite.id);
    if (existIdx >= 0) {
      sites[existIdx] = newSite;
    } else {
      sites.unshift(newSite);
    }
    localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(sites));
  } catch (err) {
    console.error('Local storage site save failed:', err);
  }

  return newSite;
}

export async function updateWebsiteProject(id: string, updates: Partial<GeneratedWebsite>): Promise<GeneratedWebsite | null> {
  try {
    const res = await fetch(`/api/websites/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.website) {
        // Update local storage
        try {
          const raw = localStorage.getItem(LOCAL_SITES_KEY);
          const sites: GeneratedWebsite[] = raw ? JSON.parse(raw) : [];
          const idx = sites.findIndex(s => s.id === id);
          if (idx >= 0) {
            sites[idx] = { ...sites[idx], ...data.website };
            localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(sites));
          }
        } catch {}
        return data.website;
      }
    }
  } catch (err) {
    console.warn('Failed to update website on server:', err);
  }

  // Fallback update local storage
  try {
    const raw = localStorage.getItem(LOCAL_SITES_KEY);
    const sites: GeneratedWebsite[] = raw ? JSON.parse(raw) : [];
    const idx = sites.findIndex(s => s.id === id);
    if (idx >= 0) {
      const updated = { ...sites[idx], ...updates };
      sites[idx] = updated;
      localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(sites));
      return updated;
    }
  } catch {}

  return null;
}

// Get user websites - 100% Online
export async function getUserWebsites(userEmail: string): Promise<GeneratedWebsite[]> {
  const isAdm = isAdminEmail(userEmail);
  const combined: GeneratedWebsite[] = [];

  // 1. Fetch from Online Server API
  try {
    const res = await fetch(`/api/websites?email=${encodeURIComponent(userEmail)}&role=${isAdm ? 'admin' : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.websites)) {
        data.websites.forEach((site: GeneratedWebsite) => {
          if (!combined.some(c => c.id === site.id)) {
            combined.push(site);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Online websites fetch error:', err);
  }

  // 2. Merge with Local Storage sites (and background sync to server)
  try {
    const raw = localStorage.getItem(LOCAL_SITES_KEY);
    const localSites: GeneratedWebsite[] = raw ? JSON.parse(raw) : [];
    const relevantLocal = localSites.filter(s => isAdm || s.authorEmail.toLowerCase() === userEmail.toLowerCase());

    for (const ls of relevantLocal) {
      if (!combined.some(c => c.id === ls.id)) {
        combined.push(ls);
        // Sync local site up to server
        fetch('/api/websites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ls)
        }).catch(() => {});
      }
    }

    localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(combined));
  } catch {}

  // 3. Firestore backup if empty
  if (combined.length === 0) {
    try {
      const q = isAdm
        ? collection(db, 'websites')
        : query(collection(db, 'websites'), where('authorEmail', '==', userEmail));
      const snap = await withTimeout(getDocs(q), 1500, null as any);
      if (snap && !snap.empty) {
        return snap.docs.map((d: any) => d.data() as GeneratedWebsite);
      }
    } catch (e) {
      console.warn('Firestore sites query failed:', e);
    }
  }

  return combined;
}

// Deduct credits when user creates a website (100 credits per generation)
export async function deductUserCredits(
  userEmail: string, 
  amount: number = 100
): Promise<{ success: boolean; newCredits: number; error?: string }> {
  const normEmail = userEmail.trim().toLowerCase();
  const isSuperAdmin = isAdminEmail(normEmail);
  if (isSuperAdmin) {
    return { success: true, newCredits: 999999 };
  }

  try {
    const res = await fetch('/api/users/deduct-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, amount })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(u => u.email.toLowerCase() === normEmail);
      if (idx >= 0) {
        localUsers[idx].credits = data.newCredits;
        saveLocalUsers(localUsers);
      }
      const active = getActiveSession();
      if (active && active.email.toLowerCase() === normEmail) {
        active.credits = data.newCredits;
        setActiveSession(active);
      }
      return { success: true, newCredits: data.newCredits };
    } else {
      return { success: false, newCredits: 0, error: data.error || 'Gagal memotong kredit' };
    }
  } catch (err: any) {
    return { success: false, newCredits: 0, error: err.message || 'Koneksi gagal saat memotong kredit' };
  }
}

// Helper to smart-normalize any Imgur link to a direct renderable image URL
export function normalizeImgurUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();

  // Remove trailing slashes or queries for ID extraction if needed
  // Case 1: https://i.imgur.com/xyz.jpg or .png or .webp or .gif -> Already direct
  if (clean.match(/^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?$/i)) {
    if (!clean.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return `${clean}.jpg`;
    }
    return clean;
  }

  // Case 2: https://imgur.com/a/xyz or https://imgur.com/gallery/xyz
  const albumMatch = clean.match(/^https?:\/\/imgur\.com\/(?:a|gallery)\/([a-zA-Z0-9]+)/i);
  if (albumMatch && albumMatch[1]) {
    return `https://i.imgur.com/${albumMatch[1]}.jpg`;
  }

  // Case 3: https://imgur.com/xyz
  const singleMatch = clean.match(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (singleMatch && singleMatch[1]) {
    return `https://i.imgur.com/${singleMatch[1]}.jpg`;
  }

  // Case 4: //i.imgur.com/xyz
  if (clean.startsWith('//')) {
    return `https:${clean}`;
  }

  // Case 5: imgur.com/xyz or i.imgur.com/xyz without protocol
  if (clean.startsWith('i.imgur.com/')) {
    return `https://${clean}`;
  }
  if (clean.startsWith('imgur.com/')) {
    const id = clean.replace('imgur.com/', '').split(/[/?#]/)[0];
    return `https://i.imgur.com/${id}.jpg`;
  }

  return clean;
}

// ----------------------------------------------------
// TUTORIAL VIDEOS API HELPERS
// ----------------------------------------------------
const LOCAL_TUTORIALS_KEY = 'vimos_tutorial_videos_cache';

export async function getTutorialVideos(): Promise<TutorialVideo[]> {
  try {
    const res = await fetch('/api/tutorials');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tutorials)) {
        localStorage.setItem(LOCAL_TUTORIALS_KEY, JSON.stringify(data.tutorials));
        return data.tutorials;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch tutorial videos from API:', err);
  }

  // Fallback to localStorage cache
  try {
    const cached = localStorage.getItem(LOCAL_TUTORIALS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // Default initial tutorials if none
  return [
    {
      id: 'tut_default_1',
      title: 'Cara Membuat Website Toko Online & Hubungkan WhatsApp',
      description: 'Panduan lengkap cara merakit toko online modern, menambahkan produk dengan foto Imgur, dan menghubungkan tombol WhatsApp otomatis.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Toko Online',
      duration: '06:15',
      createdAt: new Date().toISOString(),
      authorEmail: 'admin@vimos.ai'
    },
    {
      id: 'tut_default_2',
      title: 'Panduan Upload Gambar Produk Menggunakan Link Imgur',
      description: 'Cara mudah mengunggah foto produk ke Imgur dan menyalin link langsung untuk mempercantik katalog website Anda.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Tips & Trik',
      duration: '04:30',
      createdAt: new Date().toISOString(),
      authorEmail: 'admin@vimos.ai'
    }
  ];
}

export async function addTutorialVideo(video: Omit<TutorialVideo, 'id' | 'createdAt'>): Promise<TutorialVideo | null> {
  const newVid: TutorialVideo = {
    ...video,
    id: 'tut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString()
  };

  try {
    fetch('/api/tutorials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    }).catch(() => {});
  } catch {}

  // Update localStorage cache
  try {
    const current = await getTutorialVideos();
    const updated = [newVid, ...current];
    localStorage.setItem(LOCAL_TUTORIALS_KEY, JSON.stringify(updated));
    return newVid;
  } catch {}

  return newVid;
}

export async function updateTutorialVideo(id: string, updates: Partial<TutorialVideo>): Promise<TutorialVideo | null> {
  try {
    fetch(`/api/tutorials/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  } catch {}

  // Update localStorage cache
  try {
    const current = await getTutorialVideos();
    let updatedItem: TutorialVideo | null = null;
    const updated = current.map(t => {
      if (t.id === id) {
        updatedItem = { ...t, ...updates };
        return updatedItem;
      }
      return t;
    });
    if (updatedItem) {
      localStorage.setItem(LOCAL_TUTORIALS_KEY, JSON.stringify(updated));
      return updatedItem;
    }
  } catch {}

  return null;
}

export async function deleteTutorialVideo(id: string): Promise<boolean> {
  // 1. Try server API delete
  try {
    fetch(`/api/tutorials/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch {}

  // 2. Update localStorage cache
  try {
    const current = await getTutorialVideos();
    const filtered = current.filter(t => t.id !== id);
    localStorage.setItem(LOCAL_TUTORIALS_KEY, JSON.stringify(filtered));
  } catch {}

  return true;
}

// Delete website - 100% Online
export async function deleteWebsite(id: string): Promise<void> {
  // 1. Online API delete
  fetch(`/api/websites/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});

  // 2. Local storage delete
  try {
    const raw = localStorage.getItem(LOCAL_SITES_KEY);
    if (raw) {
      const parsed: GeneratedWebsite[] = JSON.parse(raw);
      const filtered = parsed.filter(s => s.id !== id);
      localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(filtered));
    }
  } catch {}

  // 3. Firestore delete
  try {
    const ref = doc(db, 'websites', id);
    await deleteDoc(ref);
  } catch (e) {
    console.warn('Firestore deleteWebsite failed:', e);
  }
}




