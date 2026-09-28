import React, { useState, useEffect } from 'react';
import { TutorialVideo, UserProfile } from '../types';
import { getTutorialVideos } from '../lib/firebase';
import { 
  X, 
  Play, 
  Tv, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Tag, 
  HelpCircle, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Layers, 
  ShoppingBag, 
  Wand2,
  ShieldCheck
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onOpenAdminTutorials?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAdminTutorials
}) => {
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const loadVideos = async () => {
    setLoading(true);
    const list = await getTutorialVideos();
    setTutorials(list);
    if (list.length > 0 && !selectedVideo) {
      setSelectedVideo(list[0]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(tutorials.map(t => t.category || 'Umum')))];

  const filteredVideos = tutorials.filter(t => {
    if (selectedCategory === 'all') return true;
    return (t.category || 'Umum') === selectedCategory;
  });

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    return url;
  };

  const isEmbeddable = (url: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') || 
           url.includes('loom.com') || 
           url.endsWith('.mp4') || 
           url.includes('/embed/');
  };

  const handleCopyImgurTip = () => {
    navigator.clipboard.writeText('https://imgur.com/upload');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[92vh] bg-[#0E131F] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center text-white">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Pusat Tutorial & Panduan Video</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  vimos.ai Guide
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Tonton tutorial cara membuat website, upload foto Imgur, dan kustomisasi fitur</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenAdminTutorials && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminTutorials();
                }}
                className="hidden sm:flex px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold items-center gap-1.5 transition cursor-pointer"
                title="Buka panel untuk tambah/edit video tutorial"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Kelola Video (Admin)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0F19]/60 border-b border-slate-800/80 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Semua Tutorial' : cat}
            </button>
          ))}
        </div>

        {/* Content Main Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          
          {/* Left / Top: Active Video Player & Details */}
          <div className="lg:col-span-2 p-4 sm:p-6 overflow-y-auto space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0B0F19]/40">
            {selectedVideo ? (
              <div className="space-y-4">
                {/* Responsive Video Player Embed */}
                <div className="aspect-video w-full rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl relative group">
                  {isEmbeddable(selectedVideo.videoUrl) ? (
                    selectedVideo.videoUrl.endsWith('.mp4') ? (
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(selectedVideo.videoUrl)}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-indigo-950/40 to-slate-950">
                      <Tv className="w-12 h-12 text-indigo-400 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Tautan Video Tutorial Eksternal</h4>
                      <p className="text-xs text-slate-400 max-w-md mb-4">{selectedVideo.videoUrl}</p>
                      <a
                        href={selectedVideo.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-lg transition"
                      >
                        <span>Tonton Video di Tab Baru</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] border border-indigo-500/30">
                      {selectedVideo.category || 'Umum'}
                    </span>
                    {selectedVideo.duration && (
                      <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedVideo.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{selectedVideo.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedVideo.description}</p>
                </div>

                {/* Imgur Quick Guide Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>💡 Tips Praktis: Cara Upload Foto Produk via Imgur</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyImgurTip}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Link Disalin!' : 'Buka Imgur.com'}</span>
                    </button>
                  </div>
                  <ol className="text-[11px] text-slate-300 space-y-1 list-decimal pl-4 leading-relaxed">
                    <li>Buka <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">imgur.com/upload</a> (gratis tanpa perlu registrasi).</li>
                    <li>Seret atau pilih foto produk/menu Anda.</li>
                    <li>Salin link gambar yang dihasilkan (contoh: <code className="text-amber-300 font-mono">https://i.imgur.com/abc.jpg</code> atau <code className="text-amber-300 font-mono">https://imgur.com/abc</code>).</li>
                    <li>Tempelkan ke kolom <strong>"Link Imgur / Gambar"</strong> di Langkah 9 atau tombol Ganti Foto.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                <Tv className="w-12 h-12 mb-2 text-slate-600" />
                <p className="text-xs">Pilih salah satu video tutorial di daftar sebelah kanan.</p>
              </div>
            )}
          </div>

          {/* Right: Playlist / List of Videos */}
          <div className="p-4 overflow-y-auto space-y-3 bg-[#0B0F19]/80">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300">Daftar Video ({filteredVideos.length})</span>
              <span className="text-[10px] text-slate-500">Klik video untuk memutar</span>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Belum ada video tutorial di kategori ini.
              </div>
            ) : (
              filteredVideos.map((tut, idx) => {
                const isCurrent = selectedVideo?.id === tut.id;
                return (
                  <div
                    key={tut.id}
                    onClick={() => setSelectedVideo(tut)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex gap-3 items-start group ${
                      isCurrent
                        ? 'bg-indigo-950/70 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'bg-[#182238]/60 border-slate-800 hover:border-slate-700 hover:bg-[#182238]'
                    }`}
                  >
                    {/* Thumbnail Box */}
                    <div className="w-20 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 relative overflow-hidden group-hover:border-indigo-500 transition">
                      {tut.thumbnailUrl ? (
                        <img src={tut.thumbnailUrl} alt={tut.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 flex items-center justify-center">
                          <Play className={`w-5 h-5 ${isCurrent ? 'text-amber-400' : 'text-slate-300'}`} />
                        </div>
                      )}
                      {tut.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-white font-bold">
                          {tut.duration}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {tut.category || 'Umum'}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition ${
                        isCurrent ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'
                      }`}>
                        {tut.title}
                      </h4>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
