import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { 
  getDatabase, 
  saveDatabase, 
  isSuperAdminEmail, 
  generateSerialCode,
  UserRecord, 
  WebsiteRecord 
} from './src/server-db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Ensure public uploads directory exists and is statically served
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Imgur Client ID pool for robust public image hosting
const IMGUR_CLIENT_IDS = [
  '546c25a59c58ad7',
  'e9998ea322e70bf',
  '28eb2add3a7c644',
  'c942858b975ec0b',
  'b025d57b324cb89'
];

export async function uploadToPublicImgur(rawBase64OrBuffer: string | Buffer): Promise<string | null> {
  let cleanBase64 = '';
  if (Buffer.isBuffer(rawBase64OrBuffer)) {
    cleanBase64 = rawBase64OrBuffer.toString('base64');
  } else if (typeof rawBase64OrBuffer === 'string') {
    cleanBase64 = rawBase64OrBuffer.replace(/^data:([A-Za-z-+\/]+);base64,/, '').trim();
  }

  if (!cleanBase64) return null;

  for (const clientId of IMGUR_CLIENT_IDS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${clientId}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          image: cleanBase64,
          type: 'base64'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json() as any;
        if (json && json.success && json.data && json.data.link) {
          let link = String(json.data.link);
          if (link.startsWith('http://')) link = link.replace('http://', 'https://');
          console.log(`[vimos.ai] Successfully uploaded image to Imgur CDN: ${link}`);
          return link;
        }
      }
    } catch (e: any) {
      console.warn(`[vimos.ai] Imgur upload with client ID ${clientId} failed:`, e?.message || e);
    }
  }

  return null;
}

// Image Upload Endpoint - Returns real public direct link (Imgur CDN) viewable on any website
app.post('/api/upload-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'jpg';
    let dataBuffer: Buffer;
    let cleanBase64 = imageBase64;

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      dataBuffer = Buffer.from(matches[2], 'base64');
      cleanBase64 = matches[2];
    } else {
      dataBuffer = Buffer.from(imageBase64, 'base64');
      cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    }

    // 1. Primary: Upload to Imgur for a real, permanent, globally accessible direct link
    const imgurUrl = await uploadToPublicImgur(cleanBase64);

    // 2. Redundancy: save local copy on disk
    const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, dataBuffer);

    if (imgurUrl) {
      console.log(`[vimos.ai] Uploaded image successfully to Imgur: ${imgurUrl}`);
      res.json({
        success: true,
        url: imgurUrl,
        directUrl: imgurUrl,
        provider: 'imgur',
        isPublic: true,
        message: 'Gambar berhasil diupload ke server CDN publik (Imgur). Link ini asli dan dapat dilihat di web manapun!'
      });
      return;
    }

    // 3. Fallback: Return absolute URL so it works in external contexts
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const absoluteServerUrl = `${protocol}://${host}/uploads/${safeFilename}`;
    console.log(`[vimos.ai] Uploaded image saved locally with absolute URL: ${absoluteServerUrl}`);

    res.json({
      success: true,
      url: absoluteServerUrl,
      directUrl: absoluteServerUrl,
      provider: 'server',
      isPublic: true,
      message: 'Gambar tersimpan dengan link penuh.'
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: err?.message || 'Failed to upload image' });
  }
});

// Initialize Google GenAI SDK (Server-Side)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Templates endpoint
app.get('/api/templates', (_req: Request, res: Response) => {
  const templates = [
    {
      id: 'saas-dark',
      title: 'SaaS AI Platform',
      category: 'SaaS / AI',
      style: 'Modern Tech Dark',
      description: 'Futuristic AI SaaS landing page with animated hero glowing gradients, pricing tiers, and live feature showcase.',
      prompt: 'Build a high-converting dark-mode landing page for an AI Automation SaaS named "Vortex AI". Include hero banner with call to action, interactive feature tabs, pricing plan cards with annual discount toggle, client logos, testmonials carousel, and contact footer.',
      iconName: 'Zap'
    },
    {
      id: 'ecommerce-fashion',
      title: 'Luxe Fashion Store',
      category: 'E-Commerce',
      style: 'Luxury Minimal',
      description: 'Elegant fashion brand homepage with product grid, interactive cart slide-over, filter badges, and hero slider.',
      prompt: 'Create a luxury high-end fashion e-commerce storefront called "AURA Atelier". Minimalist beige and obsidian aesthetic, hero video placeholder with clean copy, trending products grid with hover quick-add buttons, lookbook section, customer reviews, and newsletter subscription form.',
      iconName: 'ShoppingBag'
    },
    {
      id: 'creative-portfolio',
      title: 'Designer Portfolio',
      category: 'Portfolio',
      style: 'Creative Gradient',
      description: 'Interactive portfolio for UI/UX designers or developers with project filter, smooth animations, and bio.',
      prompt: 'Design a sleek creative portfolio for a Senior Product Designer named "Alex Rivera". Dark aesthetic with vibrant cyan and violet neon accents, project filterable grid (Web, Mobile, Branding), interactive case study modal triggers, skills radar section, work experience timeline, and contact form.',
      iconName: 'Briefcase'
    },
    {
      id: 'restaurant-bistro',
      title: 'Gourmet Bistro & Bar',
      category: 'Restaurant',
      style: 'Warm Elegant',
      description: 'Sophisticated restaurant website with online reservation modal, interactive food menu tabs, and map section.',
      prompt: 'Build a warm, appetizing website for "Lumière French Bistro". Deep charcoal and amber gold theme, interactive food & wine menu with category tabs (Appetizers, Mains, Desserts, Cocktails), table reservation form, chef profile, gallery grid, and location details.',
      iconName: 'Utensils'
    },
    {
      id: 'mobile-app-showcase',
      title: 'FitPulse Mobile App',
      category: 'Mobile App',
      style: 'Clean Corporate',
      description: 'High-converting mobile app showcase page with app store buttons, device mockups, and feature callouts.',
      prompt: 'Create a landing page for "FitPulse AI" fitness tracking mobile app. Include phone mockup visuals, App Store and Play Store badges, interactive feature cards (AI Workout Plans, Live Calorie Counter, Social Challenges), user stats counters, FAQ accordion, and download CTA.',
      iconName: 'Smartphone'
    },
    {
      id: 'agency-digital',
      title: 'Nexus Digital Agency',
      category: 'Agency',
      style: 'Cyberpunk Neon',
      description: 'Bold creative digital agency website with client case studies, service cards, and interactive quote calculator.',
      prompt: 'Build a high-energy digital agency website called "Nexus Creative". Dark mode with neon emerald and purple accents, hero section with animated particle effect feel, services grid (Web Dev, AI Integration, Brand Strategy), interactive project cost estimator widget, team section, and contact form.',
      iconName: 'LayoutGrid'
    }
  ];

  res.json({ templates });
});

// ==========================================
// ONLINE DATABASE & AUTHENTICATION ENDPOINTS
// ==========================================

// 1. Verify User Registration Status
app.post('/api/auth/verify-registration', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ registered: false, error: 'Email required' });
    return;
  }
  const normEmail = email.trim().toLowerCase();
  if (isSuperAdminEmail(normEmail)) {
    res.json({ registered: true, isSuperAdmin: true });
    return;
  }
  const dbData = getDatabase();
  const exists = dbData.users.some(u => u.email.toLowerCase() === normEmail);
  res.json({ registered: exists });
});

// 2. Online Login Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email wajib diisi' });
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const dbData = getDatabase();
    let user = dbData.users.find(u => u.email.toLowerCase() === normEmail);

    // If email is super admin and not in DB, seed super admin account
    if (!user && isSuperAdminEmail(normEmail)) {
      user = {
        uid: `admin_${Date.now()}_${normEmail.replace(/[^a-z0-9]/g, '_')}`,
        email: normEmail,
        displayName: `Super Admin (${normEmail.split('@')[0]})`,
        password: cleanPassword || 'admin',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        credits: 999999,
        lastLogin: new Date().toISOString()
      };
      dbData.users.push(user);
      saveDatabase(dbData);
    }

    // STRICT CHECK: If user does not exist, reject with 404
    if (!user) {
      res.status(404).json({
        error: `Akun tidak ditemukan. Email "${normEmail}" belum terdaftar di sistem vimos.ai. Silakan hubungi Administrator untuk pembuatan akun.`
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        error: 'Akun Anda sedang dinonaktifkan / ditangguhkan oleh Admin. Silakan hubungi Admin.'
      });
      return;
    }

    if (user.status === 'pending') {
      res.status(403).json({
        error: 'Akun Anda masih menunggu verifikasi / persetujuan dari Administrator.'
      });
      return;
    }

    // Check password
    if (user.password) {
      if (user.password !== cleanPassword) {
        res.status(401).json({
          error: 'Password yang Anda masukkan salah. Silakan periksa kembali password Anda.'
        });
        return;
      }
    } else {
      // If user had no password yet, set it on first login
      user.password = cleanPassword;
    }

    user.lastLogin = new Date().toISOString();
    saveDatabase(dbData);

    console.log(`[Online Auth] User logged in successfully: ${normEmail} (role: ${user.role})`);
    res.json({ success: true, user });
  } catch (err: any) {
    console.error('[Online Auth] Login error:', err);
    res.status(500).json({ error: err?.message || 'Gagal login ke server' });
  }
});

