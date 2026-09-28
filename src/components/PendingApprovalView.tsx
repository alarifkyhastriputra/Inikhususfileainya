import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Clock, ShieldAlert, RefreshCw, LogOut, Sparkles } from 'lucide-react';

interface PendingApprovalViewProps {
  user: UserProfile;
  onRefresh: (profile: UserProfile) => void;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ user, onRefresh, onLogout }) => {
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          const found = data.users.find((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
          if (found) {
            onRefresh(found);
          }
        }
      }
    } catch {}
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center text-zinc-100">
        
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Verifikasi Akun Member</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Akun Menunggu Aktivasi
        </h2>
        
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-md mx-auto">
          Halo <strong className="text-zinc-200">{user.displayName || user.email}</strong>, akun Anda telah berhasil terdaftar di <strong className="text-white">vimos.ai</strong>.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed">
              Sistem pendaftaran memerlukan persetujuan dari Administrator. Silakan hubungi Admin atau periksa kembali status aktivasi akun Anda.
            </div>
          </div>
          {user.serialCode && (
            <div className="text-[11px] font-mono text-zinc-400 pt-1">
              Kode Seri Akun Anda: <strong className="text-white font-bold">{user.serialCode}</strong>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex-1 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-sm shadow flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-black ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Memeriksa...' : 'Cek Status Aktivasi'}</span>
          </button>

          <button
            onClick={onLogout}
            className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
