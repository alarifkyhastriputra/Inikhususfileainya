import React, { useState } from 'react';
import { normalizeImgurUrl } from '../lib/firebase';
import { 
  X, 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  Check, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Copy,
  AlertCircle
} from 'lucide-react';

interface ImageInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
  itemTitle?: string;
  onSave: (newUrl: string) => void;
}

export const ImageInputModal: React.FC<ImageInputModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  itemTitle,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'imgur' | 'upload'>('imgur');
  const [inputUrl, setInputUrl] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputUrl(raw);
    const normalized = normalizeImgurUrl(raw);
    setPreviewUrl(normalized);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (!base64) {
        setIsUploading(false);
        return;
      }

      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const resData = await res.json();
        if (resData.success && resData.url) {
          setInputUrl(resData.url);
          setPreviewUrl(resData.url);
        } else {
          setInputUrl(base64);
          setPreviewUrl(base64);
        }
      } catch (err: any) {
        setUploadError('Gagal mengupload gambar ke server: ' + err.message);
        setInputUrl(base64);
        setPreviewUrl(base64);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    const normalized = normalizeImgurUrl(inputUrl);
    if (!normalized.trim()) {
      alert('Harap masukkan link gambar atau upload file!');
      return;
    }
    onSave(normalized.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-[#111827] border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 overflow-hidden">
        {/* Glowing Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Ganti / Upload Foto</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{itemTitle || 'Foto Produk / Banner / Galeri'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B0F19] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('imgur')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'imgur'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Link Imgur / URL Gambar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload dari HP / PC</span>
          </button>
        </div>

        {/* Tab 1: Imgur Link */}
        {activeTab === 'imgur' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tempel Link Imgur atau URL Gambar:
                </label>
                <a
                  href="https://imgur.com/upload"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  title="Buka Imgur untuk upload gambar gratis"
                >
                  <span>Upload di Imgur.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="url"
                value={inputUrl}
                onChange={handleUrlChange}
                placeholder="Contoh: https://i.imgur.com/abc1234.jpg atau https://imgur.com/abc1234"
                className="w-full bg-[#0B0F19] border-2 border-slate-700 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-xs text-white font-mono outline-none transition"
              />
            </div>

            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Mendukung Format Imgur Otomatis:</strong> Anda bisa langsung menempelkan link halaman <code className="text-emerald-300 font-mono">imgur.com/xyz</code> atau direct link <code className="text-emerald-300 font-mono">i.imgur.com/xyz.jpg</code>. Sistem otomatis mengubahnya ke format gambar yang siap dirender.
            </div>
          </div>
        )}

        {/* Tab 2: Direct File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-[#0B0F19]/60 transition">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">
                {isUploading ? 'Mengunggah gambar...' : 'Klik untuk pilih foto dari perangkat Anda'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Mendukung format JPG, PNG, WEBP, GIF</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {uploadError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Live Preview Box */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Preview Tampilan Foto:</span>
          <div className="w-full h-36 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <span className="text-xs text-slate-600">Belum ada foto yang dipilih</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isUploading || !inputUrl.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Foto Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
