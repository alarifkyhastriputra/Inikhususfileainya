import React, { useState, useEffect } from 'react';
import { TutorialVideo } from '../types';
import { getTutorialVideos } from '../lib/firebase';
import { 
  Play, 
  Youtube, 
  X, 
  Clock, 
  Tag, 
  ExternalLink, 
  Sparkles, 
  Search, 
  BookOpen,
  Film
} from 'lucide-react';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialsModal: React.FC<TutorialsModalProps> = ({ isOpen, onClose }) => {
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const loadVideos = async () => {
    setLoading(true);
    const vids = await getTutorialVideos();
    setTutorials(vids);
    if (vids.length > 0 && !selectedVideo) {
      // Default select first video if none selected
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const clean = url.trim();
    const match = clean.match(/(?:youtu\.be\/|v\/|e\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*)/);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    return null;
  };

  // Helper to convert YouTube URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const vidId = getYouTubeVideoId(url);
    if (vidId) {
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
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

  const categories = ['Semua', ...Array.from(new Set(tutorials.map(v => v.category || 'Umum')))];

  const filteredTutorials = tutorials.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || (t.category || 'Umum') === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pusat Video Tutorial YouTube</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                  {tutorials.length} Video
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pelajari cara membuat website, menambah kredit, dan tips optimasi bisnis bersama Vimos.ai.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Active Player Modal / Banner if video selected */}
          {selectedVideo ? (
            <div className="bg-[#182238] border border-slate-700 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Sedang Diputar</span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{selectedVideo.category || 'Tutorial'}</span>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Tutup Pemutar
                </button>
              </div>

              {/* YouTube Responsive Embed */}
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-slate-700 relative">
                <iframe
                  src={getEmbedUrl(selectedVideo.videoUrl)}
                  title={selectedVideo.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedVideo.description}</p>
              </div>
            </div>
          ) : null}

          {/* Search & Categories Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari video tutorial..."
                className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-[#182238] text-slate-300 hover:text-white border border-slate-700/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-mono">
              Memuat video tutorial...
            </div>
          ) : filteredTutorials.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs space-y-2">
              <Film className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <span>Belum ada video tutorial yang tersedia saat ini.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTutorials.map((vid) => {
                const thumb = getThumbnailUrl(vid.videoUrl);
                const isSelected = selectedVideo?.id === vid.id;

                return (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideo(vid)}
                    className={`bg-[#182238] border rounded-2xl overflow-hidden group cursor-pointer transition flex flex-col shadow-lg hover:border-indigo-500/60 ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-700/80'
                    }`}
                  >
                    {/* Thumbnail box */}
                    <div className="aspect-video w-full bg-slate-900 relative overflow-hidden">
                      <img
                        src={vid.thumbnailUrl || thumb}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono font-bold">
                        {vid.duration || '05:00'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{vid.category || 'Tutorial'}</span>
                        <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-300 transition">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(vid.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        <span className="text-red-400 font-bold flex items-center gap-1 group-hover:underline">
                          <Youtube className="w-3 h-3" />
                          Tonton
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Klik video untuk langsung memutar di pemutar web.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
