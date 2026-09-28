import React, { useState, useEffect } from 'react';
import { TutorialVideo, UserProfile } from '../types';
import { getTutorialVideos } from '../lib/firebase';
import { 
  X, 
  Play, 
  Tv, 
  ExternalLink, 
  Clock, 
  Image as ImageIcon, 
  Copy, 
  Check, 
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
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTutorialVideos().then(list => {
        setTutorials(list);
        if (list.length > 0 && !selectedVideo) {
          setSelectedVideo(list[0]);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(tutorials.map(t => t.category || 'Umum')))];

  const filteredVideos = tutorials.filter(t => {
    if (selectedCategory === 'all') return true;
    return (t.category || 'Umum') === selectedCategory;
  });

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl h-[92vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center text-white">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Pusat Tutorial & Panduan Video</h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono font-bold">
                  vimos.ai
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">Tonton tutorial cara membuat website, upload foto Imgur, dan kustomisasi fitur</p>
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
                className="hidden sm:flex px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-bold items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Kelola Video (Admin)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat === 'all' ? 'Semua Tutorial' : cat}
            </button>
          ))}
        </div>

        {/* Content Main Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden bg-black">
          
          {/* Left / Top: Active Video Player & Details */}
          <div className="lg:col-span-2 p-4 sm:p-6 overflow-y-auto space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-black">
            {selectedVideo ? (
              <div className="space-y-4">
                {/* Responsive Video Player Embed */}
                <div className="aspect-video w-full rounded-2xl bg-black border border-zinc-800 overflow-hidden shadow-2xl relative group">
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
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
                      <Tv className="w-12 h-12 text-zinc-400 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Tautan Video Tutorial Eksternal</h4>
                      <p className="text-xs text-zinc-400 max-w-md mb-4 font-mono">{selectedVideo.videoUrl}</p>
                      <a
                        href={selectedVideo.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow transition"
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
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-semibold text-[11px] border border-zinc-800 font-mono">
                      {selectedVideo.category || 'Umum'}
                    </span>
                    {selectedVideo.duration && (
                      <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedVideo.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{selectedVideo.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedVideo.description}</p>
                </div>

                {/* Imgur Quick Guide Card */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-white" />
                      <span>Tips: Cara Upload Foto Produk via Imgur</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyImgurTip}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Link Disalin!' : 'Buka Imgur.com'}</span>
                    </button>
                  </div>
                  <ol className="text-[11px] text-zinc-400 space-y-1 list-decimal pl-4 leading-relaxed">
                    <li>Buka <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-white underline font-semibold">imgur.com/upload</a> (gratis tanpa perlu registrasi).</li>
                    <li>Seret atau pilih foto produk/menu Anda.</li>
                    <li>Salin link gambar asli yang dihasilkan (contoh: <code className="text-zinc-200 font-mono">https://i.imgur.com/abc.jpg</code>).</li>
                    <li>Tempelkan ke kolom gambar di Langkah 9 atau tombol Ganti Foto.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
                <Tv className="w-12 h-12 mb-2 text-zinc-600" />
                <p className="text-xs">Pilih salah satu video tutorial di daftar sebelah kanan.</p>
              </div>
            )}
          </div>

          {/* Right: Playlist / List of Videos */}
          <div className="p-4 overflow-y-auto space-y-3 bg-zinc-950">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-300">Daftar Video ({filteredVideos.length})</span>
              <span className="text-[10px] text-zinc-500">Klik video untuk memutar</span>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
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
                        ? 'bg-zinc-900 border-white shadow-lg ring-1 ring-white/30'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {/* Thumbnail Box */}
                    <div className="w-20 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden group-hover:border-zinc-700 transition">
                      {tut.thumbnailUrl ? (
                        <img src={tut.thumbnailUrl} alt={tut.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                          <Play className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-zinc-400'}`} />
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
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate font-mono">
                          {tut.category || 'Umum'}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition ${
                        isCurrent ? 'text-white' : 'text-zinc-200 group-hover:text-white'
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
