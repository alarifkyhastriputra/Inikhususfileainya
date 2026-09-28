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
  Copy, 
  Globe 
} from 'lucide-react';
import { normalizeImageUrl, uploadImageFile, isPublicImageUrl } from '../lib/imageUtils';

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
  placeholder = 'https://i.imgur.com/... atau tempel link foto',
  aspectRatio = 'square',
  className = '',
  itemTypeLabel = 'Foto',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showImgurHelp, setShowImgurHelp] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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
    } catch {}
  };

  const handleCopyCurrentLink = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setImageError(false);
    setUploadNotice(null);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        onChange(res.url);
        setUploadNotice('Link asli berhasil dibuat! Gambar siap dilihat di web manapun.');
        setTimeout(() => setUploadNotice(null), 4000);
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
  const isPublic = isPublicImageUrl(value);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Contoh Imgur</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImgurHelp(!showImgurHelp)}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Panduan Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Imgur Info Guide Drawer */}
      {showImgurHelp && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-300 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Cara Menggunakan Link Gambar Asli:
            </span>
            <button
              type="button"
              onClick={() => setShowImgurHelp(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 leading-relaxed">
            <li><b>Upload File Langsung:</b> Klik tombol <i>"Upload File"</i> di bawah, sistem otomatis mengunggah foto ke CDN Imgur dan menghasilkan <b>link asli</b> yang dapat dibuka di website mana pun di internet.</li>
            <li><b>Atau Buka Imgur:</b> Buka <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-white underline font-semibold">imgur.com/upload</a>, unggah gambar, lalu salin link (contoh: <code className="text-zinc-200 font-mono">https://i.imgur.com/abc1234.jpg</code>).</li>
            <li>Tempelkan ke input di bawah. Foto akan langsung tampil di website Anda!</li>
          </ol>
        </div>
      )}

      {/* Presets Row */}
      {showPresets && (
        <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-xl space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
            <span>Pilih Cepat Contoh Foto Imgur:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-zinc-500 hover:text-white text-[10px]"
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
                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-white hover:text-black text-[10px] text-zinc-300 border border-zinc-700 transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Notification Badge */}
      {uploadNotice && (
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0 text-white" />
            {uploadNotice}
          </span>
          {value && (
            <button
              type="button"
              onClick={handleCopyCurrentLink}
              className="px-2 py-0.5 rounded bg-white text-black hover:bg-zinc-200 text-[10px] font-bold transition cursor-pointer"
            >
              {copiedLink ? 'Tersalin!' : 'Salin Link'}
            </button>
          )}
        </div>
      )}

      {/* Main Image Controls */}
      <div className="flex items-start gap-3">
        {/* Preview Thumbnail */}
        <div className={`${aspectClass} rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0 shadow-inner group`}>
          {value && !imageError ? (
            <img
              src={value}
              alt={itemTypeLabel}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-[10px] p-1 text-center">
              <ImageIcon className="w-5 h-5 mb-0.5 text-zinc-600" />
              <span>{imageError ? 'Link Tidak Valid' : 'Belum Ada Foto'}</span>
            </div>
          )}

          {/* Quick upload overlay */}
          <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
            <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-16 py-1.5 text-xs text-white outline-none font-mono focus:border-zinc-500 transition"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value && isPublic && (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-white p-1"
                  title="Buka gambar di tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                  title="Hapus URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-[11px] font-medium flex items-center gap-1 border border-zinc-800 transition cursor-pointer"
              title="Tempel link dari clipboard"
            >
              {copiedSuccess ? <Check className="w-3 h-3 text-white" /> : <Clipboard className="w-3 h-3" />}
              <span>{copiedSuccess ? 'Ditempel!' : 'Paste Link'}</span>
            </button>

            {/* Upload File Button */}
            <label className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow">
              {isUploading ? <RefreshCw className="w-3 h-3 animate-spin text-black" /> : <Upload className="w-3 h-3 text-black" />}
              <span>{isUploading ? 'Mengunggah...' : 'Upload File (Link Asli)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* Copy Real Link Button (if value exists) */}
            {value && isPublic && (
              <button
                type="button"
                onClick={handleCopyCurrentLink}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-zinc-800 transition cursor-pointer"
                title="Salin link gambar asli untuk digunakan di web manapun"
              >
                {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Asli'}</span>
              </button>
            )}

            {/* Status indicator badge */}
            {isImgur ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] font-mono" title="Tersimpan di CDN Imgur, dapat dilihat di website manapun">
                <Globe className="w-2.5 h-2.5" />
                Imgur CDN (Online)
              </span>
            ) : isPublic ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono" title="Link online publik">
                <Globe className="w-2.5 h-2.5" />
                Link Publik
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
