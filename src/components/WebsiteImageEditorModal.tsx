import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Upload, 
  Link2, 
  Clipboard, 
  ExternalLink, 
  RefreshCw, 
  HelpCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { normalizeImageUrl, uploadImageFile } from '../lib/imageUtils';

interface DetectedImage {
  id: string;
  originalUrl: string;
  newUrl: string;
  alt: string;
  tagContext: string;
  type: 'img' | 'background';
}

interface WebsiteImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  onSaveHtml: (newHtml: string) => void;
}

export const WebsiteImageEditorModal: React.FC<WebsiteImageEditorModalProps> = ({
  isOpen,
  onClose,
  htmlCode,
  onSaveHtml,
}) => {
  const [images, setImages] = useState<DetectedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showImgurHelp, setShowImgurHelp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Extract all images from HTML code
  useEffect(() => {
    if (!isOpen || !htmlCode) return;

    const detected: DetectedImage[] = [];
    const seenUrls = new Set<string>();

    // 1. Match <img ... src="..." ...>
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    let index = 1;
    while ((match = imgRegex.exec(htmlCode)) !== null) {
      const fullTag = match[0];
      const src = match[1];

      if (src && !src.startsWith('data:image/svg+xml') && !seenUrls.has(src)) {
        seenUrls.add(src);

        // Extract alt if available
        const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : `Foto #${index}`;

        detected.push({
          id: `img_${index}`,
          originalUrl: src,
          newUrl: src,
          alt: alt || `Gambar #${index}`,
          tagContext: fullTag.substring(0, 100),
          type: 'img',
        });
        index++;
      }
    }

    // 2. Match background-image: url(...) in style attributes
    const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
    while ((match = bgRegex.exec(htmlCode)) !== null) {
      const src = match[1];
      if (src && !src.startsWith('data:') && !seenUrls.has(src)) {
        seenUrls.add(src);
        detected.push({
          id: `bg_${index}`,
          originalUrl: src,
          newUrl: src,
          alt: `Background Hero / Section #${index}`,
          tagContext: match[0],
          type: 'background',
        });
        index++;
      }
    }

    setImages(detected);
    if (detected.length > 0) {
      setSelectedImageId(detected[0].id);
    }
  }, [isOpen, htmlCode]);

  if (!isOpen) return null;

  const handleUpdateImageUrl = (id: string, rawUrl: string) => {
    const normalized = normalizeImageUrl(rawUrl);
    setImages(prev => prev.map(img => img.id === id ? { ...img, newUrl: normalized } : img));
  };

  const handlePasteClipboard = async (id: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUpdateImageUrl(id, text);
      }
    } catch {
      // Fallback
    }
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        handleUpdateImageUrl(id, res.url);
      }
    } finally {
      setUploadingId(null);
    }
  };

  const handleApplyChanges = () => {
    let updatedHtml = htmlCode;
    let changeCount = 0;

    images.forEach(img => {
      if (img.newUrl && img.newUrl !== img.originalUrl) {
        // Replace all occurrences of originalUrl with newUrl
        // Escape regex special chars
        const escaped = img.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        updatedHtml = updatedHtml.replace(new RegExp(escaped, 'g'), img.newUrl);
        changeCount++;
      }
    });

    onSaveHtml(updatedHtml);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const selectedImage = images.find(img => img.id === selectedImageId) || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kelola Foto & Link Imgur Website</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {images.length} Foto Terdeteksi
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ganti foto produk, banner, atau logo langsung menggunakan <b>Link Imgur</b> atau upload file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImgurHelp(!showImgurHelp)}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panduan Imgur</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Imgur Help Box */}
        {showImgurHelp && (
          <div className="p-4 bg-indigo-950/60 border-b border-indigo-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Cara Upload & Ambil Link Imgur:
              </span>
              <a
                href="https://imgur.com/upload"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Buka imgur.com/upload</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Buka <b className="text-white">imgur.com/upload</b> di browser Anda.</li>
              <li>Upload foto produk / banner yang diinginkan.</li>
              <li>Klik kanan pada foto dan pilih <b className="text-emerald-400">"Copy Image Address"</b> (format link: <code className="text-emerald-300 font-mono">https://i.imgur.com/abc.jpg</code>).</li>
              <li>Tempel (Paste) link tersebut ke input foto yang ingin diganti di bawah, lalu klik <b>"Terapkan Perubahan Foto"</b>.</li>
            </ol>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {images.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <span>Tidak ada tag foto atau gambar yang terdeteksi di dalam kode HTML website ini.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, idx) => {
                const isModified = img.newUrl !== img.originalUrl;
                const isImgur = img.newUrl?.includes('imgur.com');

                return (
                  <div 
                    key={img.id}
                    className={`p-4 rounded-2xl border transition relative space-y-3 ${
                      isModified 
                        ? 'bg-indigo-950/30 border-indigo-500/70 shadow-lg' 
                        : 'bg-[#182238] border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Foto #{idx + 1}: {img.alt || 'Gambar'}
                        </span>
                        {isImgur && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                            Imgur Link
                          </span>
                        )}
                        {isModified && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            Telah Diedit
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{img.type}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Thumbnail Preview */}
                      <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0 group">
                        <img 
                          src={img.newUrl || img.originalUrl} 
                          alt={img.alt} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                          }}
                        />

                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
                          {uploadingId === img.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 mb-0.5" />
                              <span>Ganti</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(img.id, e)}
                            disabled={uploadingId === img.id}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* URL Input & Controls */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="relative">
                          <Link2 className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={img.newUrl}
                            onChange={(e) => handleUpdateImageUrl(img.id, e.target.value)}
                            placeholder="https://i.imgur.com/... atau URL foto"
                            className="w-full bg-[#0B0F19] border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white outline-none font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handlePasteClipboard(img.id)}
                            className="px-2 py-1 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center gap-1 border border-slate-700 transition"
                          >
                            <Clipboard className="w-2.5 h-2.5" />
                            <span>Paste Link</span>
                          </button>

                          <label className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-indigo-500/40 cursor-pointer transition">
                            {uploadingId === img.id ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(img.id, e)}
                              disabled={uploadingId === img.id}
                              className="hidden"
                            />
                          </label>

                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleUpdateImageUrl(img.id, img.originalUrl)}
                              className="px-2 py-1 text-[10px] text-slate-400 hover:text-rose-400 transition"
                              title="Reset ke foto awal"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {images.filter(i => i.newUrl !== i.originalUrl).length > 0 ? (
              <span className="text-emerald-400 font-semibold">
                {images.filter(i => i.newUrl !== i.originalUrl).length} foto telah diubah dan siap diterapkan.
              </span>
            ) : (
              <span>Pilih foto untuk mengganti link Imgur atau upload gambar baru.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={saveSuccess}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveSuccess ? 'Berhasil Diterapkan!' : 'Terapkan Perubahan Foto'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