// 2a. Online Register Endpoint
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi!' });
      return;
    }

    const normEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    if (cleanPassword.length < 4) {
      res.status(400).json({ error: 'Password minimal 4 karakter!' });
      return;
    }

    const dbData = getDatabase();
    const existing = dbData.users.find(u => u.email.trim().toLowerCase() === normEmail);
    if (existing) {
      res.status(400).json({ error: `Email "${normEmail}" sudah terdaftar. Silakan langsung login.` });
      return;
    }

    const isSuper = isSuperAdminEmail(normEmail);
    const requireApproval = dbData.settings?.requireApprovalForNewUsers ?? false;
    const defaultCredits = dbData.settings?.defaultCreditsPerUser ?? 0;

    const newUser: UserRecord = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serialCode: isSuper ? `VMS-000${dbData.users.length + 1}` : generateSerialCode(dbData.users),
      email: normEmail,
      password: cleanPassword,
      displayName: displayName?.trim() || normEmail.split('@')[0],
      role: isSuper ? 'admin' : 'member',
      status: isSuper ? 'active' : (requireApproval ? 'pending' : 'active'),
      createdAt: new Date().toISOString(),
      credits: isSuper ? 999999 : 0, // Explicitly 0 credits upon registration
      lastLogin: new Date().toISOString()
    };

    dbData.users.unshift(newUser);
    saveDatabase(dbData);

    console.log(`[Online Auth] New user registered: ${normEmail} (${newUser.serialCode}, status: ${newUser.status})`);
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    console.error('[Online Auth] Register error:', err);
    res.status(500).json({ error: err?.message || 'Gagal mendaftarkan akun' });
  }
});

// 2b. Direct Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ error: 'Email dan password baru wajib diisi!' });
      return;
    }
    const normEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const dbData = getDatabase();
    const user = dbData.users.find(u => u.email.toLowerCase() === normEmail);

    if (!user) {
      res.status(404).json({ error: 'Akun tidak ditemukan. Silakan hubungi Administrator untuk pembuatan akun.' });
      return;
    }

    user.password = cleanPassword;
    user.lastLogin = new Date().toISOString();
    if (user.status === 'suspended') user.status = 'active';

    saveDatabase(dbData);
    console.log(`[Online Auth] Password updated for user: ${normEmail}`);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gagal mereset password' });
  }
});

