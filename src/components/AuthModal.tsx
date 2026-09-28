import React, { useState } from 'react';
import { loginUserWithCredentials, registerUserWithCredentials } from '../lib/firebase';
import { UserProfile } from '../types';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, Coins } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  initialError?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, initialError }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      const profile = await loginUserWithCredentials(targetEmail, password);
      onSuccess(profile);
    } catch (err: any) {
      let msg = err?.message || 'Terjadi kesalahan saat masuk. Silakan periksa kembali.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Email atau password yang Anda masukkan salah.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    const targetEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim();

    if (cleanPass !== regConfirmPass.trim()) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      setLoading(false);
      return;
    }

    if (cleanPass.length < 4) {
      setError('Password minimal 4 karakter.');
      setLoading(false);
      return;
    }

    try {
      const profile = await registerUserWithCredentials(targetEmail, cleanPass, regName.trim());
      if (profile.status === 'active') {
        onSuccess(profile);
      } else {
        setSuccessNotice('Akun berhasil didaftarkan! Menunggu persetujuan Administrator.');
        onSuccess(profile);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftarkan akun. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(null);

    const targetEmail = forgotEmail.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (cleanPass.length < 4) {
      setError('Password baru minimal 4 karakter.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, newPassword: cleanPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(`Password untuk ${targetEmail} berhasil diperbarui! Silakan masuk.`);
        setEmail(targetEmail);
        setPassword(cleanPass);
        setTimeout(() => {
          setTab('login');
          setResetSuccess(null);
        }, 1500);
      } else {
        setError(data.error || 'Gagal mengatur ulang password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            vimos.ai
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Masuk ke Akun' : tab === 'register' ? 'Daftar Akun Baru' : 'Reset Password'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            {tab === 'login' 
              ? 'Kelola dan bangun website kustom dengan AI secara instan' 
              : tab === 'register'
              ? 'Daftar akun sekarang. Saldo awal 0 Kredit (Top-up oleh Admin).'
              : 'Perbarui kata sandi akun Anda'}
          </p>
        </div>

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div className="flex p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {(successNotice || resetSuccess) && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs flex items-start gap-2.5 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-white" />
            <span>{successNotice || resetSuccess}</span>
          </div>
        )}

        {/* Form Login */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setForgotEmail(email); setError(null); }}
                  className="text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-10 text-sm placeholder:text-zinc-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white cursor-pointer"
                  title={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-sm shadow flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Credit Notice for New Users */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-white shrink-0" />
              <span>Saldo Akun Baru: <strong className="text-white font-mono">0 Kredit</strong>. Admin akan menambahkan saldo kredit untuk akun Anda.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nama Lengkap / Bisnis</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="contoh: Budi / Toko Mandiri"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-10 text-sm placeholder:text-zinc-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPass}
                  onChange={(e) => setRegConfirmPass(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-sm shadow flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Daftar Akun Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form Reset Password */}
        {tab === 'forgot' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-sm shadow flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <span>Simpan Password Baru</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className="w-full py-2 text-xs text-zinc-400 hover:text-white transition cursor-pointer text-center"
            >
              ← Kembali ke Halaman Masuk
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500">
          vimos.ai • Sistem Pembuatan Website Otomatis
        </div>
      </div>
    </div>
  );
};
