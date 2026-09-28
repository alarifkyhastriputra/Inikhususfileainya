import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center text-zinc-100">
        
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700 p-0.5 shadow-xl mx-auto mb-6 flex items-center justify-center text-white">
          {error ? (
            <XCircle className="w-8 h-8 text-zinc-300" />
          ) : isFinished ? (
            <Check className="w-8 h-8 text-white stroke-[3] animate-scaleIn" />
          ) : (
            <RefreshCw className="w-8 h-8 animate-spin text-white" />
          )}
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          {error
            ? 'Proses Pembuatan Terkendala'
            : isFinished
            ? 'Website Berhasil Dibuat!'
            : 'Vimos AI Sedang Membangun Website'}
        </h3>

        <p className="text-xs text-zinc-400 mt-1 mb-5">
          {error
            ? 'Server AI mengalami kendala sesaat saat menyusun kode.'
            : isFinished
            ? 'Menyiapkan tampilan live preview untuk Anda...'
            : `Sedang memproses permintaan (${elapsedSeconds} detik)...`}
        </p>

        {error ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs text-left leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1 text-white">
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
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Generate Lagi</span>
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-800 transition cursor-pointer"
                >
                  Kembali
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-left bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
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
                      ? 'text-zinc-200 font-medium'
                      : isCurrent
                      ? 'text-white font-bold'
                      : 'text-zinc-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      isDone
                        ? 'bg-white text-black font-bold'
                        : isCurrent
                        ? 'bg-zinc-200 text-black font-bold animate-pulse'
                        : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : i + 1}
                  </div>
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}

            {isFinished && (
              <div className="flex items-center gap-2.5 text-xs text-white font-bold pt-1 border-t border-zinc-800">
                <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px]">
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
