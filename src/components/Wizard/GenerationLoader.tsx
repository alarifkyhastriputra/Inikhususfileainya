import React, { useEffect, useState } from 'react';
import { Sparkles, Check, RefreshCw, AlertCircle, XCircle } from 'lucide-react';

interface GenerationLoaderProps {
  currentStage: string;
  elapsedSeconds: number;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

const inProgressStages = [
  'Menganalisis konsep & preferensi...',
  'Menyusun struktur tata letak (layout)...',
  'Menerapkan palet warna & tipografi...',
  'Merakit fitur interaktif & skrip JavaScript...',
  'Mengoptimalkan tampilan responsive di mobile...',
  'Menyelesaikan penulisan kode oleh Vimos AI...',
];

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({
  currentStage,
  elapsedSeconds,
  error,
  onRetry,
  onCancel,
}) => {
  const isFinished = currentStage.includes('selesai') || currentStage.includes('Membuka');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glowing backdrop blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/30 mx-auto mb-6">
          <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center text-indigo-400">
            {error ? (
              <XCircle className="w-8 h-8 text-rose-400" />
            ) : isFinished ? (
              <Check className="w-8 h-8 text-emerald-400 stroke-[3] animate-scaleIn" />
            ) : (
              <RefreshCw className="w-8 h-8 animate-spin" />
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          {error
            ? 'Proses Pembuatan Terkendala'
            : isFinished
            ? 'Website Berhasil Dibuat!'
            : 'Vimos AI Sedang Membangun Website'}
        </h3>

        <p className="text-xs text-slate-400 mt-1 mb-5">
          {error
            ? 'Server AI mengalami kendala sesaat saat menyusun kode.'
            : isFinished
            ? 'Menyiapkan tampilan live preview untuk Anda...'
            : `Sedang memproses permintaan (${elapsedSeconds} detik)...`}
        </p>

        {error ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1 text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Pesan Kendala:</span>
              </div>
              <p>{error}</p>
            </div>

            <div className="flex gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Generate Lagi</span>
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Kembali
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-left bg-[#1e293b]/50 p-4 rounded-2xl border border-slate-800">
            {inProgressStages.map((stage, i) => {
              const activeIdx = Math.min(
                inProgressStages.length - 1,
                Math.floor(elapsedSeconds / 3.5)
              );
              const isDone = isFinished || i < activeIdx;
              const isCurrent = !isFinished && i === activeIdx;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 text-xs transition-all ${
                    isDone
                      ? 'text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-white font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-500 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : i + 1}
                  </div>
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}

            {isFinished && (
              <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-bold pt-1 border-t border-slate-700/50">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Website selesai! Membuka Live Preview...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
