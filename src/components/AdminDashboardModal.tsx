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
  deleteTutorialVideo
} from '../lib/firebase';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
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
  Sparkles,
  AlertTriangle,
  Zap,
  Hash,
  Youtube,
  Film,
  Edit3
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
  
  // Tutorial Popup Modal State
  const [showTutModal, setShowTutModal] = useState(false);
  const [tutModalEditingId, setTutModalEditingId] = useState<string | null>(null);
  const [tutModalTitle, setTutModalTitle] = useState('');
  const [tutModalDesc, setTutModalDesc] = useState('');
  const [tutModalUrl, setTutModalUrl] = useState('');
  const [tutModalCategory, setTutModalCategory] = useState('Dasar');
  const [tutModalDuration, setTutModalDuration] = useState('05:00');
  const [isSubmittingTut, setIsSubmittingTut] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    requireApprovalForNewUsers: true,
    defaultCreditsPerUser: 100,
    aiModel: 'gemini-3.8-flash'
  });
  const [loading, setLoading] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Quick Top-up Tab State
  const [quickSearch, setQuickSearch] = useState('');
  const [quickTopUpAmount, setQuickTopUpAmount] = useState<number>(100);
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserProfile | null>(null);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('member');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [newCredits, setNewCredits] = useState(100);
  const [createdSuccessCard, setCreatedSuccessCard] = useState<{ email: string; pass: string; name: string; serialCode?: string } | null>(null);

  // Edit Credits & Password State
  const [editingCreditsUid, setEditingCreditsUid] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState<number>(100);
  
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
    const [allUsers, sysSettings, vids] = await Promise.all([
      getAllUsers(),
      getSystemSettings(),
      getTutorialVideos()
    ]);
    setUsers(allUsers);
    setSettings(sysSettings);
    setTutorials(vids);
    setLoading(false);
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
      showNotification('Error: ' + err.message, 'error');
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
    const text = `Halo! Berikut data akun vimos.ai Anda:\n• Kode Seri: ${serialCode || '-'}\n• Email: ${email}\n• Password: ${pass}\n• Link Login: ${window.location.origin}\n\nSilakan login dan mulai membangun website!`;
    navigator.clipboard.writeText(text);
    showNotification('Data login & kode seri berhasil disalin ke clipboard!');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showNotification(`${label} berhasil disalin!`);
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

  const handleSaveCredits = async (uid: string) => {
    await updateUserStatus(uid, users.find(u => u.uid === uid)?.status || 'active', undefined, creditsInput);
    setUsers(users.map(u => u.uid === uid ? { ...u, credits: creditsInput } : u));
    setEditingCreditsUid(null);
    showNotification(`Kredit AI diperbarui menjadi ${creditsInput}`);
  };

  const handleQuickAddDirect = async (u: UserProfile, amount: number) => {
    const target = u.serialCode || u.email || u.uid;
    const res = await addCreditsByAdmin(target, amount);
    if (res.success && res.newCredits !== undefined) {
      setUsers(users.map(item => item.uid === u.uid ? { ...item, credits: res.newCredits! } : item));
      showNotification(`+${amount} Kredit berhasil ditambahkan ke ${u.serialCode || u.displayName || u.email}! Saldo: ${res.newCredits} Kredit.`);
    } else {
      showNotification(res.error || 'Gagal menambahkan kredit', 'error');
    }
  };

  const handleExecuteQuickTopUp = async () => {
    if (!selectedQuickUser) {
      showNotification('Pilih pengguna yang ingin ditambahkan kredit!', 'error');
      return;
    }
    if (!quickTopUpAmount || quickTopUpAmount <= 0) {
      showNotification('Masukkan jumlah kredit yang valid!', 'error');
      return;
    }

    setIsAddingCredits(true);
    try {
      const targetId = selectedQuickUser.serialCode || selectedQuickUser.email || selectedQuickUser.uid;
      const res = await addCreditsByAdmin(targetId, quickTopUpAmount);
      if (res.success && res.newCredits !== undefined) {
        setUsers(users.map(item => item.uid === selectedQuickUser.uid ? { ...item, credits: res.newCredits! } : item));
        setSelectedQuickUser({ ...selectedQuickUser, credits: res.newCredits });
        showNotification(res.message || `+${quickTopUpAmount} Kredit berhasil ditambahkan! Saldo: ${res.newCredits} Kredit.`);
      } else {
        showNotification(res.error || 'Gagal menambahkan kredit', 'error');
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
      showNotification('⚠️ Harap masukkan alamat email pengguna!', 'error');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showNotification('⚠️ Format email tidak valid (contoh: user@gmail.com)!', 'error');
      return;
    }
    if (!cleanPass) {
      showNotification('⚠️ Harap masukkan atau buat password akun!', 'error');
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

      showNotification(`✅ Akun ${cleanEmail} (${created.serialCode || 'VMS'}) berhasil dibuat!`);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Toast Alert */}
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border text-xs font-bold transition ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-400'
              : toast.type === 'info'
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-emerald-600 text-white border-emerald-400'
          }`}>
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-white" /> : <CheckCircle className="w-4 h-4 text-white" />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Admin Dashboard & Kode Seri Akun</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">Pencarian cepat dengan kode seri, tambah kredit instan, dan kelola member</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-[#0B0F19] border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengguna ({users.length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px]">
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
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
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
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Buat Akun & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tutorials')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'tutorials'
                ? 'border-red-500 text-red-400 bg-red-500/10 rounded-t-xl'
                : 'border-transparent text-red-400/80 hover:text-red-300'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span>🎬 Kelola Video YT ({tutorials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_sites')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'all_sites'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Sistem</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0E131F]">
          
          {/* TAB 1: USERS LIST & SERIAL CODE SEARCH */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#182238] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Pengguna</span>
                    <div className="text-2xl font-bold text-white mt-0.5">{users.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#182238] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Akun Aktif</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-0.5">{activeCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#182238] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Menunggu Persetujuan</span>
                    <div className="text-2xl font-bold text-amber-400 mt-0.5">{pendingCount}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Cari Kode Seri (contoh: VMS-1001), Email, Nama..."
                    className="w-full bg-[#1e293b] border border-slate-700 text-slate-100 text-xs rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="bg-[#1e293b] border border-slate-700 text-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Ditangguhkan</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('quick_credit');
                    }}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Top-Up Cepat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('add_user');
                      setCreatedSuccessCard(null);
                    }}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Akun Baru</span>
                  </button>
                </div>
              </div>

              {/* Members Table with Serial Code & Quick Credit Top-Up */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#182238]/30">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Seri</th>
                      <th className="p-3">Nama & Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Kredit & Tambah Cepat</th>
                      <th className="p-3">Password</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Tidak ada pengguna yang cocok dengan pencarian "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = isAdminEmail(u.email);
                        const isPassVisible = visiblePasswords[u.uid];
                        const serial = u.serialCode || `VMS-${u.uid.slice(-4).toUpperCase()}`;

                        return (
                          <tr key={u.uid} className="hover:bg-slate-800/40 transition">
                            {/* Serial Code Column */}
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(serial, 'Kode Seri')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs hover:bg-indigo-500/25 transition cursor-pointer"
                                  title="Klik untuk menyalin Kode Seri"
                                >
                                  <Hash className="w-3 h-3 text-indigo-400" />
                                  <span>{serial}</span>
                                  <Copy className="w-3 h-3 text-indigo-400/60 ml-0.5" />
                                </button>
                              </div>
                            </td>

                            {/* User details */}
                            <td className="p-3">
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{u.displayName || u.email.split('@')[0]}</span>
                                {isSuperAdmin && (
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                                    SUPER ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                            </td>

                            {/* Status Column */}
                            <td className="p-3">
                              {u.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                              {u.status === 'active' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                                  <CheckCircle className="w-3 h-3" />
                                  Aktif
                                </span>
                              )}
                              {u.status === 'suspended' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
                                  <XCircle className="w-3 h-3" />
                                  Ditangguhkan
                                </span>
                              )}
                            </td>

                            {/* Credits & Quick Add Column */}
                            <td className="p-3">
                              {isSuperAdmin ? (
                                <span className="text-xs text-indigo-300 font-mono font-semibold">Unlimited</span>
                              ) : editingCreditsUid === u.uid ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={creditsInput}
                                    onChange={(e) => setCreditsInput(Number(e.target.value))}
                                    className="w-16 bg-[#1e293b] border border-slate-700 text-white rounded px-1.5 py-0.5 text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCredits(u.uid)}
                                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 cursor-pointer"
                                    title="Simpan"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCreditsUid(u.uid);
                                      setCreditsInput(u.credits);
                                    }}
                                    className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-mono font-bold cursor-pointer"
                                    title="Klik untuk edit kredit manual"
                                  >
                                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{u.credits}</span>
                                  </button>

                                  {/* Instant +100 and +500 Quick Buttons */}
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddDirect(u, 100)}
                                    className="px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition cursor-pointer"
                                    title="Tambah +100 Kredit (1x Website)"
                                  >
                                    +100
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddDirect(u, 500)}
                                    className="px-1.5 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold transition cursor-pointer"
                                    title="Tambah +500 Kredit (5x Website)"
                                  >
                                    +500
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
                                    className="w-24 bg-[#111827] border border-indigo-500 text-white rounded px-2 py-1 text-xs font-mono outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSavePassword(u.uid)}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 cursor-pointer"
                                    title="Simpan"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setChangingPassUid(null)}
                                    className="p-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                    {isPassVisible ? (u.password || '(Belum diset)') : '••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(u.uid)}
                                    className="text-slate-400 hover:text-white cursor-pointer"
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
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                  >
                                    Ganti
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Actions & Delete */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCredentials(u.email, u.password || '(Belum diset)', serial)}
                                  className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                  title="Salin Kode Seri, Email & Password"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </button>

                                {u.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'active')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                )}

                                {u.status === 'active' && !isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'suspended')}
                                    className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-200 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                )}

                                {u.status === 'suspended' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(u.uid, 'active')}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Aktifkan
                                  </button>
                                )}

                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.uid, u.email, serial)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fitur Khusus Admin: Pencarian Kode Seri & Top-Up Cepat</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cari Akun & Tambah Kredit Instan</h3>
                <p className="text-xs text-slate-400">
                  Cukup ketik kode seri akun (contoh: <code className="text-indigo-400 font-mono font-bold">VMS-1001</code> atau angka <code className="text-indigo-400 font-mono font-bold">1001</code>) atau email untuk menambah kredit atau menghapus akun.
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-[#182238] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <label className="block text-xs font-bold text-slate-300">
                  Cari Kode Seri / Email Pengguna:
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={(e) => {
                      setQuickSearch(e.target.value);
                      if (!e.target.value.trim()) setSelectedQuickUser(null);
                    }}
                    placeholder="Ketik Kode Seri (misal: VMS-1001 atau 1001) / Email..."
                    className="w-full bg-[#111827] border-2 border-indigo-500/40 focus:border-indigo-500 text-white font-mono rounded-xl py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 transition shadow-inner"
                  />
                  {quickSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickSearch('');
                        setSelectedQuickUser(null);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Match Quick Results */}
                {quickSearchResults.length > 0 && (
                  <div className="border border-slate-700 bg-slate-900/95 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-800 shadow-2xl">
                    {quickSearchResults.map(userItem => (
                      <div
                        key={userItem.uid}
                        onClick={() => {
                          setSelectedQuickUser(userItem);
                          setQuickSearch(userItem.serialCode || userItem.email);
                        }}
                        className={`p-3 flex items-center justify-between hover:bg-slate-800 cursor-pointer transition ${
                          selectedQuickUser?.uid === userItem.uid ? 'bg-indigo-950/60 border-l-4 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                            {userItem.serialCode || 'VMS'}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{userItem.displayName || userItem.email.split('@')[0]}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{userItem.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            {userItem.credits ?? 0}
                          </span>
                          <span className="text-[10px] text-indigo-400 font-semibold underline">Pilih</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected User Action Card */}
              {selectedQuickUser && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-[#182238] to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg font-mono">
                        {selectedQuickUser.serialCode ? selectedQuickUser.serialCode.slice(-2) : 'VM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white font-mono font-bold text-xs">
                            {selectedQuickUser.serialCode || 'VMS-0000'}
                          </span>
                          <h4 className="text-sm font-bold text-white">{selectedQuickUser.displayName}</h4>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedQuickUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saldo Saat Ini</span>
                        <span className="text-lg font-mono font-extrabold text-amber-300 flex items-center gap-1">
                          <Coins className="w-4 h-4 text-amber-400" />
                          {selectedQuickUser.credits ?? 0} Kredit
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedQuickUser.uid, selectedQuickUser.email, selectedQuickUser.serialCode)}
                        className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition cursor-pointer"
                        title="Hapus Akun Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preset Top-Up Options */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Pilih Jumlah Kredit yang Ingin Ditambahkan:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { amt: 100, label: '+100 Kredit', desc: '1x Buat Web' },
                        { amt: 200, label: '+200 Kredit', desc: '2x Buat Web' },
                        { amt: 500, label: '+500 Kredit', desc: '5x Buat Web' },
                        { amt: 1000, label: '+1000 Kredit', desc: '10x Buat Web' },
                      ].map(preset => (
                        <button
                          key={preset.amt}
                          type="button"
                          onClick={() => setQuickTopUpAmount(preset.amt)}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                            quickTopUpAmount === preset.amt
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-bold text-xs">{preset.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Atau Masukkan Jumlah Nominal Kustom:
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Coins className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={quickTopUpAmount}
                          onChange={(e) => setQuickTopUpAmount(Math.max(1, Number(e.target.value)))}
                          placeholder="Contoh: 300"
                          className="w-full bg-[#111827] border border-slate-700 text-white font-mono rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isAddingCredits}
                        onClick={handleExecuteQuickTopUp}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        {isAddingCredits ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Menambahkan...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>⚡ Tambahkan +{quickTopUpAmount} Kredit</span>
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
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/50 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle className="w-5 h-5" />
                      <span>Akun Berhasil Dibuat & Kode Seri Ditetapkan!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatedSuccessCard(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    Kirimkan data akun login ini kepada pengguna / klien:
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono text-slate-200">
                    <div><span className="text-slate-500">Kode Seri:</span> <strong className="text-indigo-400">{createdSuccessCard.serialCode || 'VMS-1001'}</strong></div>
                    <div><span className="text-slate-500">Nama:</span> <strong className="text-white">{createdSuccessCard.name}</strong></div>
                    <div><span className="text-slate-500">Email:</span> <strong className="text-emerald-400">{createdSuccessCard.email}</strong></div>
                    <div><span className="text-slate-500">Password:</span> <strong className="text-amber-300">{createdSuccessCard.pass}</strong></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(createdSuccessCard.email, createdSuccessCard.pass, createdSuccessCard.serialCode)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Salin Format Lengkap (Untuk WhatsApp / Email)</span>
                  </button>
                </div>
              )}

              <div className="bg-[#1e293b]/50 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                    <span>Buat Akun Member & Password Baru</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Admin mendaftarkan akun baru secara langsung, menentukan password, dan otomatis menghasilkan Kode Seri.
                  </p>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Alamat Email Pengguna *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contoh: member@gmail.com / client@toko.com"
                      className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 px-4 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Password + Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password Akun *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPassword}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
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
                        className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 pl-4 pr-10 text-xs font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        title={showNewPassword ? "Sembunyikan" : "Lihat"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Lengkap / Nama Toko
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="contoh: Budi Santoso / Toko Busana"
                      className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 px-4 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Pengguna</label>
                      <select
                        value={newRole}
                        onChange={(e: any) => setNewRole(e.target.value)}
                        className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status Awal</label>
                      <select
                        value={newStatus}
                        onChange={(e: any) => setNewStatus(e.target.value)}
                        className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      >
                        <option value="active">Langsung Aktif (Active)</option>
                        <option value="pending">Pending Approval</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kredit AI Awal</label>
                    <input
                      type="number"
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl py-2.5 px-4 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    onClick={(e) => handleAddMember(e)}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmittingUser ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Akun...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>✨ Buat Akun & Dapatkan Kode Seri</span>
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
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>Daftar Video Tutorial YouTube ({tutorials.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kelola video tutorial YouTube yang dapat ditonton oleh seluruh member di platform.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddTutorialModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                  <span>+ Tambah Video Baru</span>
                </button>
              </div>

              {/* List of Existing Videos */}
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                {tutorials.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                    <Film className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                    <span>Belum ada video tutorial. Klik "+ Tambah Video Baru" di atas.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tutorials.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-[#182238] border border-slate-700 space-y-3 flex flex-col justify-between shadow">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-400 uppercase">{t.category || 'Dasar'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{t.duration}</span>
                          </div>
                          <h4 className="font-bold text-white text-xs line-clamp-1">{t.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">{t.videoUrl}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditTutorialModal(t)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTutorialItem(t.id, t.title)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TUTORIAL ADD/EDIT POPUP MODAL */}
          {showTutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-[#111827] border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>{tutModalEditingId ? 'Edit Video Tutorial YouTube' : 'Tambah Video Tutorial YouTube'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTutModal(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveTutorialModal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Video Tutorial</label>
                    <input
                      type="text"
                      value={tutModalTitle}
                      onChange={(e) => setTutModalTitle(e.target.value)}
                      placeholder="Contoh: Cara Membuat Toko Online & Checkout WA"
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">URL YouTube (Watch atau Embed)</label>
                    <input
                      type="url"
                      value={tutModalUrl}
                      onChange={(e) => setTutModalUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... atau youtu.be/..."
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={tutModalCategory}
                        onChange={(e) => setTutModalCategory(e.target.value)}
                        placeholder="Contoh: Toko Online, Dasar"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Durasi</label>
                      <input
                        type="text"
                        value={tutModalDuration}
                        onChange={(e) => setTutModalDuration(e.target.value)}
                        placeholder="05:00"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Tutorial</label>
                    <textarea
                      rows={3}
                      value={tutModalDesc}
                      onChange={(e) => setTutModalDesc(e.target.value)}
                      placeholder="Jelaskan ringkasan isi video tutorial..."
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowTutModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTut}
                      className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>{tutModalEditingId ? 'Simpan Perubahan' : 'Tambah Video'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SEMUA WEBSITE SISTEM */}
          {activeTab === 'all_sites' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Semua Website yang Dihasilkan Pengguna ({websites.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {websites.map(site => (
                  <div key={site.id} className="p-4 rounded-xl bg-[#182238] border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-xs">{site.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">{site.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{site.prompt}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                      <span>Author: {site.authorEmail}</span>
                      <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PENGATURAN SISTEM */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4 bg-[#1e293b]/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Pengaturan Global Sistem</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white">Wajibkan Verifikasi Admin untuk Pendaftaran Baru</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pengguna baru harus disetujui admin sebelum dapat membuat website</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleRequireApproval}
                    className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                      settings.requireApprovalForNewUsers ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition transform ${
                      settings.requireApprovalForNewUsers ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white">Kredit AI Default untuk Pengguna Baru</h4>
                  <input
                    type="number"
                    value={settings.defaultCreditsPerUser}
                    onChange={(e) => setSettings({ ...settings, defaultCreditsPerUser: Number(e.target.value) })}
                    className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl py-2 px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => updateSystemSettings({ defaultCreditsPerUser: settings.defaultCreditsPerUser })}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
