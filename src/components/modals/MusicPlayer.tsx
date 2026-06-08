

import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { musicPlayerStore } from "@/store/MusicPlayerStore";
import Image from "next/image";
import { useEffect } from "react";
import { linkify } from "@/app/utils";
// import FadeInImage from "../FadeInImage";

// ========== MusicPlayer ==========
export const MusicPlayer = observer(() => {
  useEffect(() => {
    if (musicPlayerStore.currentTrack) {
      musicPlayerStore.isOpening = true;
      musicPlayerStore.isClosing = false;
      // Small delay to allow the component to render before starting the slide-up animation
      requestAnimationFrame(() => {
        musicPlayerStore.isOpening = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicPlayerStore.currentTrack]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    musicPlayerStore.seek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    musicPlayerStore.setVolume(Number(e.target.value));
  };

  const closePlayer = () => {
    musicPlayerStore.isClosing = true;
    setTimeout(() => musicPlayerStore.closePlayer(), 300);
  };

  if (!musicPlayerStore.currentTrack) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-b border-white/10 backdrop-blur-md z-50 border-t border-white/10 bg-black/${store.currentTabIdx === 1 ? 50 : 10}`}
      style={{
        backdropFilter: 'blur(8px)',
        transform: musicPlayerStore.isClosing ? 'translateY(100%)' : (musicPlayerStore.isOpening ? 'translateY(100%)' : 'translateY(0)'),
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
          <div className="flex items-center gap-3 min-w-[160px] flex-1 lg:flex-none lg:min-w-[280px]">
            {musicPlayerStore.currentTrack.coverUrl ? (
              <Image
                src={musicPlayerStore.currentTrack.coverUrl}
                alt={musicPlayerStore.currentTrack.title}
                width="48"
                height="48"
                className="w-12 h-12 rounded object-cover flex-shrink-0 cursor-pointer"
                onClick={() => musicPlayerStore.currentTrack && musicPlayerStore.openModal(musicPlayerStore.currentTrack)}
              />
            ) : (
              <div
                className="w-12 h-12 rounded bg-highlight/20 flex items-center justify-center flex-shrink-0 cursor-pointer"
                onClick={() => musicPlayerStore.currentTrack && musicPlayerStore.openModal(musicPlayerStore.currentTrack)}
              >
                <svg className="w-6 h-6 text-link" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1" >
              <p className="text-subtitle font-medium text-sm truncate">{musicPlayerStore.currentTrack.title}</p>
              <p className="text-content/65 text-xs line-clamp-2" style={{ lineHeight: '14px', width: store.innerWidth > 1024 ? 'min(35vw, 560px)' : '' }}>{linkify(store.t(musicPlayerStore.currentTrack))}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 min-w-[80px]">
            <button
              onClick={() => musicPlayerStore.togglePlay()}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={musicPlayerStore.isPlaying ? "Pause" : "Play"}
            >
              {musicPlayerStore.isPlaying ? (
                <svg className="w-6 h-6 text-subtitle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-subtitle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => musicPlayerStore.toggleLoop()}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${musicPlayerStore.isLooping ? 'bg-highlight/30' : 'hover:bg-white/10'}`}
              title="Toggle loop"
            >
              <svg className="w-6 h-6 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 flex-1 min-w-[180px] ml-4">
            <span className="text-xs text-content/65 min-w-[45px]">
              {musicPlayerStore.audioRef ? formatTime(musicPlayerStore.audioRef.currentTime) : "0:00"}
            </span>
            <div className="flex-1 relative h-4">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-highlight rounded-full"
                  style={{ width: `${musicPlayerStore.progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicPlayerStore.progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-content/65 min-w-[45px]">
              {musicPlayerStore.audioRef ? formatTime(musicPlayerStore.audioRef.duration) : "0:00"}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 min-w-[100px]">
            <svg className="w-6 h-6 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <div className="relative w-20 h-4">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-highlight rounded-full"
                  style={{ width: `${musicPlayerStore.volume * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicPlayerStore.volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <button
              onClick={closePlayer}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close player"
            >
              <svg className="w-6 h-6 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        </div>
        <div className="lg:hidden flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-3 flex-1 min-w-[140px]">
            <span className="text-xs text-content/65 min-w-[45px]">
              {musicPlayerStore.audioRef ? formatTime(musicPlayerStore.audioRef.currentTime) : "0:00"}
            </span>
            <div className="flex-1 relative h-4">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-highlight rounded-full"
                  style={{ width: `${musicPlayerStore.progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicPlayerStore.progress}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-content/65 min-w-[45px]">
              {musicPlayerStore.audioRef ? formatTime(musicPlayerStore.audioRef.duration) : "0:00"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 min-w-[100px]">
            <svg className="w-6 h-6 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <div className="relative w-20 h-4">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-highlight rounded-full"
                  style={{ width: `${musicPlayerStore.volume * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicPlayerStore.volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <button
              onClick={closePlayer}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close player"
            >
              <svg className="w-6 h-6 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};