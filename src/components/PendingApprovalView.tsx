import React, { useState } from 'react';
import { UserProfile } from '../types';
import { syncUserProfile, auth } from '../lib/firebase';
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
    if (auth.currentUser) {
      const updated = await syncUserProfile(auth.currentUser);
      if (updated) {
        onRefresh(updated);
      }
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glowing background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Member Verification
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Akun Menunggu Aktivasi
        </h2>
        
        <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-md mx-auto">
          Halo <strong className="text-slate-200">{user.displayName || user.email}</strong>, akun Anda telah terdaftar di <strong className="text-indigo-400">vimos.ai</strong>.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-[#1e293b]/70 border border-slate-700/80 text-left space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              Keanggotaan bersifat tertutup dan memerlukan pengaktifan langsung dari Administrator.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Memeriksa Status...' : 'Cek Status Sekarang'}</span>
          </button>

          <button
            onClick={onLogout}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

