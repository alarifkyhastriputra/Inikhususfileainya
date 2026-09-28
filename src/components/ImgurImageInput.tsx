import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Link2, 
  Clipboard, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  RefreshCw, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { normalizeImageUrl, uploadImageFile } from '../lib/imageUtils';

interface ImgurImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
  itemTypeLabel?: string;
}

const IMGUR_PRESETS = [
  { label: '👕 Kaos Black', url: 'https://i.imgur.com/8Km9tLL.jpg' },
  { label: '🧥 Hoodie', url: 'https://i.imgur.com/V7RkJ3R.jpg' },
  { label: '👖 Chino Grey', url: 'https://i.imgur.com/mG7P2sJ.jpg' },
  { label: '👟 Sneakers', url: 'https://i.imgur.com/J4F3h9T.jpg' },
  { label: '☕ Kopi Resto', url: 'https://i.imgur.com/3Z7wB9K.jpg' },
  { label: '🍔 Hidangan', url: 'https://i.imgur.com/n6Y1XkH.jpg' },
  { label: '💻 Tech / UI', url: 'https://i.imgur.com/O6T5kH9.jpg' },
  { label: '🖼️ Banner Toko', url: 'https://i.imgur.com/492vOq5.jpg' },
];

export const ImgurImageInput: React.FC<ImgurImageInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'https://i.imgur.com/... atau paste link foto',
  aspectRatio = 'square',
  className = '',
  itemTypeLabel = 'Foto',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showImgurHelp, setShowImgurHelp] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleUrlChange = (rawUrl: string) => {
    setImageError(false);
    const normalized = normalizeImageUrl(rawUrl);
    onChange(normalized);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUrlChange(text);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setImageError(false);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        onChange(res.url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const aspectClass = {
    square: 'aspect-square h-20 w-20',
    video: 'aspect-video h-20 w-32',
    banner: 'h-24 w-full sm:w-48',
    auto: 'h-20 w-20',
  }[aspectRatio];

  const isImgur = value?.includes('imgur.com');

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Contoh Imgur</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImgurHelp(!showImgurHelp)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Panduan Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Imgur Info Guide Drawer */}
      {showImgurHelp && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-indigo-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Cara Menggunakan Link Imgur:
            </span>
            <button
              type="button"
              onClick={() => setShowImgurHelp(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
            <li>Buka <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">imgur.com/upload</a> di tab baru.</li>
            <li>Drag & drop atau pilih foto produk/gambar dari galeri Anda.</li>
            <li>Klik kanan pada gambar & pilih <b>"Copy Image Address"</b> atau salin link (contoh: <code className="text-emerald-400 font-mono">https://i.imgur.com/abc1234.jpg</code>).</li>
            <li>Tempel (Paste) link tersebut ke kotak input di bawah. Sistem vimos.ai akan otomatis mendeteksi dan mengoptimalkan gambar!</li>
          </ol>
        </div>
      )}

      {/* Presets Row */}
      {showPresets && (
        <div className="p-2 bg-[#182238] border border-slate-700 rounded-xl space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Pilih Cepat Contoh Foto Imgur:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              Tutup
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {IMGUR_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleUrlChange(p.url);
                  setShowPresets(false);
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-[10px] text-indigo-300 hover:text-white border border-indigo-500/30 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Image Controls */}
      <div className="flex items-start gap-3">
        {/* Preview Thumbnail */}
        <div className={`${aspectClass} rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0 shadow-inner group`}>
          {value && !imageError ? (
            <img
              src={value}
              alt={itemTypeLabel}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] p-1 text-center">
              <ImageIcon className="w-5 h-5 mb-0.5 text-slate-600" />
              <span>{imageError ? 'Link Tidak Valid' : 'Belum Ada Foto'}</span>
            </div>
          )}

          {/* Quick upload overlay */}
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 mb-0.5" />
                <span>Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Input & Action Buttons */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="relative">
            <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-[#0B0F19] border rounded-xl pl-8 pr-8 py-1.5 text-xs text-white outline-none font-mono transition ${
                isImgur 
                  ? 'border-emerald-500/60 focus:border-emerald-400' 
                  : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 p-0.5"
                title="Hapus URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium flex items-center gap-1 border border-slate-700 transition cursor-pointer"
              title="Tempel link dari clipboard"
            >
              {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
              <span>{copiedSuccess ? 'Ditempel!' : 'Paste Link'}</span>
            </button>

            {/* Upload File Button */}
            <label className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-indigo-500/40 cursor-pointer transition">
              {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              <span>{isUploading ? 'Mengunggah...' : 'Upload File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* Imgur badge indicator */}
            {isImgur && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                <Check className="w-2.5 h-2.5" />
                Imgur Link
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
