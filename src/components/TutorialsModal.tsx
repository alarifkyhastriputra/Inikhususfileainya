import React, { useState, useEffect, useRef } from 'react';
import { TutorialVideo } from '../types';
import { getTutorialVideos } from '../lib/firebase';
import { 
  Play, 
  Youtube, 
  X, 
  Search, 
  Film,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Tv
} from 'lucide-react';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialsModal: React.FC<TutorialsModalProps> = ({ isOpen, onClose }) => {
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<TutorialVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadVideos();
    } else {
      setFullscreenVideo(null);
    }
  }, [isOpen]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      // Force clear outdated local cache to ensure fresh video URLs
      localStorage.removeItem('vimos_tutorial_videos_cache');
      const vids = await getTutorialVideos();
      setTutorials(vids);
    } catch (err) {
      console.error('Error loading tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const clean = url.trim();
    const match = clean.match(/(?:youtu\.be\/|v\/|e\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*)/);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    return null;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const vidId = getYouTubeVideoId(url);
    if (vidId) {
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0&playsinline=0&enablejsapi=1`;
    }
    if (url.includes('youtube.com/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    return url;
  };

  const getThumbnailUrl = (url: string) => {
    const vidId = getYouTubeVideoId(url);
    if (vidId) {
      return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80';
  };

  // Launch Fullscreen Player immediately on click
  const handlePlayFullscreen = (vid: TutorialVideo) => {
    setFullscreenVideo(vid);

    // Try HTML5 requestFullscreen on the document or body if allowed
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // If browser restricts fullscreen in iframe, the full-viewport fixed overlay handles it
        });
      }
    } catch {}
  };

  const handleExitFullscreen = () => {
    setFullscreenVideo(null);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Keyboard shortcut listener (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenVideo) {
        handleExitFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenVideo) {
        // user pressed browser Esc to leave native fullscreen
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenVideo]);

  if (!isOpen) return null;

  const categories = ['Semua', ...Array.from(new Set(tutorials.map(v => v.category || 'Umum')))];

  const filteredTutorials = tutorials.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || (t.category || 'Umum') === selectedCategory;
    return matchSearch && matchCat;
  });

  // Next / Previous navigation in fullscreen
  const currentIndex = fullscreenVideo ? tutorials.findIndex(t => t.id === fullscreenVideo.id) : -1;
  const prevVideo = currentIndex > 0 ? tutorials[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < tutorials.length - 1 ? tutorials[currentIndex + 1] : null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FULLSCREEN VIDEO PLAYER OVERLAY (LANGSUNG FULL LAYAR & LANGSUNG NONTON) */}
      {/* ========================================================================= */}
      {fullscreenVideo && (
        <div 
          ref={fullscreenContainerRef}
          className="fixed inset-0 z-[999999] bg-black flex flex-col justify-between select-none animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]"
          style={{ width: '100vw', height: '100vh' }}
        >
          {/* Top Control Bar in Fullscreen */}
          <div className="w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent p-3 sm:p-5 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3 max-w-[70%]">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
                <Youtube className="w-5 h-5 fill-black" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white text-black text-[10px] font-bold uppercase tracking-wider font-mono">
                    Layar Penuh (Full Screen)
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                    {fullscreenVideo.category || 'Tutorial'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white truncate drop-shadow">
                  {fullscreenVideo.title}
                </h2>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Prev Video Button */}
              {prevVideo && (
                <button
                  onClick={() => setFullscreenVideo(prevVideo)}
                  title={`Sebelumnya: ${prevVideo.title}`}
                  className="px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold hidden md:flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Tutorial Sebelumnya</span>
                </button>
              )}

              {/* Next Video Button */}
              {nextVideo && (
                <button
                  onClick={() => setFullscreenVideo(nextVideo)}
                  title={`Berikutnya: ${nextVideo.title}`}
                  className="px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold hidden md:flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Tutorial Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Open in YouTube App/Tab */}
              <a
                href={fullscreenVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 sm:px-3.5 sm:py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Buka di YouTube"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Buka YouTube</span>
              </a>

              {/* Exit Fullscreen Button */}
              <button
                onClick={handleExitFullscreen}
                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl transition cursor-pointer active:scale-95"
              >
                <Minimize2 className="w-4 h-4 text-black" />
                <span>Keluar Layar Penuh</span>
                <span className="hidden sm:inline text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">ESC</span>
              </button>
            </div>
          </div>

          {/* Video Player Center Frame */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
            <iframe
              key={fullscreenVideo.id}
              src={getEmbedUrl(fullscreenVideo.videoUrl)}
              title={fullscreenVideo.title}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Bottom Bar in Fullscreen */}
          <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 shrink-0 text-xs text-zinc-400">
            <p className="line-clamp-1 text-center sm:text-left text-zinc-300">
              💡 {fullscreenVideo.description || fullscreenVideo.title}
            </p>
            <div className="flex items-center gap-3 text-[11px] shrink-0 text-zinc-400">
              <span>Klik <strong className="text-white">Keluar Layar Penuh</strong> atau tekan <strong className="text-white">Esc</strong> untuk kembali ke daftar video</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAFTAR VIDEO TUTORIAL MODAL (THEMA HITAM PUTIH RESPONSIF)              */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-black border border-zinc-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-zinc-100">
          
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center border border-zinc-200 shrink-0 shadow">
                <Youtube className="w-5 h-5 fill-black" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Pusat Video Tutorial Vimos.ai</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono font-semibold">
                    {tutorials.length} Video
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Tekan video mana saja untuk langsung menonton dalam <strong>layar penuh (Full Screen)</strong> otomatis.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-black">
            
            {/* Search & Categories Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tutorial..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-black font-bold shadow'
                        : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Videos Grid */}
            {loading ? (
              <div className="text-center py-20 text-zinc-500 text-xs font-mono space-y-2">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Memuat video tutorial resmi...</p>
              </div>
            ) : filteredTutorials.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs space-y-2">
                <Film className="w-10 h-10 mx-auto opacity-40 text-zinc-400" />
                <span>Tidak ada video tutorial yang cocok dengan pencarian Anda.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTutorials.map((vid, idx) => {
                  const thumb = vid.thumbnailUrl || getThumbnailUrl(vid.videoUrl);

                  return (
                    <div
                      key={vid.id}
                      onClick={() => handlePlayFullscreen(vid)}
                      className="bg-zinc-950 border border-zinc-800 hover:border-white rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                    >
                      {/* Video Thumbnail Box */}
                      <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        
                        {/* Overlay with large Fullscreen Play button */}
                        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 flex flex-col items-center justify-center transition-all duration-300 p-4">
                          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition duration-300">
                            <Play className="w-7 h-7 fill-black ml-1 text-black" />
                          </div>
                          <span className="mt-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg group-hover:bg-white group-hover:text-black transition">
                            <Maximize2 className="w-3 h-3" />
                            <span>Tekan untuk Nonton Layar Penuh</span>
                          </span>
                        </div>

                        {/* Top Tutorial Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-zinc-700 text-white text-[11px] font-bold font-mono">
                            Tutorial #{idx + 1}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white text-black text-[10px] font-bold font-mono uppercase tracking-wider">
                            {vid.category || 'Tutorial'}
                          </span>
                        </div>
                      </div>

                      {/* Video Information */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-zinc-200 transition leading-snug">
                            {vid.title}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                            {vid.description}
                          </p>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Tekan untuk langsung putar
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayFullscreen(vid);
                            }}
                            className="px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" />
                            <span>Nonton Layar Penuh</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 shrink-0">
            <span className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-zinc-300" />
              <span>Semua video dapat ditonton langsung tanpa keluar dari aplikasi Vimos.</span>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl font-semibold transition cursor-pointer w-full sm:w-auto"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
