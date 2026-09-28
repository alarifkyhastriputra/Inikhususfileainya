import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  Check, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  Globe
} from 'lucide-react';
import { normalizeImageUrl, uploadImageFile, isPublicImageUrl } from '../lib/imageUtils';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputUrl(raw);
    const normalized = normalizeImageUrl(raw);
    setPreviewUrl(normalized);
  };

  const handleCopyLink = async () => {
    if (!inputUrl) return;
    try {
      await navigator.clipboard.writeText(inputUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessNotice(null);

    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        setInputUrl(res.url);
        setPreviewUrl(res.url);
        setUploadSuccessNotice('Gambar berhasil diunggah ke CDN publik (Imgur). Link ini asli dan siap dipasang di web manapun!');
      } else {
        setUploadError(res.error || 'Gagal mengupload gambar.');
      }
    } catch (err: any) {
      setUploadError('Gagal mengupload gambar: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = () => {
    const normalized = normalizeImageUrl(inputUrl);
    if (!normalized.trim()) {
      alert('Harap masukkan link gambar atau upload file!');
      return;
    }
    onSave(normalized.trim());
    onClose();
  };

  const isPublic = isPublicImageUrl(inputUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5 overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Ganti / Upload Foto</h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-xs">{itemTitle || 'Foto Produk / Banner / Galeri'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('imgur')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'imgur'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
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
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (Link Asli)</span>
          </button>
        </div>

        {/* Tab 1: Imgur Link */}
        {activeTab === 'imgur' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Tempel Link Imgur atau URL Gambar:
                </label>
                <a
                  href="https://imgur.com/upload"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-zinc-300 hover:text-white underline font-bold flex items-center gap-1"
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
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl py-2.5 px-3.5 text-xs text-white font-mono outline-none transition"
              />
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 leading-relaxed">
              💡 <strong>Format Imgur Otomatis:</strong> Anda bisa menempelkan link halaman <code className="text-zinc-200 font-mono">imgur.com/xyz</code> atau direct link <code className="text-zinc-200 font-mono">i.imgur.com/xyz.jpg</code>.
            </div>
          </div>
        )}

        {/* Tab 2: Direct File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="block border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 text-center cursor-pointer bg-zinc-900/60 transition">
              {isUploading ? (
                <RefreshCw className="w-8 h-8 text-white mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              )}
              <div className="text-xs font-bold text-white">
                {isUploading ? 'Mengunggah gambar ke CDN publik...' : 'Klik untuk pilih foto dari perangkat Anda'}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Otomatis menghasilkan link publik Imgur yang aktif di web manapun</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {uploadSuccessNotice && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Check className="w-4 h-4 text-white shrink-0" />
                  <span>{uploadSuccessNotice}</span>
                </div>
                <div className="flex items-center gap-2 bg-black p-2 rounded-lg border border-zinc-800">
                  <span className="text-[11px] font-mono text-zinc-300 truncate flex-1">{inputUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black rounded text-[10px] font-bold shrink-0 transition cursor-pointer"
                  >
                    {copiedLink ? 'Tersalin!' : 'Salin Link'}
                  </button>
                  <a
                    href={inputUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Buka gambar di tab baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Live Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-400">Preview Tampilan Foto:</span>
            {isPublic && (
              <span className="text-[10px] font-mono text-zinc-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400" />
                Link Publik Aktif
              </span>
            )}
          </div>
          <div className="w-full h-36 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://i.imgur.com/8Km9tLL.jpg';
                }}
              />
            ) : (
              <span className="text-xs text-zinc-500">Belum ada foto yang dipilih</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isUploading || !inputUrl.trim()}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan Foto Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
