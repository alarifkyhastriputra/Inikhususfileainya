import React, { useState, useEffect, useRef } from 'react';
import { BackgroundMusicSettings } from '../types';
import { getBackgroundMusic } from '../lib/firebase';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Repeat, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const clean = url.trim();
  // Match youtube.com, youtu.be, music.youtube.com
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?/\s]{11})/;
  const match = clean.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  return '';
}

export const BackgroundMusicPlayer: React.FC = () => {
  const [musicConfig, setMusicConfig] = useState<BackgroundMusicSettings | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasStartedRef = useRef(false);

  // 1. Fetch current background music settings
  const fetchMusicSettings = async () => {
    try {
      const cfg = await getBackgroundMusic();
      if (cfg) {
        setMusicConfig(cfg);
        if (typeof cfg.volume === 'number') {
          setVolume(cfg.volume);
        }
      }
    } catch (err) {
      console.warn('Failed to load background music:', err);
    }
  };

  useEffect(() => {
    fetchMusicSettings();

    // Listen for custom event when admin saves music in the same window
    const handleMusicUpdated = (e: any) => {
      if (e.detail) {
        setMusicConfig(e.detail);
        if (typeof e.detail.volume === 'number') {
          setVolume(e.detail.volume);
        }
        setIsPlaying(Boolean(e.detail.enabled));
      } else {
        fetchMusicSettings();
      }
    };

    window.addEventListener('vimos_bg_music_updated', handleMusicUpdated);
    return () => {
      window.removeEventListener('vimos_bg_music_updated', handleMusicUpdated);
    };
  }, []);

  const videoId = musicConfig?.videoUrl ? extractYouTubeId(musicConfig.videoUrl) : '';

  // 2. Command sender helper to YouTube iframe
  const sendIframeCommand = (command: string, args: any = '') => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args !== '' ? [args] : ''
          }),
          '*'
        );
      }
    } catch {}
  };

  // 3. User interaction listener for browser autoplay restriction
  useEffect(() => {
    if (!musicConfig?.enabled || !videoId) return;

    const startPlayback = () => {
      setHasInteracted(true);
      setNeedsUserGesture(false);
      sendIframeCommand('unMute');
      sendIframeCommand('setVolume', volume);
      sendIframeCommand('playVideo');
      setIsPlaying(true);
      hasStartedRef.current = true;
    };

    if (musicConfig.autoplay && !hasStartedRef.current) {
      // First attempt direct play
      const timer = setTimeout(() => {
        sendIframeCommand('setVolume', volume);
        sendIframeCommand('playVideo');
      }, 1000);

      // Also listen to any first user interaction anywhere on the website
      const handleFirstGesture = () => {
        startPlayback();
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
        window.removeEventListener('touchstart', handleFirstGesture);
      };

      window.addEventListener('click', handleFirstGesture, { once: true });
      window.addEventListener('keydown', handleFirstGesture, { once: true });
      window.addEventListener('touchstart', handleFirstGesture, { once: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
        window.removeEventListener('touchstart', handleFirstGesture);
      };
    }
  }, [musicConfig?.enabled, videoId, musicConfig?.autoplay]);

  // 4. Listen for postMessage from YouTube Iframe for infinite loop & state
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const parsed = JSON.parse(e.data);
          // When video ends (state 0), force loop restart immediately
          if (parsed.event === 'onStateChange' && parsed.info === 0) {
            sendIframeCommand('seekTo', 0);
            sendIframeCommand('playVideo');
            setIsPlaying(true);
          }
          if (parsed.event === 'onStateChange' && parsed.info === 1) {
            setIsPlaying(true);
            setNeedsUserGesture(false);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sendIframeCommand('setVolume', newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      sendIframeCommand('unMute');
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendIframeCommand('unMute');
      sendIframeCommand('setVolume', volume);
      sendIframeCommand('playVideo');
      setIsPlaying(true);
      setNeedsUserGesture(false);
      setHasInteracted(true);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      sendIframeCommand('unMute');
      sendIframeCommand('setVolume', volume || 30);
      setIsMuted(false);
    } else {
      sendIframeCommand('mute');
      setIsMuted(true);
    }
  };

  if (!musicConfig || !musicConfig.enabled || !videoId) {
    return null;
  }

  // YouTube embed URL with loop=1&playlist=${videoId} for infinite loop
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&enablejsapi=1&controls=0&playsinline=1&rel=0`;

  return (
    <>
      {/* Hidden YouTube Iframe Player for Background Audio (Positioned safely off-screen) */}
      <div 
        className="fixed -top-[2000px] left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="Vimos Background Audio"
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
        />
      </div>

      {/* Floating Music Widget for Members & Visitors */}
      <div className="fixed bottom-4 left-4 z-40 font-['Plus_Jakarta_Sans',sans-serif] select-none">
        
        {/* If user hasn't interacted and browser waiting for gesture */}
        {needsUserGesture && !isPlaying && (
          <div className="mb-2 animate-bounce">
            <button
              onClick={togglePlay}
              className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border border-zinc-200 hover:scale-105 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Putar Musik Latar Web</span>
            </button>
          </div>
        )}

        {/* EXPANDED PLAYER CARD */}
        {isExpanded ? (
          <div className="bg-black/95 border border-zinc-800 backdrop-blur-xl rounded-2xl p-4 shadow-2xl w-72 sm:w-80 space-y-3 text-zinc-100 animate-fadeIn border-t-zinc-700">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-white text-black shadow' : 'bg-zinc-900 text-zinc-400'}`}>
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                      BGM Web
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono flex items-center gap-0.5">
                      <Repeat className="w-2.5 h-2.5" />
                      <span>Loop</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition cursor-pointer"
                title="Kecilkan Pemutar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Track Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white truncate">
                  {musicConfig.title || 'Musik Latar'}
                </h4>
                {isPlaying && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-2 bg-white rounded-full animate-bounce"></span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {musicConfig.artist || 'Vimos AI Platform'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={togglePlay}
                className="flex-1 py-2 px-3 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Putar Musik</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition cursor-pointer"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <a
                href={musicConfig.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition"
                title="Buka di YouTube / YouTube Music"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Volume Slider */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Volume</span>
                <span>{isMuted ? '0%' : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        ) : (
          /* COLLAPSED FLOATING PILL (COMPACT & CLEAN) */
          <div className="flex items-center gap-2 bg-black/90 border border-zinc-800 hover:border-zinc-600 backdrop-blur-xl rounded-full p-1.5 pr-3 shadow-2xl transition duration-300">
            {/* Play / Pause Round Button */}
            <button
              onClick={togglePlay}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition cursor-pointer active:scale-90 ${
                isPlaying 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900 text-white border border-zinc-700'
              }`}
              title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-black" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            {/* Title / Animation */}
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 cursor-pointer max-w-[140px] sm:max-w-[180px]"
            >
              {isPlaying ? (
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-0.5 h-2 bg-white rounded-full animate-bounce"></span>
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}

              <span className="text-xs font-bold text-white truncate">
                {musicConfig.title || 'Musik Latar'}
              </span>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Expand Arrow */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Buka Pengaturan Suara"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </>
  );
};