// 3. Batch Sync endpoint (to import existing accounts from client local cache)
app.post('/api/auth/sync', (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    if (Array.isArray(users) && users.length > 0) {
      const dbData = getDatabase();
      let added = 0;
      users.forEach((incoming: any) => {
        if (!incoming.email) return;
        const norm = incoming.email.trim().toLowerCase();
        const existing = dbData.users.find(u => u.email.toLowerCase() === norm);
        if (!existing) {
          dbData.users.push({
            uid: incoming.uid || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            email: norm,
            password: incoming.password || '',
            displayName: incoming.displayName || norm.split('@')[0],
            role: incoming.role || (isSuperAdminEmail(norm) ? 'admin' : 'member'),
            status: incoming.status || 'active',
            createdAt: incoming.createdAt || new Date().toISOString(),
            credits: incoming.credits ?? (isSuperAdminEmail(norm) ? 999999 : 0),
            lastLogin: incoming.lastLogin || new Date().toISOString()
          });
          added++;
        } else {
          // If existing user has no password but incoming user has one, sync it
          if (!existing.password && incoming.password) {
            existing.password = incoming.password;
          }
        }
      });
      if (added > 0) {
        saveDatabase(dbData);
        console.log(`[Online Auth] Synced and added ${added} users from client to online server DB`);
      }
    }
    const current = getDatabase();
    res.json({ success: true, totalUsers: current.users.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get All Users (Admin GUI)
app.get('/api/users', (_req: Request, res: Response) => {
  try {
    const dbData = getDatabase();
    res.json({ success: true, users: dbData.users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Create New Member/Admin (Admin GUI)
app.post('/api/users', (req: Request, res: Response) => {
  try {
    const { email, password, displayName, role, status, credits } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi!' });
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const dbData = getDatabase();
    const isSuper = isSuperAdminEmail(normEmail);

    let user = dbData.users.find(u => u.email.toLowerCase() === normEmail);
    if (user) {
      user.password = cleanPassword;
      if (displayName) user.displayName = displayName.trim();
      user.role = isSuper ? 'admin' : (role || user.role);
      user.status = isSuper ? 'active' : (status || user.status);
      if (credits !== undefined) user.credits = Number(credits);
      if (!user.serialCode) {
        user.serialCode = isSuper ? `VMS-000${dbData.users.indexOf(user) + 1}` : generateSerialCode(dbData.users);
      }
    } else {
      user = {
        uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        serialCode: isSuper ? `VMS-000${dbData.users.length + 1}` : generateSerialCode(dbData.users),
        email: normEmail,
        password: cleanPassword,
        displayName: displayName?.trim() || normEmail.split('@')[0],
        role: isSuper ? 'admin' : (role || 'member'),
        status: isSuper ? 'active' : (status || 'active'),
        createdAt: new Date().toISOString(),
        credits: credits !== undefined ? Number(credits) : 0,
        lastLogin: new Date().toISOString()
      };
      dbData.users.unshift(user);
    }

    saveDatabase(dbData);
    console.log(`[Online Admin] Created/updated user: ${normEmail} (${user.serialCode}) (role: ${user.role}, status: ${user.status})`);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update User Profile (Role, Status, Credits, Password)
app.put('/api/users/:uid', (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const cleanParam = String(uid).trim().toLowerCase();
    const { status, role, credits, password, displayName } = req.body;
    const dbData = getDatabase();
    const user = dbData.users.find(u => 
      u.uid.toLowerCase() === cleanParam || 
      u.email.toLowerCase() === cleanParam ||
      (u.serialCode && u.serialCode.toLowerCase() === cleanParam)
    );

    if (!user) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      return;
    }

    const isSuper = isSuperAdminEmail(user.email);
    if (status && !isSuper) user.status = status;
    if (role && !isSuper) user.role = role;
    if (credits !== undefined) user.credits = Number(credits);
    if (password) user.password = password.trim();
    if (displayName) user.displayName = displayName.trim();

    saveDatabase(dbData);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete User (supports uid, email, or serialCode)
app.delete('/api/users/:uid', (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const cleanParam = String(uid).trim().toLowerCase();
    const dbData = getDatabase();
    const target = dbData.users.find(u => 
      u.uid.toLowerCase() === cleanParam || 
      u.email.toLowerCase() === cleanParam ||
      (u.serialCode && u.serialCode.toLowerCase() === cleanParam)
    );

    if (!target) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      return;
    }

    if (isSuperAdminEmail(target.email)) {
      res.status(400).json({ error: 'Tidak dapat menghapus akun Super Admin!' });
      return;
    }

    dbData.users = dbData.users.filter(u => u.uid !== target.uid);
    saveDatabase(dbData);
    console.log(`[Online Admin] Deleted user: ${target.email} (${target.serialCode})`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7c. Quick Top-Up Credits by Serial Code, Email, or UID (Admin only)
app.post('/api/users/add-credits', (req: Request, res: Response) => {
  try {
    const { identifier, amount, mode = 'add' } = req.body;
    if (!identifier || amount === undefined) {
      res.status(400).json({ error: 'Kode Seri / Email / ID akun dan jumlah kredit wajib diisi' });
      return;
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const val = Number(amount);
    if (isNaN(val) || (mode === 'add' && val <= 0) || (mode === 'set' && val < 0)) {
      res.status(400).json({ error: 'Jumlah kredit harus berupa angka yang valid' });
      return;
    }

    const dbData = getDatabase();
    const user = dbData.users.find(u => 
      (u.serialCode && u.serialCode.toLowerCase() === cleanId) ||
      u.email.toLowerCase() === cleanId ||
      u.uid.toLowerCase() === cleanId
    );

    if (!user) {
      res.status(404).json({ error: `Pengguna dengan Kode Seri atau Email "${identifier}" tidak ditemukan` });
      return;
    }

    if (isSuperAdminEmail(user.email)) {
      res.json({ 
        success: true, 
        user, 
        message: 'Super Admin sudah memiliki kredit tak terbatas (Unlimited)' 
      });
      return;
    }

    if (mode === 'set') {
      user.credits = val;
    } else {
      user.credits = (user.credits || 0) + val;
    }
    saveDatabase(dbData);

    console.log(`[Admin Quick Top-Up] ${mode === 'set' ? 'Set' : 'Added'} ${val} credits to ${user.email} (${user.serialCode}). New balance: ${user.credits}`);
    res.json({ 
      success: true, 
      newCredits: user.credits, 
      user, 
      message: mode === 'set'
        ? `Berhasil mengatur kredit akun ${user.displayName || user.email} (${user.serialCode}) menjadi ${user.credits} Kredit.`
        : `Berhasil menambahkan +${val} kredit ke akun ${user.displayName || user.email} (${user.serialCode}). Saldo baru: ${user.credits} Kredit.` 
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gagal menambahkan kredit' });
  }
});

// 7b. Deduct User Credits (100 credits per website generated)
app.post('/api/users/deduct-credits', (req: Request, res: Response) => {
  try {
    const { email, amount = 100 } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email wajib diisi' });
      return;
    }
    const normEmail = String(email).trim().toLowerCase();
    if (isSuperAdminEmail(normEmail)) {
      res.json({ success: true, newCredits: 999999 });
      return;
    }

    const dbData = getDatabase();
    const user = dbData.users.find(u => u.email.toLowerCase() === normEmail);
    if (!user) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      return;
    }

    const currentCredits = user.credits ?? 0;
    const deductionAmount = Number(amount) || 100;
    if (currentCredits < deductionAmount) {
      res.status(400).json({
        error: `Kredit Anda tidak mencukupi. Pembuatan website membutuhkan ${deductionAmount} kredit (Sisa kredit Anda saat ini: ${currentCredits}). Silakan hubungi Administrator untuk menambah kredit.`,
        currentCredits
      });
      return;
    }

    user.credits = Math.max(0, currentCredits - deductionAmount);
    saveDatabase(dbData);

    console.log(`[Credits] Deducted ${deductionAmount} credits from ${normEmail}. Remaining: ${user.credits}`);
    res.json({ success: true, newCredits: user.credits, user });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gagal memotong kredit' });
  }
});

// 8. System Settings Endpoints
app.get('/api/settings', (_req: Request, res: Response) => {
  const dbData = getDatabase();
  res.json({ success: true, settings: dbData.settings });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const dbData = getDatabase();
  dbData.settings = { ...dbData.settings, ...req.body };
  saveDatabase(dbData);
  res.json({ success: true, settings: dbData.settings });
});

// 8b. Background Music Endpoints (Admin GUI & Members)
app.get('/api/music', (_req: Request, res: Response) => {
  try {
    const dbData = getDatabase();
    res.json({ success: true, bgMusic: dbData.settings?.bgMusic || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/music', (req: Request, res: Response) => {
  try {
    const dbData = getDatabase();
    const { enabled, title, artist, videoUrl, volume, autoplay, loop } = req.body;
    dbData.settings.bgMusic = {
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      title: title ? String(title).trim() : 'Background Music',
      artist: artist ? String(artist).trim() : 'Vimos Studio',
      videoUrl: videoUrl ? String(videoUrl).trim() : '',
      volume: typeof volume === 'number' ? Math.max(0, Math.min(100, volume)) : 30,
      autoplay: autoplay !== undefined ? Boolean(autoplay) : true,
      loop: loop !== undefined ? Boolean(loop) : true
    };
    saveDatabase(dbData);
    console.log(`[Music] Admin updated background music: ${dbData.settings.bgMusic.title} (${dbData.settings.bgMusic.videoUrl})`);
    res.json({ success: true, bgMusic: dbData.settings.bgMusic });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function getYouTubeVideoIdServer(url: string): string {
  if (!url) return '';
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|v\/|e\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=|music\.youtube\.com\/watch\?v=)([^#\&\?]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  return '';
}

function extractYouTubeThumbnail(url: string): string {
  const vidId = getYouTubeVideoIdServer(url);
  if (vidId) {
    return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
  }
  return '';
}

// 8b. Tutorial Videos Endpoints (Admin CRUD & Member View)
app.get('/api/tutorials', (_req: Request, res: Response) => {
  try {
    const dbData = getDatabase();
    res.json({ success: true, tutorials: dbData.tutorials || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tutorials', (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, category, duration, authorEmail } = req.body;
    if (!title || !videoUrl) {
      res.status(400).json({ error: 'Judul dan URL Video YouTube wajib diisi' });
      return;
    }

    const dbData = getDatabase();
    if (!dbData.tutorials) dbData.tutorials = [];

    const autoThumb = thumbnailUrl?.trim() || extractYouTubeThumbnail(videoUrl.trim()) || '';

    const newTutorial = {
      id: 'tut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      description: description?.trim() || '',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: autoThumb,
      category: category?.trim() || 'Umum',
      duration: duration?.trim() || '05:00',
      createdAt: new Date().toISOString(),
      authorEmail: authorEmail || ''
    };

    dbData.tutorials.unshift(newTutorial);
    saveDatabase(dbData);
    console.log(`[Tutorials] Added new video tutorial: ${newTutorial.title}`);
    res.json({ success: true, tutorial: newTutorial, tutorials: dbData.tutorials });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tutorials/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnailUrl, category, duration } = req.body;
    const dbData = getDatabase();
    if (!dbData.tutorials) dbData.tutorials = [];

    const tut = dbData.tutorials.find(t => t.id === id);
    if (!tut) {
      res.status(404).json({ error: 'Video tutorial tidak ditemukan' });
      return;
    }

    if (title) tut.title = title.trim();
    if (description !== undefined) tut.description = description.trim();
    if (videoUrl) {
      tut.videoUrl = videoUrl.trim();
      if (!thumbnailUrl && !tut.thumbnailUrl) {
        tut.thumbnailUrl = extractYouTubeThumbnail(tut.videoUrl);
      }
    }
    if (thumbnailUrl !== undefined) {
      tut.thumbnailUrl = thumbnailUrl.trim() || extractYouTubeThumbnail(tut.videoUrl || videoUrl || '');
    }
    if (category !== undefined) tut.category = category.trim();
    if (duration !== undefined) tut.duration = duration.trim();

    saveDatabase(dbData);
    console.log(`[Tutorials] Updated video tutorial: ${tut.title}`);
    res.json({ success: true, tutorial: tut, tutorials: dbData.tutorials });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tutorials/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbData = getDatabase();
    if (!dbData.tutorials) dbData.tutorials = [];

    dbData.tutorials = dbData.tutorials.filter(t => t.id !== id);
    saveDatabase(dbData);
    console.log(`[Tutorials] Deleted video tutorial ID: ${id}`);
    res.json({ success: true, tutorials: dbData.tutorials });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Website Projects Endpoints (Online storage)
app.get('/api/websites', (req: Request, res: Response) => {
  try {
    const { email, role, all } = req.query;
    const dbData = getDatabase();
    const userEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const userRole = typeof role === 'string' ? role : '';
    const showAll = all === 'true' || all === '1';

    // Only return all websites if explicitly requested with all=true by admin
    if (showAll && (userRole === 'admin' || isSuperAdminEmail(userEmail))) {
      res.json({ success: true, websites: dbData.websites || [] });
      return;
    }

    if (!userEmail) {
      res.json({ success: true, websites: [] });
      return;
    }

    // STRICT USER FILTER: return ONLY websites that belong to this specific user!
    const filtered = (dbData.websites || []).filter(
      w => (w.authorEmail || '').trim().toLowerCase() === userEmail
    );
    res.json({ success: true, websites: filtered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/websites', (req: Request, res: Response) => {
  try {
    const { id, title, prompt, category, style, html, authorId, authorEmail } = req.body;
    if (!html) {
      res.status(400).json({ error: 'Konten HTML website wajib diisi' });
      return;
    }

    const dbData = getDatabase();
    if (!dbData.websites) dbData.websites = [];

    // Check if website with this ID already exists -> UPDATE in place
    if (id) {
      const existingIdx = dbData.websites.findIndex(w => w.id === id);
      if (existingIdx >= 0) {
        const existing = dbData.websites[existingIdx];
        const updatedSite: WebsiteRecord = {
          ...existing,
          title: title || existing.title,
          prompt: prompt || existing.prompt,
          category: category || existing.category,
          style: style || existing.style,
          html,
          authorEmail: (authorEmail || existing.authorEmail || '').trim().toLowerCase(),
        };
        dbData.websites[existingIdx] = updatedSite;
        saveDatabase(dbData);
        console.log(`[Online Web] Updated existing project: ${updatedSite.title} (${updatedSite.id})`);
        res.json({ success: true, website: updatedSite });
        return;
      }
    }

    // Create new project if ID not provided or not found
    const newSite: WebsiteRecord = {
      id: id || ('site_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      title: title || 'Untitled Website',
      prompt: prompt || '',
      category: category || 'General',
      style: style || 'Modern',
      html,
      createdAt: new Date().toISOString(),
      authorId: authorId || 'anon',
      authorEmail: (authorEmail || '').trim().toLowerCase(),
      views: 1,
      isPublic: true
    };

    dbData.websites.unshift(newSite);
    saveDatabase(dbData);
    console.log(`[Online Web] Saved new project: ${newSite.title} (${newSite.id}) by ${newSite.authorEmail}`);
    res.json({ success: true, website: newSite });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/websites/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, prompt, category, style, html, authorEmail } = req.body;
    const dbData = getDatabase();
    if (!dbData.websites) dbData.websites = [];

    const site = dbData.websites.find(w => w.id === id);
    if (!site) {
      res.status(404).json({ error: 'Website project tidak ditemukan' });
      return;
    }

    if (title) site.title = title.trim();
    if (prompt !== undefined) site.prompt = prompt.trim();
    if (category) site.category = category.trim();
    if (style) site.style = style.trim();
    if (html) site.html = html;
    if (authorEmail) site.authorEmail = authorEmail.trim().toLowerCase();

    saveDatabase(dbData);
    console.log(`[Online Web] PUT Updated project: ${site.title} (${site.id})`);
    res.json({ success: true, website: site });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/websites/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbData = getDatabase();
    dbData.websites = dbData.websites.filter(w => w.id !== id);
    saveDatabase(dbData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Robust generation helper with automatic fallback and smart quota handling
async function generateWithFallback(options: {
  contents: string;
  systemInstruction: string;
  temperature?: number;
}) {
  // Use gemini-3.1-flash-lite first for rapid response and independent quota,
  // with fallback to gemini-3.8-flash
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[vimos.ai] Requesting generation from model: ${model} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.7,
          },
        });

        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isQuotaExceeded = err?.status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded');
        const isTransient503 = err?.status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE');
        
        console.warn(`[vimos.ai] Model ${model} encountered error:`, msg.substring(0, 150));

        // If quota exceeded, do NOT retry this model. Move immediately to next model
        if (isQuotaExceeded) {
          break;
        }

        // For temporary 503 high demand, quick retry once
        if (isTransient503 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        // Otherwise move to next candidate model
        break;
      }
    }
  }

  throw lastError || new Error('Server AI sedang mengalami lonjakan kuota. Sistem otomatis menggunakan synthesizer cadangan.');
}

// Endpoint to suggest content with AI based on site info
app.post('/api/ai-suggest-content', async (req: Request, res: Response) => {
  try {
    const { siteName, siteDescription, websiteType, category } = req.body;

    const systemInstruction = `You are a professional Indonesian copywriter and marketing strategist at vimos.ai.
Your job is to generate compelling, high-converting Indonesian website copy based on the user's business concept.
Return ONLY valid JSON (no markdown triple backticks) matching this structure:
{
  "headline": "Catchy Indonesian headline",
  "subheadline": "Persuasive subheadline explaining value",
  "ctaText": "Short compelling CTA button text",
  "aboutUs": "2-3 sentences about the business story and mission",
  "productServiceHeadline": "Headline for products or services section",
  "faqSummary": "3 common Q&A pairs (e.g. Q: ... A: ...)"
}`;

    const userMessage = `Business Name: ${siteName || 'Vimos Store'}
Description: ${siteDescription || 'Bisnis modern terpercaya'}
Website Type: ${websiteType || 'Toko Online'}
Category: ${category || 'Bisnis'}`;

    const genResult = await generateWithFallback({
      systemInstruction,
      contents: userMessage,
      temperature: 0.7,
    });

    let text = genResult.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    
    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, content: parsed });
    } catch {
      res.json({
        success: true,
        content: {
          headline: `Solusi Terbaik Bersama ${siteName || 'Kami'}`,
          subheadline: siteDescription || 'Kualitas premium dengan pelayanan terbaik untuk kepuasan Anda.',
          ctaText: 'Mulai Sekarang',
          aboutUs: `${siteName || 'Kami'} berdedikasi menghadirkan produk dan layanan terbaik dengan standar keunggulan tinggi dan inovasi terdepan.`,
          productServiceHeadline: 'Pilihan Produk & Layanan Unggulan',
          faqSummary: 'Q: Bagaimana cara pemesanan? A: Anda dapat langsung menghubungi kami melalui WhatsApp atau formulir pemesanan.'
        }
      });
    }
  } catch (error: any) {
    console.error('API /api/ai-suggest-content error:', error);
    res.status(500).json({ error: error?.message || 'Gagal menghasilkan konten AI' });
  }
});

// Comprehensive Wizard Website Generation Endpoint
app.post('/api/generate-wizard-website', async (req: Request, res: Response) => {
  try {
    const wizardData = req.body;
    if (!wizardData) {
      res.status(400).json({ error: 'Wizard data is required' });
      return;
    }

    const {
      siteName,
      siteDescription,
      ownerBrand,
      authorName,
      category,
      websiteType,
      whatsappNumber,
      storeProducts,
      blogPosts,
      portfolioProjects,
      restaurantMenu,
      serviceItems,
      colors,
      paletteTheme,
      layout,
      headerNavbar,
      sections,
      content,
      media,
      features,
      designStyle,
      designSliders,
      typography,
      responsive,
      specialRequest
    } = wizardData;

    const enabledSections = (sections || [])
      .filter((s: any) => s.enabled)
      .map((s: any) => s.name);

    const cleanWa = (whatsappNumber || '081234567890').replace(/[^0-9]/g, '').replace(/^0/, '62');

    const isBlog = websiteType === 'Blog' || websiteType === 'Berita';
    const isPortfolio = websiteType === 'Portfolio';
    const isRestaurant = websiteType === 'Restaurant';
    const isCompany = websiteType === 'Company Profile' || websiteType === 'Jasa' || websiteType === 'Agency';

    const systemInstruction = `You are the lead AI Frontend Engineer and Designer at vimos.ai.
You generate COMPLETE, PRODUCTION-READY, FULLY FUNCTIONAL single-file websites containing HTML, embedded CSS (with Tailwind CSS), and embedded JavaScript tailored specifically to the website type (${websiteType || 'Toko Online'}).

CRITICAL INSTRUCTIONS FOR GENERATING THE CODE:
1. Return ONLY the complete HTML5 document starting with <!DOCTYPE html> and ending with </html>.
2. Do NOT wrap output inside markdown code blocks (NO \`\`\`html or \`\`\`).
3. Include Tailwind CSS CDN directly in the <head>:
   <script src="https://cdn.tailwindcss.com"></script>
4. Include FontAwesome 6 icons via CDN:
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
5. Include Google Fonts matching requested typography:
   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@500;700;900&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
6. STRICT COLOR SPECIFICATIONS:
   - Primary: ${colors?.primary || '#3B82F6'}
   - Secondary: ${colors?.secondary || '#1E293B'}
   - Background: ${colors?.background || '#0F172A'}
   - Text: ${colors?.text || '#FFFFFF'}
   - Button Color: ${colors?.button || '#3B82F6'}
   - Accent: ${colors?.accent || '#6366F1'}
   You MUST apply these colors across the website using inline styles or Tailwind custom classes/variables so the website visually honors the exact color scheme chosen by the customer.
7. SECTION ARCHITECTURE:
   Render ONLY the following sections in this EXACT ordered sequence:
   ${enabledSections.length > 0 ? enabledSections.join(' -> ') : 'Hero -> Content -> Testimonials -> Contact -> Footer'}
   Do not omit any requested section.
8. TYPE-SPECIFIC SPECIALIZATIONS:
   ${isBlog ? `
   - BLOG / EDITORIAL TYPE:
     - Render an elegant, highly readable blog portal.
     - Featured article hero section with large cover, publication date, category tag, author (${authorName || ownerBrand || 'Redaksi'}), and read time.
     - Grid of blog posts with clean typography, hover effects, category filter badges, and reading time indicator.
     - Dedicated author bio section with photo, name, and social links.
     - Newsletter subscription box with interactive submit confirmation.
     - Social share buttons (WhatsApp, Twitter/X, Facebook, LinkedIn) on articles.
     - Search bar input that filters articles live via JavaScript.
   ` : isPortfolio ? `
   - PORTFOLIO / CREATIVE SHOWCASE TYPE:
     - Hero introduction showcasing the creator's name (${siteName}), profession (${ownerBrand || 'Creative Specialist'}), and high-impact bio.
     - Interactive showcase project gallery with tags, zoom modal / lightbox preview, and client/year details.
     - Skills and tools badges section with progress bars or icon grid.
     - Prominent "Hire Me via WhatsApp" floating and header buttons linking to https://wa.me/${cleanWa}?text=${encodeURIComponent('Halo ' + siteName + ', saya tertarik mendiskusikan peluang proyek baru.')}.
     - Client testimonials and interactive contact form.
   ` : isRestaurant ? `
   - RESTAURANT & KAFE TYPE:
     - Warm, appetizing ambience with high-res food/drink photos.
     - Interactive Digital Menu categorized into tabs (Makanan Utama, Minuman, Camilan, Dessert) with prices in IDR (Rp).
     - Each menu item has a "Pesan via WhatsApp" button sending the menu name directly to https://wa.me/${cleanWa}.
     - Prominent "Reservasi Meja" CTA button linking to WhatsApp with prefilled reservation template.
     - Opening hours banner and location/map section.
   ` : `
   - TOKO ONLINE / E-COMMERCE TYPE:
     - Store WhatsApp phone number: ${whatsappNumber || '081234567890'} (International format: ${cleanWa})
     - ALL product cards MUST include a prominent button "Beli via WhatsApp" (with fa-brands fa-whatsapp icon) that opens:
       window.open('https://wa.me/${cleanWa}?text=' + encodeURIComponent('Halo ${siteName || 'Toko'}, saya ingin membeli: ' + productName + ' (Rp ' + productPrice + '). Apakah stok masih tersedia?'), '_blank')
     - Include a shopping cart slideover/modal where clicking "Checkout via WhatsApp" opens WhatsApp to ${cleanWa} with the complete order breakdown!
     - Floating WhatsApp button at the bottom-right linking directly to https://wa.me/${cleanWa}.
   `}
9. INTERACTIVE JAVASCRIPT:
   Embed realistic and functional JavaScript inside a <script> tag before </body>:
   - Smooth scroll for navbar navigation links.
   - Mobile hamburger menu open/close toggle.
   ${(features || []).includes('Dark Mode') ? '- Dark/Light theme toggle button.' : ''}
   ${(features || []).includes('Search') ? '- Live search filter input.' : ''}
   ${(features || []).includes('FAQ Accordion') ? '- Interactive smooth accordion collapse/expand toggles.' : ''}
   ${(features || []).includes('Shopping Cart') ? '- Interactive Shopping Cart slideover with counter and WhatsApp checkout summary.' : ''}
   ${(features || []).includes('Product Filter') ? '- Category tab filter buttons that show/hide items dynamically.' : ''}
   ${(features || []).includes('Contact Form') ? '- Interactive form submission with feedback modal toast.' : ''}
   ${(features || []).includes('Back To Top') ? '- Back to top floating button that appears on scroll.' : ''}
10. DESIGN & SLIDERS:
   - Border Radius: ${designSliders?.borderRadius || 16}px (apply to buttons, cards, containers)
   - Shadow Level: ${designSliders?.shadow || 'medium'}
   - Spacing: ${designSliders?.spacing || 'normal'}
   - Design Aesthetic: ${designStyle || 'Modern'} (${paletteTheme || 'Modern'} palette)
11. RESPONSIVE DESIGN:
   Optimized for mobile-first with clean breakpoints (sm:, md:, lg:) ensuring 100% viewport usability.`;

    const saveIfBase64 = async (imgStr: string | undefined): Promise<string> => {
      if (!imgStr) return '';
      if (!imgStr.startsWith('data:')) return imgStr;
      try {
        const matches = imgStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = 'jpg';
        let dataBuffer: Buffer;
        let cleanBase64 = imgStr;
        if (matches && matches.length === 3) {
          const mime = matches[1];
          if (mime.includes('png')) ext = 'png';
          else if (mime.includes('webp')) ext = 'webp';
          dataBuffer = Buffer.from(matches[2], 'base64');
          cleanBase64 = matches[2];
        } else {
          dataBuffer = Buffer.from(imgStr, 'base64');
          cleanBase64 = imgStr.replace(/^data:[^;]+;base64,/, '');
        }

        // Try public Imgur upload for real direct link
        const imgurLink = await uploadToPublicImgur(cleanBase64);
        if (imgurLink) return imgurLink;

        // Fallback local save with absolute URL
        const safeName = `img_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, safeName), dataBuffer);
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        return `${protocol}://${host}/uploads/${safeName}`;
      } catch (e) {
        console.warn('Failed to convert base64 image:', e);
        return imgStr;
      }
    };

    const processedHeroImg = (await saveIfBase64(media?.heroImageUrl)) || media?.heroImageUrl || 'https://i.imgur.com/492vOq5.jpg';
    
    const rawProducts = storeProducts && storeProducts.length > 0 ? storeProducts : [
      { name: 'Kaos Polos Heavyweight 24s Black', price: '129.000', description: 'Katun combed 24s adem dan tebal', imageUrl: 'https://i.imgur.com/8Km9tLL.jpg' },
      { name: 'Jaket Hoodie Streetwear Noir', price: '249.000', description: 'Bahan fleece hangat kualitas distro', imageUrl: 'https://i.imgur.com/V7RkJ3R.jpg' },
      { name: 'Celana Chino Slim Stretch Grey', price: '189.000', description: 'Katun twill stretch lentur nyaman', imageUrl: 'https://i.imgur.com/mG7P2sJ.jpg' }
    ];
    
    const processedProducts = await Promise.all(rawProducts.map(async (p: any) => ({
      ...p,
      imageUrl: (await saveIfBase64(p.imageUrl)) || p.imageUrl,
    })));

    const processedBlogPosts = await Promise.all((blogPosts || []).map(async (b: any) => ({
      ...b,
      imageUrl: (await saveIfBase64(b.imageUrl)) || b.imageUrl,
    })));

    const processedPortfolio = await Promise.all((portfolioProjects || []).map(async (p: any) => ({
      ...p,
      imageUrl: (await saveIfBase64(p.imageUrl)) || p.imageUrl,
    })));

    const processedMenu = await Promise.all((restaurantMenu || []).map(async (m: any) => ({
      ...m,
      imageUrl: (await saveIfBase64(m.imageUrl)) || m.imageUrl,
    })));

    const processedServices = await Promise.all((serviceItems || []).map(async (s: any) => ({
      ...s,
      imageUrl: (await saveIfBase64(s.imageUrl)) || s.imageUrl,
    })));

    // Update wizardData with processed image URLs so fallback and AI get real clean URLs
    const sanitizedWizardData = {
      ...wizardData,
      media: {
        ...media,
        heroImageUrl: processedHeroImg,
      },
      storeProducts: processedProducts,
      blogPosts: processedBlogPosts,
      portfolioProjects: processedPortfolio,
      restaurantMenu: processedMenu,
      serviceItems: processedServices,
    };

    let itemsListDescription = '';
    if (isBlog && processedBlogPosts && processedBlogPosts.length > 0) {
      itemsListDescription = `- Blog Articles configured by author:\n` +
        processedBlogPosts.map((b: any, idx: number) => `  ${idx + 1}. Title: "${b.title}", Category: "${b.category}", Read Time: "${b.readTime}", Image: "${b.imageUrl}", Excerpt: "${b.excerpt}"`).join('\n');
    } else if (isPortfolio && processedPortfolio && processedPortfolio.length > 0) {
      itemsListDescription = `- Portfolio Projects configured by creator:\n` +
        processedPortfolio.map((p: any, idx: number) => `  ${idx + 1}. Title: "${p.title}", Category: "${p.category}", Client/Year: "${p.clientYear}", Image: "${p.imageUrl}", Description: "${p.description}"`).join('\n');
    } else if (isRestaurant && processedMenu && processedMenu.length > 0) {
      itemsListDescription = `- Restaurant Food & Drink Menu configured by chef:\n` +
        processedMenu.map((m: any, idx: number) => `  ${idx + 1}. Menu: "${m.name}", Category: "${m.category}", Price: "Rp ${m.price}", Image: "${m.imageUrl}", Description: "${m.description}"`).join('\n');
    } else {
      itemsListDescription = `- Products List configured by store owner:\n` +
        processedProducts.map((p: any, idx: number) => `  ${idx + 1}. Name: "${p.name}", Price: "Rp ${p.price}", Image: "${p.imageUrl}", Description: "${p.description}"`).join('\n');
    }

    const userBrief = `BUILD THIS COMPLETE CUSTOM WEBSITE FOR CUSTOMER:
- Website Name: ${siteName || 'Vimos Website'}
- Owner / Brand / Author: ${authorName || ownerBrand || siteName || 'Vimos'}
- Description: ${siteDescription || 'Website modern dan profesional'}
- Website Type: ${websiteType || 'Toko Online'}
- Category: ${category || 'Bisnis'}
- WhatsApp Contact / Order Phone: ${whatsappNumber || '081234567890'} (Clean: ${cleanWa})
${itemsListDescription}
- Hero Image: ${processedHeroImg || 'Use high quality relevant Unsplash photo'}
- Headline: ${content?.headline || 'Selamat Datang di ' + (siteName || 'Website Kami')}
- Subheadline: ${content?.subheadline || siteDescription || 'Temukan solusi terbaik untuk kebutuhan Anda.'}
- Primary CTA Button: ${content?.ctaText || (isBlog ? 'Baca Artikel Terbaru' : isPortfolio ? 'Lihat Portofolio' : isRestaurant ? 'Reservasi Meja' : 'Beli via WhatsApp')}
- About Us / Bio: ${content?.aboutUs || 'Kami berkomitmen memberikan layanan dan karya terbaik dengan integritas dan inovasi.'}
- Showcase Section Headline: ${content?.productServiceHeadline || (isBlog ? 'Artikel & Opini Terbaru' : isPortfolio ? 'Proyek Pilihan Terbaru' : isRestaurant ? 'Menu Pilihan Kami' : 'Katalog Produk Terlaris')}
- FAQ Content: ${content?.faqSummary || 'Pertanyaan seputar pemesanan, konsultasi, dan layanan.'}
- Header & Navbar: Logo text "${headerNavbar?.logoText || siteName || 'Vimos'}", Menu: ${(headerNavbar?.menuItems || ['Home', 'Konten', 'Tentang Kami', 'Kontak']).join(', ')}, Alignment: ${headerNavbar?.position || 'left'}, Navbar Type: ${layout?.navbar || 'horizontal'}
- Hero Layout: ${layout?.hero || 'text-left-img-right'}
- Content Grid: ${layout?.content || 'grid'}
- Footer Style: ${layout?.footer || '3-col'}
- Image Position: ${media?.imagePosition || 'right'}
- Features Selected: ${(features || ['WhatsApp Button', 'Contact Form', 'FAQ Accordion', 'Dark Mode']).join(', ')}
- Typography: Font ${typography?.fontFamily || 'Plus Jakarta Sans'}, Heading: ${typography?.headingSize || 'large'}, Weight: ${typography?.fontWeight || 'bold'}
- Customer's Special Instructions: ${specialRequest || 'Buat desain yang sangat rapi, interaktif, dan responsif di semua perangkat.'}`;

    let rawHtml = '';
    try {
      const genResult = await generateWithFallback({
        systemInstruction,
        contents: userBrief,
        temperature: 0.7,
      });
      rawHtml = genResult.text || '';
    } catch (aiErr) {
      console.warn('[vimos.ai] AI generation stalled or failed, building rich custom website fallback:', aiErr);
      rawHtml = buildFallbackWebsiteHtml(sanitizedWizardData);
    }

    rawHtml = rawHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    if (!rawHtml.toLowerCase().includes('<!doctype html>')) {
      rawHtml = `<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${siteName || 'Website'} - vimos.ai</title>\n<script src="https://cdn.tailwindcss.com"></script>\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n</head>\n<body>\n${rawHtml}\n</body>\n</html>`;
    }

    res.json({
      success: true,
      html: rawHtml,
      title: siteName ? `${siteName} - vimos.ai` : extractTitleFromHtml(rawHtml) || 'Generated Website - vimos.ai',
    });
  } catch (error: any) {
    console.error('API /api/generate-wizard-website error:', error);
    // Even in outer error, deliver custom synthesized HTML so customer is never stuck
    const fallbackHtml = buildFallbackWebsiteHtml(req.body || {});
    res.json({
      success: true,
      html: fallbackHtml,
      title: req.body?.siteName ? `${req.body.siteName} - vimos.ai` : 'Website - vimos.ai',
    });
  }
});

// Backward-compatible Generate Website Endpoint
app.post('/api/generate-website', async (req: Request, res: Response) => {
  try {
    const { prompt, style, category, customRequirements } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt string is required' });
      return;
    }

    const styleGuide = style || 'Modern Dark';
    const categoryGuide = category || 'General';

    const systemInstruction = `You are a world-class AI Frontend Engineer and Designer at vimos.ai.
Your goal is to build COMPLETE, PRODUCTION-READY, FULLY RESPONSIVE single-page websites based on the user's brief.

CRITICAL INSTRUCTIONS FOR GENERATED CODE:
1. Return ONLY valid, complete HTML5 document structure starting with <!DOCTYPE html> and ending with </html>.
2. Do NOT wrap the HTML code inside markdown code blocks (e.g. no \`\`\`html or \`\`\`).
3. Include Tailwind CSS CDN directly in the <head>:
   <script src="https://cdn.tailwindcss.com"></script>
4. Include FontAwesome 6 icons or Lucide Icons via CDN:
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
5. Include Google Fonts (Plus Jakarta Sans or Inter or Playfair Display depending on theme).
6. Theme & Aesthetics:
   - Selected Style: ${styleGuide}
   - Selected Category: ${categoryGuide}
   - Design with ultra-modern UI, gorgeous gradients, hover states, glassmorphism, responsive navigation bar with mobile burger menu toggle, high contrast typography, crisp buttons, pricing tables, hero sections, interactive features, client testimonials, FAQ accordions, and contact/newsletter forms.
7. Include Embedded JavaScript inside a <script> tag before </body> for interactive features:
   - Mobile menu toggle
   - Tab switching
   - FAQ accordion toggle
   - Form submit feedback modal/toast
   - Dark/Light mode toggle (if applicable)
   - Smooth scroll to sections
8. Place realistic copy, high-quality Unsplash image placeholders (e.g., https://images.unsplash.com/photo-...), micro-interactions, and badges.
9. Ensure the code is 100% self-contained and renders beautifully in an iframe sandbox.`;

    const userMessage = `Build a complete, stunning, high-converting website for:
Prompt: ${prompt}
Style Theme: ${styleGuide}
Category: ${categoryGuide}
Extra Requirements: ${customRequirements || 'Make it modern, responsive, and visually impressive with rich sections.'}`;

    const genResult = await generateWithFallback({
      systemInstruction,
      contents: userMessage,
      temperature: 0.7,
    });

    let rawHtml = genResult.text || '';

    // Strip markdown formatting if present
    rawHtml = rawHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    if (!rawHtml.toLowerCase().includes('<!doctype html>')) {
      rawHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated Website - vimos.ai</title>\n<script src="https://cdn.tailwindcss.com"></script>\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n</head>\n<body>\n${rawHtml}\n</body>\n</html>`;
    }

    res.json({
      success: true,
      html: rawHtml,
      title: extractTitleFromHtml(rawHtml) || 'Generated Website - vimos.ai',
    });
  } catch (error: any) {
    console.error('API /api/generate-website error:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan website dengan AI. Silakan coba klik Generate lagi.',
    });
  }
});

// Refine / Edit Website Endpoint
app.post('/api/refine-website', async (req: Request, res: Response) => {
  try {
    const { currentHtml, refinementPrompt } = req.body;

    if (!currentHtml || !refinementPrompt) {
      res.status(400).json({ error: 'currentHtml and refinementPrompt are required' });
      return;
    }

    const systemInstruction = `You are an expert AI Frontend Developer at vimos.ai.
You are updating an existing website's HTML code based on user feedback.

CRITICAL INSTRUCTIONS:
1. Return ONLY the complete modified HTML5 document.
2. Do NOT use markdown triple backticks.
3. Keep all existing features that were not explicitly asked to be changed.
4. Apply the exact changes requested in the refinement prompt (e.g. color adjustments, section additions, text changes, styling tweaks).
5. Ensure Tailwind CSS script, icons, and interactive JavaScript remain intact and functional.`;

    const userMessage = `Existing Website HTML:
${currentHtml.substring(0, 15000)}

Refinement Request:
${refinementPrompt}`;

    let rawHtml = currentHtml;
    try {
      const genResult = await generateWithFallback({
        systemInstruction,
        contents: userMessage,
        temperature: 0.6,
      });
      rawHtml = genResult.text || currentHtml;
      rawHtml = rawHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    } catch (aiErr: any) {
      console.warn('[vimos.ai] Refine AI hit quota or network limit, applying smart local adjustments:', aiErr?.message);
      
      const promptLower = refinementPrompt.toLowerCase();
      // Apply common color/text adjustments locally
      if (promptLower.includes('merah') || promptLower.includes('red')) {
        rawHtml = rawHtml.replace(/--button:\s*[^;]+;/g, '--button: #EF4444;');
        rawHtml = rawHtml.replace(/bg-blue-[0-9]+/g, 'bg-red-500');
      } else if (promptLower.includes('hijau') || promptLower.includes('green')) {
        rawHtml = rawHtml.replace(/--button:\s*[^;]+;/g, '--button: #10B981;');
        rawHtml = rawHtml.replace(/bg-blue-[0-9]+/g, 'bg-emerald-500');
      } else if (promptLower.includes('hitam') || promptLower.includes('dark')) {
        rawHtml = rawHtml.replace(/--background:\s*[^;]+;/g, '--background: #090D16;');
      }
    }

    res.json({
      success: true,
      html: rawHtml,
    });
  } catch (error: any) {
    console.error('API /api/refine-website error:', error);
    res.status(500).json({
      error: error?.message || 'Gagal mengubah website dengan AI.',
    });
  }
});

function buildFallbackWebsiteHtml(data: any): string {
  const name = data?.siteName || 'Vimos Store';
  const desc = data?.siteDescription || 'Platform belanja & solusi digital modern.';
  const pColor = data?.colors?.primary || '#3B82F6';
  const sColor = data?.colors?.secondary || '#1E293B';
  const bColor = data?.colors?.background || '#0F172A';
  const tColor = data?.colors?.text || '#FFFFFF';
  const btnColor = data?.colors?.button || '#3B82F6';
  const aColor = data?.colors?.accent || '#6366F1';
  const radius = data?.designSliders?.borderRadius ?? 16;
  const font = data?.typography?.fontFamily || 'Plus Jakarta Sans';
  const headline = data?.content?.headline || `Selamat Datang di ${name}`;
  const subheadline = data?.content?.subheadline || desc;
  const cta = data?.content?.ctaText || 'Mulai Belanja';
  const about = data?.content?.aboutUs || `${name} hadir menghadirkan produk dan solusi unggulan dengan kualitas tinggi, transparansi, dan pelayanan terpercaya.`;
  const productsTitle = data?.content?.productServiceHeadline || 'Katalog Produk Toko';

  const waRaw = data?.whatsappNumber || '081234567890';
  const cleanWa = waRaw.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const heroImg = data?.media?.heroImageUrl || 'https://i.imgur.com/492vOq5.jpg';

  const productsList = (data?.storeProducts && data.storeProducts.length > 0)
    ? data.storeProducts
    : [
        {
          id: 'p1',
          name: 'Kaos Polos Heavyweight 24s Black',
          price: '129.000',
          description: 'Bahan katun combed 24s adem, jahitan rantai rapi dan tahan lama.',
          imageUrl: 'https://i.imgur.com/8Km9tLL.jpg'
        },
        {
          id: 'p2',
          name: 'Jaket Hoodie Streetwear Noir',
          price: '249.000',
          description: 'Hoodie fleece tebal dengan kantong kanguru, cocok untuk gaya casual.',
          imageUrl: 'https://i.imgur.com/V7RkJ3R.jpg'
        },
        {
          id: 'p3',
          name: 'Celana Chino Slim Stretch Grey',
          price: '189.000',
          description: 'Material katun twill stretch lentur nyaman dipakai harian.',
          imageUrl: 'https://i.imgur.com/mG7P2sJ.jpg'
        }
      ];

  const menuItems: string[] = data?.headerNavbar?.menuItems?.length
    ? data.headerNavbar.menuItems
    : ['Home', 'Produk', 'Tentang Kami', 'Kontak'];

  return `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Official Store</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${pColor};
      --secondary: ${sColor};
      --background: ${bColor};
      --text: ${tColor};
      --button: ${btnColor};
      --accent: ${aColor};
      --radius: ${radius}px;
    }
    body {
      font-family: '${font}', sans-serif;
      background-color: var(--background);
      color: var(--text);
    }
    .custom-radius { border-radius: var(--radius); }
    .glass-nav {
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">

  <!-- Navbar -->
  <header class="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#home" class="flex items-center gap-3">
        <div class="w-10 h-10 custom-radius flex items-center justify-center font-black text-white text-lg shadow-lg" style="background-color: var(--primary);">
          ${name.charAt(0)}
        </div>
        <span class="text-xl font-bold tracking-tight text-white">${name}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
        ${menuItems.map(m => `<a href="#${m.toLowerCase().replace(/\\s+/g, '-')}" class="hover:text-blue-400 transition text-slate-300 hover:text-white">${m}</a>`).join('')}
      </nav>

      <div class="hidden md:flex items-center gap-3">
        <!-- Cart Button -->
        <button onclick="toggleCart()" class="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
          <i class="fa-solid fa-cart-shopping text-base"></i>
          <span id="cartCount" class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">0</span>
        </button>

        <a href="https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(name)},%20saya%20ingin%20bertanya%20seputar%20produk." target="_blank" class="px-5 py-2.5 custom-radius font-semibold text-xs text-white shadow-lg transition transform hover:scale-105 flex items-center gap-1.5" style="background-color: #25D366;">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Chat Toko</span>
        </a>
      </div>

      <!-- Mobile Button -->
      <div class="flex items-center gap-2 md:hidden">
        <button onclick="toggleCart()" class="relative p-2 rounded-xl bg-white/10 text-white">
          <i class="fa-solid fa-cart-shopping"></i>
          <span id="mobileCartCount" class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
        </button>
        <button id="mobileMenuBtn" class="p-2 text-white">
          <i class="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobileDrawer" class="hidden md:hidden px-6 py-4 bg-slate-900 border-b border-white/10 space-y-3">
      ${menuItems.map(m => `<a href="#${m.toLowerCase().replace(/\\s+/g, '-')}" class="block text-sm py-2 text-slate-300 font-medium">${m}</a>`).join('')}
      <div class="pt-2">
        <a href="https://wa.me/${cleanWa}" target="_blank" class="block w-full py-3 text-center custom-radius font-bold text-xs text-white flex items-center justify-center gap-2 bg-emerald-600">
          <i class="fa-brands fa-whatsapp"></i>
          <span>Chat WhatsApp (${waRaw})</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="home" class="pt-36 pb-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center flex-1">
    <div class="space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 custom-radius text-xs font-semibold" style="background-color: rgba(99, 102, 241, 0.2); color: var(--accent);">
        <i class="fa-solid fa-bag-shopping"></i>
        <span>${data?.category || 'Toko Online'} • Order Langsung Chat WA</span>
      </div>

      <h1 class="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
        ${headline}
      </h1>

      <p class="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl">
        ${subheadline}
      </p>

      <div class="flex flex-wrap gap-4 pt-2">
        <a href="#produk" class="px-8 py-4 custom-radius font-bold text-sm text-white shadow-xl transition transform hover:scale-105" style="background-color: var(--button);">
          <i class="fa-solid fa-shopping-bag mr-2"></i>${cta}
        </a>
        <a href="https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(name)},%20saya%20ingin%20tanya%20katalog." target="_blank" class="px-7 py-4 custom-radius font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-600/30">
          <i class="fa-brands fa-whatsapp text-lg"></i>
          <span>WhatsApp Toko</span>
        </a>
      </div>
    </div>

    <!-- Store Visual Banner -->
    <div class="relative custom-radius overflow-hidden shadow-2xl border border-white/15 aspect-[4/3] bg-slate-900">
      <img src="${heroImg}" alt="${name}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
        <h3 class="text-2xl font-bold text-white mb-1">${name}</h3>
        <p class="text-xs text-slate-300 mb-2">${desc}</p>
        <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <i class="fa-solid fa-shield-halved"></i> Toko Resmi & Terverifikasi
        </span>
      </div>
    </div>
  </section>

  <!-- Products Section -->
  <section id="produk" class="py-20 px-6 border-t border-white/10" style="background-color: rgba(30, 41, 59, 0.4);">
    <div class="max-w-7xl mx-auto space-y-12">
      <div class="text-center space-y-3">
        <div class="inline-block px-3 py-1 custom-radius text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Katalog Produk Siap Kirim
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-white">${productsTitle}</h2>
        <p class="text-slate-400 text-sm max-w-lg mx-auto">Klik 'Beli via WhatsApp' untuk langsung chat dan memesan ke nomor toko kami.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${productsList.map((p: any) => `
        <div class="custom-radius border border-white/10 overflow-hidden transition-all hover:border-emerald-500/50 hover:-translate-y-1 shadow-xl flex flex-col" style="background-color: var(--secondary);">
          <div class="aspect-square w-full bg-slate-900 relative overflow-hidden group">
            <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">
            <div class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 border border-white/10">
              Rp ${p.price}
            </div>
          </div>
          
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="text-lg font-bold text-white mb-1.5">${p.name}</h3>
              <p class="text-xs text-slate-400 leading-relaxed">${p.description}</p>
            </div>

            <div class="pt-3 border-t border-white/10 space-y-2">
              <button onclick="buyViaWa('${p.name.replace(/'/g, "\\'")}', '${p.price}')" class="w-full py-3 custom-radius font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500">
                <i class="fa-brands fa-whatsapp text-sm"></i>
                <span>Beli via WhatsApp</span>
              </button>
              
              <button onclick="addToCart('${p.name.replace(/'/g, "\\'")}', '${p.price}', '${p.imageUrl}')" class="w-full py-2 custom-radius font-semibold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-cart-plus"></i>
                <span>+ Keranjang Belanja</span>
              </button>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="tentang-kami" class="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
    <div class="inline-block px-3 py-1 custom-radius text-xs font-semibold" style="background-color: rgba(99, 102, 241, 0.15); color: var(--accent);">
      Tentang Kami
    </div>
    <h2 class="text-3xl font-black text-white">Komitmen Kami Terhadap Pelanggan</h2>
    <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
      ${about}
    </p>
  </section>

  <!-- Contact Section -->
  <section id="kontak" class="py-20 px-6 border-t border-white/10" style="background-color: rgba(15, 23, 42, 0.8);">
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-white">Hubungi Kami</h2>
        <p class="text-slate-400 text-xs">Punya pertanyaan seputar produk atau pesanan? Hubungi nomor WhatsApp kami di <strong class="text-emerald-400 font-mono">${waRaw}</strong> atau kirim pesan di bawah.</p>
      </div>

      <form id="contactForm" class="p-8 custom-radius border border-white/15 space-y-4 shadow-2xl" style="background-color: var(--secondary);">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
          <input type="text" required placeholder="Nama Anda" class="w-full bg-slate-900 border border-slate-700 custom-radius py-3 px-4 text-xs text-white outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nomor WhatsApp / HP</label>
          <input type="text" required placeholder="0812..." class="w-full bg-slate-900 border border-slate-700 custom-radius py-3 px-4 text-xs text-white outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Pesan Anda</label>
          <textarea rows="4" required placeholder="Tuliskan pertanyaan seputar produk di sini..." class="w-full bg-slate-900 border border-slate-700 custom-radius p-4 text-xs text-white outline-none focus:border-indigo-500 resize-none"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 custom-radius font-bold text-xs text-white shadow-lg transition hover:opacity-90" style="background-color: var(--button);">
          Kirim Pesan
        </button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="mt-auto py-12 px-6 border-t border-white/10 bg-slate-950 text-slate-400 text-xs text-center">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="font-bold text-white">${name} © ${new Date().getFullYear()}</div>
      <div>WhatsApp: <a href="https://wa.me/${cleanWa}" class="text-emerald-400 font-mono underline">${waRaw}</a></div>
      <div>Platform Dibuat dengan Vimos.ai</div>
    </div>
  </footer>

  <!-- Floating WhatsApp Button -->
  <a href="https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(name)},%20saya%20ingin%20bertanya%20seputar%20produk." target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-2xl shadow-emerald-500/50 transition transform hover:scale-110" title="Chat Pembelian via WhatsApp">
    <i class="fa-brands fa-whatsapp"></i>
  </a>

  <!-- Cart Slideover Drawer -->
  <div id="cartDrawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex justify-end">
    <div class="w-full max-w-md bg-slate-900 h-full p-6 flex flex-col justify-between shadow-2xl border-l border-slate-800">
      <div>
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping text-emerald-400"></i>
            <h3 class="text-lg font-bold text-white">Keranjang Belanja</h3>
          </div>
          <button onclick="toggleCart()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div id="cartItemsContainer" class="space-y-3 max-h-[55vh] overflow-y-auto">
          <!-- Dynamically filled -->
        </div>
      </div>

      <div class="border-t border-slate-800 pt-4 space-y-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Total Belanja:</span>
          <span id="cartTotalPrice" class="font-mono font-bold text-lg text-emerald-400">Rp 0</span>
        </div>

        <button onclick="checkoutCartViaWa()" class="w-full py-3.5 custom-radius font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-xl flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-base"></i>
          <span>Checkout via WhatsApp (${waRaw})</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Shopping Cart & WhatsApp Script -->
  <script>
    const waNumber = "${cleanWa}";
    const storeName = "${name.replace(/'/g, "\\'")}";
    let cart = [];

    function buyViaWa(productName, price) {
      const text = "Halo " + storeName + "! Saya ingin membeli produk:\\n\\n" +
        "• Produk: " + productName + "\\n" +
        "• Harga: Rp " + price + "\\n\\n" +
        "Format Pemesan:\\n" +
        "Nama:\\n" +
        "Alamat Pengiriman:\\n\\n" +
        "Apakah stok produk ini masih tersedia? Terima kasih!";
      
      const url = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text);
      window.open(url, '_blank');
    }

    function toggleCart() {
      const drawer = document.getElementById('cartDrawer');
      drawer.classList.toggle('hidden');
    }

    function addToCart(name, price, img) {
      cart.push({ name: name, price: price, img: img });
      updateCartUI();
      alert(name + " berhasil dimasukkan ke keranjang belanja!");
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      updateCartUI();
    }

    function updateCartUI() {
      const count = document.getElementById('cartCount');
      const mCount = document.getElementById('mobileCartCount');
      if (count) count.textContent = cart.length;
      if (mCount) mCount.textContent = cart.length;

      const container = document.getElementById('cartItemsContainer');
      const totalEl = document.getElementById('cartTotalPrice');

      if (!container) return;

      if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 py-8 text-xs">Keranjang belanja Anda masih kosong.</p>';
        if (totalEl) totalEl.textContent = 'Rp 0';
        return;
      }

      let total = 0;
      container.innerHTML = cart.map((item, idx) => {
        const numPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        total += numPrice;
        return '<div class="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">' +
          '<div class="flex items-center gap-3">' +
            '<img src="' + item.img + '" class="w-12 h-12 object-cover rounded-lg">' +
            '<div>' +
              '<h4 class="text-xs font-bold text-white">' + item.name + '</h4>' +
              '<span class="text-[11px] text-emerald-400 font-mono">Rp ' + item.price + '</span>' +
            '</div>' +
          '</div>' +
          '<button onclick="removeFromCart(' + idx + ')" class="text-slate-500 hover:text-rose-400 p-2 text-xs"><i class="fa-solid fa-trash"></i></button>' +
        '</div>';
      }).join('');

      if (totalEl) {
        totalEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
      }
    }

    function checkoutCartViaWa() {
      if (cart.length === 0) {
        alert('Keranjang belanja Anda kosong!');
        return;
      }

      let itemList = cart.map((item, i) => (i + 1) + ". " + item.name + " (Rp " + item.price + ")").join('\\n');
      const total = document.getElementById('cartTotalPrice')?.textContent || '';

      const text = "Halo " + storeName + "! Saya ingin checkout pesanan keranjang saya:\\n\\n" +
        itemList + "\\n\\n" +
        "Total: " + total + "\\n\\n" +
        "Format Pembeli:\\n" +
        "• Nama:\\n" +
        "• Alamat Lengkap:\\n" +
        "• Catatan:\\n\\n" +
        "Mohon info rekening dan total ongkos kirim. Terima kasih!";

      const url = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text);
      window.open(url, '_blank');
    }

    const mBtn = document.getElementById('mobileMenuBtn');
    const mDrawer = document.getElementById('mobileDrawer');
    if (mBtn && mDrawer) {
      mBtn.addEventListener('click', () => mDrawer.classList.toggle('hidden'));
    }

    const cForm = document.getElementById('contactForm');
    if (cForm) {
      cForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Terima kasih! Pesan Anda telah terkirim.');
        cForm.reset();
      });
    }
  </script>
</body>
</html>`;
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : 'Custom AI Website';
}

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`vimos.ai platform active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
