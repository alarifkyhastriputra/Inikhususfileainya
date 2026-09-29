import React, { useState, useEffect } from 'react';
import { UserProfile, UserStatus, UserRole, SystemSettings, GeneratedWebsite, TutorialVideo } from '../types';
import { 
  getAllUsers, 
  updateUserStatus, 
  updateUserPasswordByAdmin,
  createMemberByAdmin, 
  deleteUserByAdmin, 
  addCreditsByAdmin,
  getSystemSettings, 
  updateSystemSettings, 
  isAdminEmail,
  getTutorialVideos,
  addTutorialVideo,
  updateTutorialVideo,
  deleteTutorialVideo,
  getAllWebsitesForAdmin
} from '../lib/firebase';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  Settings, 
  Plus, 
  Search, 
  X, 
  Coins, 
  Globe, 
  Check, 
  Key,
  Eye,
  EyeOff,
  Copy,
  Wand2,
  RefreshCw,
  AlertTriangle,
  Zap,
  Youtube,
  Edit3,
  Sliders
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  websites: GeneratedWebsite[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  websites
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'quick_credit' | 'add_user' | 'tutorials' | 'settings' | 'all_sites'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [allCommunityWebsites, setAllCommunityWebsites] = useState<GeneratedWebsite[]>([]);
  
  // Tutorial Modal State
  const [showTutModal, setShowTutModal] = useState(false);
  const [tutModalEditingId, setTutModalEditingId] = useState<string | null>(null);
  const [tutModalTitle, setTutModalTitle] = useState('');
  const [tutModalDesc, setTutModalDesc] = useState('');
  const [tutModalUrl, setTutModalUrl] = useState('');
  const [tutModalCategory, setTutModalCategory] = useState('Dasar');
  const [tutModalDuration, setTutModalDuration] = useState('05:00');
  const [isSubmittingTut, setIsSubmittingTut] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    requireApprovalForNewUsers: false,
    defaultCreditsPerUser: 0,
    aiModel: 'gemini-3.8-flash'
  });
  const [loading, setLoading] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dedicated Credit Modal State
  const [creditModalUser, setCreditModalUser] = useState<UserProfile | null>(null);
  const [creditModalMode, setCreditModalMode] = useState<'add' | 'set'>('add');
  const [creditModalAmount, setCreditModalAmount] = useState<number>(100);
  const [isSavingCreditModal, setIsSavingCreditModal] = useState(false);

  // Quick Top-up Tab State
  const [quickSearch, setQuickSearch] = useState('');
  const [quickTopUpAmount, setQuickTopUpAmount] = useState<number>(100);
  const [quickTopUpMode, setQuickTopUpMode] = useState<'add' | 'set'>('add');
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserProfile | null>(null);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // New User Form State (Default 0 Credits)
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('member');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [newCredits, setNewCredits] = useState(0);
  const [createdSuccessCard, setCreatedSuccessCard] = useState<{ email: string; pass: string; name: string; serialCode?: string } | null>(null);

  // In-table password change
  const [changingPassUid, setChangingPassUid] = useState<string | null>(null);
  const [newPassInput, setNewPassInput] = useState('');

  // Visible passwords map for table view
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [allUsers, sysSettings, vids, allSites] = await Promise.all([
      getAllUsers(),
      getSystemSettings(),
      getTutorialVideos(),
      getAllWebsitesForAdmin(currentUserProfile.email)
    ]);
    setUsers(allUsers);
    setSettings(sysSettings);
    setTutorials(vids);
    setAllCommunityWebsites(allSites);
    setLoading(false);
  };

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Vimos#';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setNewPassword(pass);
    showNotification(`Password otomatis dibuat: ${pass}`, 'info');
  };

  const handleCopyCredentials = (email: string, pass: string, serialCode?: string) => {
    const text = `Halo! Berikut data akun vimos.ai Anda:\n• Kode Seri: ${serialCode || '-'}\n• Email: ${email}\n• Password: ${pass}\n• Link Login: ${window.location.origin}\n\nSilakan login dan mulai membuat website!`;
    navigator.clipboard.writeText(text);
    showNotification('Data login & kode seri berhasil disalin ke clipboard!');
  };

  const handleStatusChange = async (uid: string, status: UserStatus) => {
    await updateUserStatus(uid, status);
    setUsers(users.map(u => u.uid === uid ? { ...u, status } : u));
    showNotification(`Status pengguna diubah menjadi ${status}`);
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    await updateUserStatus(uid, users.find(u => u.uid === uid)?.status || 'active', role);
    setUsers(users.map(u => u.uid === uid ? { ...u, role } : u));
    showNotification(`Role pengguna diubah menjadi ${role}`);
  };

  // Direct 1-click Quick Add in Table
  const handleQuickAddDirect = async (u: UserProfile, amount: number) => {
    const target = u.serialCode || u.email || u.uid;
    const res = await addCreditsByAdmin(target, amount, 'add');
    if (res.success && res.newCredits !== undefined) {
      setUsers(users.map(item => item.uid === u.uid ? { ...item, credits: res.newCredits! } : item));
      showNotification(`+${amount} Kredit berhasil ditambahkan ke ${u.serialCode || u.displayName || u.email}! Saldo sekarang: ${res.newCredits} Kredit.`);
    } else {
      showNotification(res.error || 'Gagal menambahkan kredit', 'error');
    }
  };

  // Open Credit Modal for specific user
  const openCreditModalForUser = (u: UserProfile) => {
    setCreditModalUser(u);
    setCreditModalMode('add');
    setCreditModalAmount(100);
  };

  // Execute Credit Modal Submission
  const handleSaveCreditModal = async () => {
    if (!creditModalUser) return;
    setIsSavingCreditModal(true);
    try {
      const target = creditModalUser.serialCode || creditModalUser.email || creditModalUser.uid;
      const res = await addCreditsByAdmin(target, creditModalAmount, creditModalMode);
      if (res.success && res.newCredits !== undefined) {
        setUsers(users.map(u => u.uid === creditModalUser.uid ? { ...u, credits: res.newCredits! } : u));
        showNotification(res.message || `Berhasil mengatur kredit menjadi ${res.newCredits} Kredit!`);
        setCreditModalUser(null);
      } else {
        showNotification(res.error || 'Gagal menyimpan kredit', 'error');
      }
    } catch (err: any) {
      showNotification('Terjadi kendala: ' + err.message, 'error');
    } finally {
      setIsSavingCreditModal(false);
    }
  };

  // Execute Quick Top-Up Tab
  const handleExecuteQuickTopUp = async () => {
    if (!selectedQuickUser) {
      showNotification('Pilih pengguna yang ingin diatur kreditnya!', 'error');
      return;
    }
    if (quickTopUpAmount === undefined || isNaN(quickTopUpAmount)) {
      showNotification('Masukkan jumlah kredit yang valid!', 'error');
      return;
    }

    setIsAddingCredits(true);
    try {
      const targetId = selectedQuickUser.serialCode || selectedQuickUser.email || selectedQuickUser.uid;
      const res = await addCreditsByAdmin(targetId, quickTopUpAmount, quickTopUpMode);
      if (res.success && res.newCredits !== undefined) {
        setUsers(users.map(item => item.uid === selectedQuickUser.uid ? { ...item, credits: res.newCredits! } : item));
        setSelectedQuickUser({ ...selectedQuickUser, credits: res.newCredits });
        showNotification(res.message || `Kredit berhasil diperbarui! Saldo baru: ${res.newCredits} Kredit.`);
      } else {
        showNotification(res.error || 'Gagal mengatur kredit', 'error');
      }
    } catch (err: any) {
      showNotification('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleSavePassword = async (uid: string) => {
    if (!newPassInput.trim()) {
      showNotification('Password tidak boleh kosong!', 'error');
      return;
    }
    await updateUserPasswordByAdmin(uid, newPassInput.trim());
    setUsers(users.map(u => u.uid === uid ? { ...u, password: newPassInput.trim() } : u));
    setChangingPassUid(null);
    setNewPassInput('');
    showNotification('Password pengguna berhasil diperbarui!');
  };

  const handleDeleteUser = async (uid: string, email: string, serialCode?: string) => {
    if (isAdminEmail(email)) {
      showNotification('Tidak dapat menghapus akun Super Admin!', 'error');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${email} (${serialCode || uid})?`)) {
      await deleteUserByAdmin(uid);
      setUsers(users.filter(u => u.uid !== uid));
      if (selectedQuickUser && selectedQuickUser.uid === uid) {
        setSelectedQuickUser(null);
      }
      showNotification(`Akun ${email} (${serialCode || uid}) telah dihapus.`);
    }
  };

  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanEmail) {
      showNotification('Harap masukkan alamat email pengguna!', 'error');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showNotification('Format email tidak valid (contoh: user@gmail.com)!', 'error');
      return;
    }
    if (!cleanPass) {
      showNotification('Harap masukkan atau buat password akun!', 'error');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const created = await createMemberByAdmin(
        cleanEmail, 
        cleanPass, 
        newName.trim(), 
        newRole, 
        newStatus, 
        newCredits
      );

      setUsers(prev => {
        const idx = prev.findIndex(u => u.email.toLowerCase() === created.email.toLowerCase());
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = created;
          return next;
        }
        return [created, ...prev];
      });

      setCreatedSuccessCard({
        email: cleanEmail,
        pass: cleanPass,
        name: newName.trim() || cleanEmail.split('@')[0],
        serialCode: created.serialCode
      });

      showNotification(`Akun ${cleanEmail} (${created.serialCode || 'VMS'}) berhasil dibuat dengan ${newCredits} kredit!`);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewCredits(0);
    } catch (err: any) {
      showNotification('Gagal membuat akun: ' + err.message, 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleToggleRequireApproval = async () => {
    const updatedVal = !settings.requireApprovalForNewUsers;
    await updateSystemSettings({ requireApprovalForNewUsers: updatedVal });
    setSettings({ ...settings, requireApprovalForNewUsers: updatedVal });
    showNotification(`Persetujuan pendaftaran: ${updatedVal ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}`);
  };

  const openAddTutorialModal = () => {
    setTutModalEditingId(null);
    setTutModalTitle('');
    setTutModalDesc('');
    setTutModalUrl('');
    setTutModalCategory('Dasar');
    setTutModalDuration('05:00');
    setShowTutModal(true);
  };

  const openEditTutorialModal = (t: TutorialVideo) => {
    setTutModalEditingId(t.id);
    setTutModalTitle(t.title);
    setTutModalDesc(t.description);
    setTutModalUrl(t.videoUrl);
    setTutModalCategory(t.category || 'Dasar');
    setTutModalDuration(t.duration || '05:00');
    setShowTutModal(true);
  };

  const handleSaveTutorialModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutModalTitle.trim() || !tutModalUrl.trim()) {
      showNotification('Judul dan URL Video YouTube wajib diisi!', 'error');
      return;
    }

    setIsSubmittingTut(true);
    try {
      if (tutModalEditingId) {
        const updated = await updateTutorialVideo(tutModalEditingId, {
          title: tutModalTitle.trim(),
          description: tutModalDesc.trim(),
          videoUrl: tutModalUrl.trim(),
          category: tutModalCategory.trim(),
          duration: tutModalDuration.trim()
        });
        if (updated) {
          setTutorials(tutorials.map(t => t.id === tutModalEditingId ? updated : t));
          showNotification('Video tutorial berhasil diperbarui!');
          setShowTutModal(false);
        } else {
          showNotification('Gagal memperbarui video', 'error');
        }
      } else {
        const added = await addTutorialVideo({
          title: tutModalTitle.trim(),
          description: tutModalDesc.trim(),
          videoUrl: tutModalUrl.trim(),
          category: tutModalCategory.trim(),
          duration: tutModalDuration.trim(),
          authorEmail: currentUserProfile.email
        });
        if (added) {
          setTutorials([added, ...tutorials]);
          showNotification('Video tutorial berhasil ditambahkan!');
          setShowTutModal(false);
        } else {
          showNotification('Gagal menambahkan video', 'error');
        }
      }
    } catch (err: any) {
      showNotification('Terjadi kendala: ' + err.message, 'error');
    } finally {
      setIsSubmittingTut(false);
    }
  };

  const handleDeleteTutorialItem = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus video tutorial "${title}" dari web?`)) {
      const success = await deleteTutorialVideo(id);
      if (success) {
        setTutorials(tutorials.filter(t => t.id !== id));
        showNotification(`Video "${title}" berhasil dihapus.`);
      } else {
        showNotification('Gagal menghapus video', 'error');
      }
    }
  };

  if (!isOpen) return null;

  const query = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter(u => {
    const serial = (u.serialCode || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const name = (u.displayName || '').toLowerCase();
    const matchesSearch = !query || 
      serial.includes(query) || 
      serial.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
      email.includes(query) || 
      name.includes(query);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const quickSearchQuery = quickSearch.trim().toLowerCase();
  const quickSearchResults = quickSearchQuery.length > 0
    ? users.filter(u => {
        const s = (u.serialCode || '').toLowerCase();
        const em = (u.email || '').toLowerCase();
        const nm = (u.displayName || '').toLowerCase();
        return s.includes(quickSearchQuery) || 
               s.replace(/[^0-9]/g, '').includes(quickSearchQuery.replace(/[^0-9]/g, '')) ||
               em.includes(quickSearchQuery) || 
               nm.includes(quickSearchQuery);
      })
    : [];

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[90vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Toast Alert */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border text-xs font-bold bg-zinc-900 text-white border-zinc-700 transition">
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Admin Dashboard & Manajemen Kredit</h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] font-mono font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-400">Atur saldo kredit member (awal 0), pencarian kode seri, dan kelola akun</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-zinc-950 border-b border-zinc-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengguna ({users.length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-full text-[10px]">
                {pendingCount} Pending
              </span>
            )}
          </button>

          {/* QUICK TOP-UP TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('quick_credit')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'quick_credit'
                ? 'border-white text-white bg-zinc-900 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-white" />
            <span>⚡ Top-Up Kredit Cepat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('add_user');
              setCreatedSuccessCard(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'add_user'
                ? 'border-white text-white bg-zinc-900 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Buat Akun & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutorials')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'tutorials'
                ? 'border-white text-white bg-zinc-900 rounded-t-xl'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-white" />
            <span>🎬 Video Tutorial ({tutorials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_sites')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'all_sites'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Semua Website ({websites.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Sistem</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          
          {/* TAB 1: USERS LIST & SERIAL CODE SEARCH */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Quick Stats in Monochrome */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Total Pengguna Terdaftar</span>
                    <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">{users.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Akun Aktif</span>
                    <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">{activeCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">Menunggu Persetujuan</span>
                    <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">{pendingCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Kode Seri (VMS-1001), Email, atau Nama Pengguna..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl py-2 pl-9 pr-4 outline-none focus:border-zinc-500 transition placeholder:text-zinc-500 font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl py-2 px-3 outline-none cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <button
                    type="button"
                    onClick={loadData}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono">
                      <th className="p-3 pl-4">Kode Seri</th>
                      <th className="p-3">Pengguna</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Kredit Score</th>
                      <th className="p-3">Password</th>
                      <th className="p-3 text-right pr-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          Tidak ada pengguna yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = isAdminEmail(u.email);
                        const isPassVisible = visiblePasswords[u.uid];
                        const serial = u.serialCode || 'VMS';

                        return (
                          <tr key={u.uid} className="hover:bg-zinc-900/50 transition">
                            {/* Serial Code */}
                            <td className="p-3 pl-4">
                              <span className="px-2 py-1 rounded bg-zinc-900 text-zinc-200 border border-zinc-800 font-mono font-bold text-xs inline-block">
                                {serial}
                              </span>
                            </td>

                            {/* User details */}
                            <td className="p-3">
                              <div className="font-semibold text-white">{u.displayName || u.email.split('@')[0]}</div>
                              <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                            </td>

                            {/* Status */}
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                u.status === 'active'
                                  ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                                  : u.status === 'pending'
                                  ? 'bg-zinc-900 text-zinc-300 border-zinc-700 animate-pulse'
                                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                              }`}>
                                {u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Pending' : 'Suspended'}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="p-3">
                              {isSuperAdmin ? (
                                <span className="px-2 py-0.5 rounded bg-white text-black font-bold text-[10px]">
                                  SUPER ADMIN
                                </span>
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-1.5 py-1 text-xs outline-none cursor-pointer"
                                >
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>

                            {/* Prominent Credit Column */}
                            <td className="p-3">
                              {isSuperAdmin ? (
                                <span className="text-zinc-400 font-mono text-xs">Unlimited</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {/* Clickable Credit Balance */}
                                  <button
                                    type="button"
                                    onClick={() => openCreditModalForUser(u)}
                                    className="flex items-center gap-1 text-white hover:text-zinc-300 font-mono font-bold text-xs cursor-pointer group"
                                    title="Klik untuk buka modal atur kredit"
                                  >
                                    <Coins className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                                    <span className="tabular-nums">{u.credits ?? 0}</span>
                                  </button>

                                  {/* Quick Buttons: +100 and +500 */}
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddDirect(u, 100)}
                                    className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded text-[10px] font-bold transition cursor-pointer font-mono"
                                    title="Tambah +100 Kredit (1x Website)"
                                  >
                                    +100
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddDirect(u, 500)}
                                    className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded text-[10px] font-bold transition cursor-pointer font-mono"
                                    title="Tambah +500 Kredit (5x Website)"
                                  >
                                    +500
                                  </button>

                                  {/* Open Custom Modal */}
                                  <button
                                    type="button"
                                    onClick={() => openCreditModalForUser(u)}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition cursor-pointer"
                                    title="Atur / Tambah Kredit Custom"
                                  >
                                    <Sliders className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Password Column */}
                            <td className="p-3">
                              {changingPassUid === u.uid ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={newPassInput}
                                    onChange={(e) => setNewPassInput(e.target.value)}
                                    placeholder="Password baru..."
                                    className="w-24 bg-zinc-900 border border-zinc-600 text-white rounded px-2 py-1 text-xs font-mono outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSavePassword(u.uid)}
                                    className="p-1 bg-white text-black rounded hover:bg-zinc-200 cursor-pointer font-bold"
                                    title="Simpan"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChangingPassUid(null)}
                                    className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                    {isPassVisible ? (u.password || '(Belum diset)') : '••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(u.uid)}
                                    className="text-zinc-500 hover:text-white cursor-pointer"
                                    title={isPassVisible ? "Sembunyikan" : "Lihat"}
                                  >
                                    {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setChangingPassUid(u.uid);
                                      setNewPassInput(u.password || '');
                                    }}
                                    className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                                  >
                                    Ganti
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Actions & Delete */}
                            <td className="p-3 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCredentials(u.email, u.password || '(Belum diset)', serial)}
                                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                  title="Salin Kode Seri, Email & Password"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </button>

                                {u.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'active')}
                                    className="px-2 py-1 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                )}

                                {u.status === 'active' && !isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'suspended')}
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                )}

                                {u.status === 'suspended' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'active')}
                                    className="px-2 py-1 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Aktifkan
                                  </button>
                                )}

                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.uid, u.email, serial)}
                                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition cursor-pointer"
                                    title="Hapus Akun Pengguna"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK SEARCH & CREDIT TOP-UP */}
          {activeTab === 'quick_credit' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Pencarian Kode Seri & Top-Up Kredit Cepat</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cari Akun & Atur Kredit Score</h3>
                <p className="text-xs text-zinc-400">
                  Cukup ketik kode seri akun (contoh: <code className="text-white font-mono font-bold">VMS-1001</code> atau angka <code className="text-white font-mono font-bold">1001</code>) atau email untuk menambah saldo kredit.
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <label className="block text-xs font-bold text-zinc-300">
                  Cari Kode Seri / Email Pengguna:
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={(e) => {
                      setQuickSearch(e.target.value);
                      if (!e.target.value.trim()) setSelectedQuickUser(null);
                    }}
                    placeholder="Ketik Kode Seri (misal: VMS-1001 atau 1001) / Email..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white font-mono rounded-xl py-3 pl-11 pr-4 text-sm outline-none placeholder:text-zinc-500 transition shadow-inner"
                  />
                  {quickSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickSearch('');
                        setSelectedQuickUser(null);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Match Quick Results */}
                {quickSearchResults.length > 0 && (
                  <div className="border border-zinc-800 bg-zinc-950 rounded-xl max-h-48 overflow-y-auto divide-y divide-zinc-800 shadow-2xl">
                    {quickSearchResults.map(userItem => (
                      <div
                        key={userItem.uid}
                        onClick={() => {
                          setSelectedQuickUser(userItem);
                          setQuickSearch(userItem.serialCode || userItem.email);
                        }}
                        className={`p-3 flex items-center justify-between hover:bg-zinc-900 cursor-pointer transition ${
                          selectedQuickUser?.uid === userItem.uid ? 'bg-zinc-900 border-l-4 border-white' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 font-mono font-bold text-xs border border-zinc-800">
                            {userItem.serialCode || 'VMS'}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{userItem.displayName || userItem.email.split('@')[0]}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{userItem.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-zinc-400" />
                            {userItem.credits ?? 0}
                          </span>
                          <span className="text-[10px] text-zinc-300 font-semibold underline">Pilih</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User Action Card */}
              {selectedQuickUser && (
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-lg font-mono">
                        {selectedQuickUser.serialCode ? selectedQuickUser.serialCode.slice(-2) : 'VM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white text-black font-mono font-bold text-xs">
                            {selectedQuickUser.serialCode || 'VMS-0000'}
                          </span>
                          <h4 className="text-sm font-bold text-white">{selectedQuickUser.displayName}</h4>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">{selectedQuickUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Saldo Saat Ini</span>
                        <span className="text-lg font-mono font-extrabold text-white flex items-center gap-1">
                          <Coins className="w-4 h-4 text-zinc-400" />
                          {selectedQuickUser.credits ?? 0} Kredit
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedQuickUser.uid, selectedQuickUser.email, selectedQuickUser.serialCode)}
                        className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
                        title="Hapus Akun Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setQuickTopUpMode('add')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                        quickTopUpMode === 'add' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      + Tambah ke Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTopUpMode('set')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                        quickTopUpMode === 'set' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      = Set Total Saldo
                    </button>
                  </div>

                  {/* Preset Top-Up Options */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-2">
                      Pilihan Cepat Nominal:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { amt: 50, label: '+50 Kredit', desc: '0.5x Buat Web' },
                        { amt: 100, label: '+100 Kredit', desc: '1x Buat Web' },
                        { amt: 200, label: '+200 Kredit', desc: '2x Buat Web' },
                        { amt: 500, label: '+500 Kredit', desc: '5x Buat Web' },
                        { amt: 1000, label: '+1000 Kredit', desc: '10x Buat Web' },
                      ].map(preset => (
                        <button
                          key={preset.amt}
                          type="button"
                          onClick={() => {
                            setQuickTopUpAmount(preset.amt);
                            setQuickTopUpMode('add');
                          }}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                            quickTopUpAmount === preset.amt && quickTopUpMode === 'add'
                              ? 'bg-white text-black border-white font-bold shadow-md'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{preset.label}</div>
                          <div className={`text-[10px] mt-0.5 ${quickTopUpAmount === preset.amt && quickTopUpMode === 'add' ? 'text-zinc-700' : 'text-zinc-500'}`}>{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                      Atau Masukkan Nilai Nominal Kustom:
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Coins className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={quickTopUpAmount}
                          onChange={(e) => setQuickTopUpAmount(Math.max(0, Number(e.target.value)))}
                          placeholder="Contoh: 100"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-zinc-500"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isAddingCredits}
                        onClick={handleExecuteQuickTopUp}
                        className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow transition cursor-pointer disabled:opacity-50"
                      >
                        {isAddingCredits ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-black" />
                            <span>{quickTopUpMode === 'add' ? `+ Tambahkan +${quickTopUpAmount} Kredit` : `= Set Jadi ${quickTopUpAmount} Kredit`}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUAT AKUN & PASSWORD DIRECTLY */}
          {activeTab === 'add_user' && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Success Result Card */}
              {createdSuccessCard && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <CheckCircle className="w-5 h-5 text-white" />
                      <span>Akun Berhasil Dibuat & Kode Seri Ditetapkan!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatedSuccessCard(null)}
                      className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400">
                    Kirimkan data akun login ini kepada pengguna / klien:
                  </p>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs font-mono text-zinc-200">
                    <div><span className="text-zinc-500">Kode Seri:</span> <strong className="text-white">{createdSuccessCard.serialCode || 'VMS-1001'}</strong></div>
                    <div><span className="text-zinc-500">Nama:</span> <strong className="text-white">{createdSuccessCard.name}</strong></div>
                    <div><span className="text-zinc-500">Email:</span> <strong className="text-white">{createdSuccessCard.email}</strong></div>
                    <div><span className="text-zinc-500">Password:</span> <strong className="text-zinc-300">{createdSuccessCard.pass}</strong></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(createdSuccessCard.email, createdSuccessCard.pass, createdSuccessCard.serialCode)}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-black" />
                    <span>Salin Format Lengkap (Untuk WhatsApp / Email)</span>
                  </button>
                </div>
              )}

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-white" />
                    <span>Buat Akun Member & Password Baru</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Admin mendaftarkan akun baru secara langsung. Saldo awal default adalah <strong>0 Kredit</strong> (dapat diatur manual).
                  </p>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Alamat Email Pengguna *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contoh: member@gmail.com / client@toko.com"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-4 text-xs outline-none focus:border-zinc-500"
                    />
                  </div>

                  {/* Password + Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Password Akun *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPassword}
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Acak Password Otomatis</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ketik password atau klik acak otomatis..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 pl-4 pr-10 text-xs font-mono outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                        title={showNewPassword ? "Sembunyikan" : "Lihat"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nama Lengkap / Nama Toko
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="contoh: Budi Santoso / Toko Busana"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-4 text-xs outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Role Pengguna</label>
                      <select
                        value={newRole}
                        onChange={(e: any) => setNewRole(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Status Awal</label>
                      <select
                        value={newStatus}
                        onChange={(e: any) => setNewStatus(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      >
                        <option value="active">Langsung Aktif</option>
                        <option value="pending">Pending Approval</option>
                      </select>
                    </div>
                  </div>

                  {/* Initial Credits: Default 0 */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Kredit Awal (Default: 0 Kredit)
                    </label>
                    <div className="relative">
                      <Coins className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={newCredits}
                        onChange={(e) => setNewCredits(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 block">Biarkan 0 untuk akun baru standar tanpa kredit awal.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingUser ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Menyimpan Akun...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-black" />
                        <span>Buat Akun & Dapatkan Kode Seri</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: KELOLA VIDEO TUTORIAL YT */}
          {activeTab === 'tutorials' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-white" />
                    <span>Daftar Video Tutorial YouTube ({tutorials.length})</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Kelola video tutorial YouTube yang dapat ditonton oleh seluruh member di platform.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddTutorialModal}
                  className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Video Tutorial</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tut) => (
                  <div 
                    key={tut.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono">
                          {tut.category || 'Umum'}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          ⏱ {tut.duration || '05:00'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {tut.title}
                      </h4>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {tut.description || 'Tidak ada deskripsi.'}
                      </p>

                      <div className="text-[11px] text-zinc-500 truncate font-mono">
                        {tut.videoUrl}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                      <a
                        href={tut.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-300 hover:text-white underline flex items-center gap-1"
                      >
                        Buka Video
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditTutorialModal(tut)}
                          className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTutorialItem(tut.id, tut.title)}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition"
                          title="Hapus Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEMUA WEBSITE KOMUNITAS */}
          {activeTab === 'all_sites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Semua Website Komunitas ({allCommunityWebsites.length})</h3>
                  <p className="text-xs text-zinc-400">Seluruh website yang dibuat oleh member di server vimos.ai</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCommunityWebsites.map((site) => (
                  <div key={site.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">{site.category || 'Toko Online'}</span>
                        <span className="font-mono">{new Date(site.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{site.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{site.prompt}</p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-2 truncate">Pembuat: {site.authorEmail || 'Member'}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-[10px] text-zinc-500 font-mono">ID: {site.id.substring(0, 10)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([site.html], { type: 'text/html;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${site.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-semibold"
                      >
                        Download HTML
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PENGATURAN SISTEM */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-white" />
                  <span>Pengaturan Sistem & Kebijakan Pendaftaran</span>
                </h3>

                {/* Require Approval */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Wajib Persetujuan Admin (Pending Approval)</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Jika aktif, pendaftar baru tidak bisa langsung masuk sebelum disetujui.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleRequireApproval}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.requireApprovalForNewUsers ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full transition-transform absolute top-0.5 ${
                        settings.requireApprovalForNewUsers
                          ? 'translate-x-6 bg-black'
                          : 'translate-x-1 bg-zinc-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Credits info */}
                <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-white">Default Kredit Pendaftaran Baru</div>
                  <div className="text-[11px] text-zinc-400">
                    Sesuai instruksi sistem, setiap akun yang mendaftar baru mendapatkan saldo awal <strong className="text-white">0 Kredit</strong>. Admin dapat menambahkan kredit score kapan saja melalui tab <i>Daftar Pengguna</i> atau <i>Top-Up Kredit Cepat</i>.
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 pt-1">
                    <span>Biaya per Generate Website:</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-bold border border-zinc-700">100 Kredit</span>
                  </div>
                </div>

                {/* AI Model */}
                <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="text-xs font-bold text-white">Model AI Generator</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    Google Gemini 3.8 Flash (Server-Side @google/genai)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED ATUR KREDIT MODAL POPUP */}
      {creditModalUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Atur Kredit Pengguna</h4>
                  <span className="text-[11px] text-zinc-400 font-mono">{creditModalUser.serialCode || 'VMS'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target User Info */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nama Akun:</span>
                <span className="font-bold text-white">{creditModalUser.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="font-mono text-zinc-300">{creditModalUser.email}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800/80">
                <span className="text-zinc-500">Saldo Saat Ini:</span>
                <span className="font-mono font-bold text-white tabular-nums">{creditModalUser.credits ?? 0} Kredit</span>
              </div>
            </div>

            {/* Mode: Add or Set */}
            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setCreditModalMode('add')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  creditModalMode === 'add' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                + Tambah ke Saldo
              </button>
              <button
                type="button"
                onClick={() => setCreditModalMode('set')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  creditModalMode === 'set' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                = Set Total Saldo
              </button>
            </div>

            {/* Quick Chips */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Pilihan Cepat Nominal:</label>
              <div className="flex flex-wrap gap-1.5">
                {[50, 100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCreditModalAmount(amt);
                      setCreditModalMode('add');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      creditModalAmount === amt && creditModalMode === 'add'
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Value */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                {creditModalMode === 'add' ? 'Jumlah Kredit yang Ditambahkan:' : 'Set Total Saldo Kredit Baru:'}
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={creditModalAmount}
                  onChange={(e) => setCreditModalAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-zinc-500 font-mono"
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {creditModalMode === 'add' 
                  ? `Saldo akhir akan menjadi: ${(creditModalUser.credits ?? 0) + (Number(creditModalAmount) || 0)} Kredit`
                  : `Saldo akhir akan diubah langsung menjadi: ${Number(creditModalAmount) || 0} Kredit`}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreditModalUser(null)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSavingCreditModal}
                onClick={handleSaveCreditModal}
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                {isSavingCreditModal ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Simpan Kredit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TUTORIAL POPUP MODAL (Add / Edit Video) */}
      {showTutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Youtube className="w-4 h-4 text-white" />
                <span>{tutModalEditingId ? 'Edit Video Tutorial' : 'Tambah Video Tutorial YouTube'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTutModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTutorialModal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Judul Video *</label>
                <input
                  type="text"
                  required
                  value={tutModalTitle}
                  onChange={(e) => setTutModalTitle(e.target.value)}
                  placeholder="contoh: Cara Membuat Toko Online Otomatis"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 text-xs outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">URL Video YouTube *</label>
                <input
                  type="text"
                  required
                  value={tutModalUrl}
                  onChange={(e) => setTutModalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 text-xs outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={tutModalCategory}
                    onChange={(e) => setTutModalCategory(e.target.value)}
                    placeholder="contoh: Toko Online / Upload Foto"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estimasi Durasi</label>
                  <input
                    type="text"
                    value={tutModalDuration}
                    onChange={(e) => setTutModalDuration(e.target.value)}
                    placeholder="05:30"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={tutModalDesc}
                  onChange={(e) => setTutModalDesc(e.target.value)}
                  placeholder="Jelaskan secara ringkas materi yang dibahas di video tutorial..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 px-3 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTutModal(false)}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTut}
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  {isSubmittingTut ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{tutModalEditingId ? 'Simpan Perubahan' : 'Terbitkan Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
