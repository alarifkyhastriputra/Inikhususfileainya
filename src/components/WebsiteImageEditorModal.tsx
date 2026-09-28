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
  Copy
} from 'lucide-react';
import { normalizeImageUrl, uploadImageFile, isPublicImageUrl } from '../lib/imageUtils';

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
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);
  const [showImgurHelp, setShowImgurHelp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Extract all images from HTML code
  useEffect(() => {
    if (!isOpen || !htmlCode) return;

    const detected: DetectedImage[] = [];
    const seenUrls = new Set<string>();

    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    let index = 1;
    while ((match = imgRegex.exec(htmlCode)) !== null) {
      const fullTag = match[0];
      const src = match[1];

      if (src && !src.startsWith('data:image/svg+xml') && !seenUrls.has(src)) {
        seenUrls.add(src);

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

    setImages(detected);
  }, [isOpen, htmlCode]);

  if (!isOpen) return null;

  const handleUpdateImageUrl = (id: string, newUrl: string) => {
    const normalized = normalizeImageUrl(newUrl);
    setImages(images.map((img) => (img.id === id ? { ...img, newUrl: normalized } : img)));
  };

  const handlePasteClipboard = async (id: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUpdateImageUrl(id, text);
      }
    } catch {}
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        handleUpdateImageUrl(id, res.url);
      } else {
        alert(res.error || 'Gagal mengupload gambar.');
      }
    } catch (err: any) {
      alert('Gagal mengupload gambar: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleApplyChanges = () => {
    let updatedHtml = htmlCode;

    images.forEach((img) => {
      if (img.newUrl && img.newUrl !== img.originalUrl) {
        const escapedOrig = img.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const replaceRegex = new RegExp(escapedOrig, 'g');
        updatedHtml = updatedHtml.replace(replaceRegex, img.newUrl);
      }
    });

    onSaveHtml(updatedHtml);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-4xl h-[90vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Kelola & Ganti Foto Website</h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono font-bold">
                  {images.length} Foto Terdeteksi
                </span>
              </div>
              <p className="text-xs text-zinc-400">Ganti foto dengan link Imgur atau upload file untuk link asli publik</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImgurHelp(!showImgurHelp)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panduan Imgur</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Imgur Help Box */}
        {showImgurHelp && (
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-white" />
                Cara Upload & Ambil Link Imgur:
              </span>
              <a
                href="https://imgur.com/upload"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white underline flex items-center gap-1"
              >
                <span>Buka imgur.com/upload</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>Buka <b className="text-white">imgur.com/upload</b> di browser Anda.</li>
              <li>Upload foto produk / banner yang diinginkan.</li>
              <li>Klik kanan pada foto dan pilih <b>"Copy Image Address"</b> (format link: <code className="text-zinc-200 font-mono">https://i.imgur.com/abc.jpg</code>).</li>
              <li>Tempel (Paste) link tersebut ke input foto yang ingin diganti di bawah, lalu klik <b>"Terapkan Perubahan Foto"</b>.</li>
            </ol>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-black">
          {images.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
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
                        ? 'bg-zinc-900 border-white shadow-lg' 
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Foto #{idx + 1}: {img.alt || 'Gambar'}
                        </span>
                        {isImgur && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700">
                            Imgur
                          </span>
                        )}
                        {isModified && (
                          <span className="px-1.5 py-0.5 rounded bg-white text-black text-[10px] font-bold">
                            Telah Diedit
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{img.type}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Thumbnail Preview */}
                      <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0 group">
                        <img 
                          src={img.newUrl || img.originalUrl} 
                          alt={img.alt} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://i.imgur.com/8Km9tLL.jpg';
                          }}
                        />

                        <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition">
                          {uploadingId === img.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
                          <Link2 className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={img.newUrl}
                            onChange={(e) => handleUpdateImageUrl(img.id, e.target.value)}
                            placeholder="https://i.imgur.com/... atau URL foto"
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white outline-none font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handlePasteClipboard(img.id)}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center gap-1 border border-zinc-800 transition"
                          >
                            <Clipboard className="w-2.5 h-2.5" />
                            <span>Paste Link</span>
                          </button>

                          <label className="px-2 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow">
                            {uploadingId === img.id ? <RefreshCw className="w-2.5 h-2.5 animate-spin text-black" /> : <Upload className="w-2.5 h-2.5 text-black" />}
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(img.id, e)}
                              disabled={uploadingId === img.id}
                              className="hidden"
                            />
                          </label>

                          {img.newUrl && isPublicImageUrl(img.newUrl) && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(img.newUrl);
                                    setCopiedImageId(img.id);
                                    setTimeout(() => setCopiedImageId(null), 2000);
                                  } catch {}
                                }}
                                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-medium flex items-center gap-1 border border-zinc-800 transition cursor-pointer"
                                title="Salin link gambar asli"
                              >
                                {copiedImageId === img.id ? <Check className="w-2.5 h-2.5 text-white" /> : <Copy className="w-2.5 h-2.5" />}
                                <span>{copiedImageId === img.id ? 'Tersalin' : 'Salin'}</span>
                              </button>

                              <a
                                href={img.newUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center gap-1 border border-zinc-800 transition"
                                title="Buka gambar di tab baru"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Buka</span>
                              </a>
                            </>
                          )}

                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleUpdateImageUrl(img.id, img.originalUrl)}
                              className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition"
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
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            {images.filter(i => i.newUrl !== i.originalUrl).length > 0 ? (
              <span className="text-white font-semibold">
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
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold transition"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={saveSuccess}
              className="px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
              <span>{saveSuccess ? 'Berhasil Diterapkan!' : 'Terapkan Perubahan Foto'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
