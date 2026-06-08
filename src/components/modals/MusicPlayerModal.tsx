"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { observer } from "mobx-react-lite";
import { musicPlayerStore } from "@/store/MusicPlayerStore";
import { store } from "@/store/store";
import FadeInImage from "../FadeInImage";
import { linkify } from "@/app/utils";

const handleMusicQP = (isBack: boolean) => {
  if (isBack) {
    if (musicPlayerStore.selectedTrackForModal) {
      const url = new URL(window.location.href);
      url.searchParams.delete("music");
      if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
      musicPlayerStore.closeModal();
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const musicUrl = searchParams.get("music");
      const matchingTrack = musicUrl ? store.music.find(m => m.url === musicUrl) : undefined;
      if (!musicPlayerStore.selectedTrackForModal && matchingTrack) {
        musicPlayerStore.openModal(matchingTrack);
      }
    }
    return;
  }

  if (!musicPlayerStore.pageInited) {
    const searchParams = new URLSearchParams(window.location.search);
    const musicUrl = searchParams.get("music");
    const matchingTrack = musicUrl ? store.music.find(m => m.url === musicUrl) : undefined;
    if (!musicPlayerStore.selectedTrackForModal && matchingTrack) {
      musicPlayerStore.openModal(matchingTrack);
    }
    musicPlayerStore.pageInited = true;
    return;
  }

  if (!musicPlayerStore.selectedTrackForModal) {
    const url = new URL(window.location.href);
    url.searchParams.delete("music");
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
    musicPlayerStore.pageInited = true;
  } else if (musicPlayerStore.selectedTrackForModal) {
    const url = new URL(window.location.href);
    url.searchParams.set("music", musicPlayerStore.selectedTrackForModal.url);
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
    musicPlayerStore.pageInited = true;
  }
};

export const MusicPlayerModal = observer(() => {
  const { selectedTrackForModal, isClosingModal } = musicPlayerStore;
  const pathname = usePathname();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    const handlePopState = () => handleMusicQP(true);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    handleMusicQP(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, selectedTrackForModal, store.music]);

  if (!selectedTrackForModal) return null;

  return (
    <div
      onClick={() => musicPlayerStore.closeModal()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        animation: isClosingModal ? 'backdropFadeOut 0.2s ease-out forwards' : 'backdropFadeIn 0.2s ease-out forwards'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="backdrop-blur-md rounded-4xl max-w-md w-full p-6 relative"
        style={{
          animation: isClosingModal ? 'modalFadeOut 0.2s ease-out forwards' : 'modalFadeIn 0.2s ease-out forwards',
          opacity: isClosingModal ? 0 : 1,
          backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8) ), url(${selectedTrackForModal.coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Title */}
        <h3 className="text-xl text-highlight text-center mb-2">{selectedTrackForModal.title}</h3>
        {selectedTrackForModal.date && (
          <p className="text-subtitle/60 text-sm text-center mb-6">
            {selectedTrackForModal.date.slice(0, 4)}-{selectedTrackForModal.date.slice(4, 6)}-{selectedTrackForModal.date.slice(6, 8)}
          </p>
        )}
        <p className="text-subtitle text-sm text-center mb-6">{linkify(store.t(selectedTrackForModal))}</p>

        {/* Play button */}
        <button
          onClick={() => {
            musicPlayerStore.playTrack(selectedTrackForModal);
            musicPlayerStore.closeModal();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 backdrop-blur-sm transition-colors"
          style={{ cursor: 'pointer' }}
        >
          {store.t('Listen')}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {/* Copy link */}
        <span
          onClick={async () => {
            const url = `${window.location.origin}${pathname}?music=${selectedTrackForModal.url}`;
            try {
              await navigator.clipboard.writeText(url);
              setCopyStatus('copied');
              setTimeout(() => setCopyStatus('idle'), 1000);
            } catch {
              // Silent fail for non-critical action
            }
          }}
          className="text-sm text-subtitle/60 text-center mt-4 cursor-pointer underline hover:text-subtitle transition-colors block"
          style={{ userSelect: 'none' }}
        >
          {copyStatus === 'copied' ? store.t('Copied') : store.t('Copy Link')}
        </span>
      </div>
    </div>
  );
});
