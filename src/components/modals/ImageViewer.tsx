


import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observer } from "mobx-react-lite";
import { imageViewerStore } from "@/store/ImageViewerStore";
import { store } from "@/store/store";
import { linkify } from "@/app/utils";
import { filterOptions } from "@/app/art/page";
import FadeInImage from "../FadeInImage";

const handleArtQP = (isBack: boolean) => {
  if (!store.config?.art) return;

  if (isBack) {
    if (imageViewerStore.selectedArt) {
      const url = new URL(window.location.href);
      url.searchParams.delete("art");
      if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
      imageViewerStore.closeArt();
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const artUrl = searchParams.get("art");
      const matchingArt = artUrl ? store.art.find(a => a.imageUrl === artUrl) : undefined;
      if (!imageViewerStore.selectedArt && matchingArt) {
        imageViewerStore.openArt(matchingArt);
      }
    }
    return;
  }

  if (!imageViewerStore.pageInited) {
    const searchParams = new URLSearchParams(window.location.search);
    const artUrl = searchParams.get("art");
    const matchingArt = artUrl ? store.art.find(a => a.imageUrl === artUrl) : undefined;
    if (!imageViewerStore.selectedArt && matchingArt) {
      imageViewerStore.openArt(matchingArt);
    }
    imageViewerStore.pageInited = true;
    return;
  }

  if (!imageViewerStore.selectedArt) {
    const url = new URL(window.location.href);
    url.searchParams.delete("art");
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
    imageViewerStore.pageInited = true;
  } else if (imageViewerStore.selectedArt) {
    const url = new URL(window.location.href);
    url.searchParams.set("art", imageViewerStore.selectedArt.imageUrl);
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
    imageViewerStore.pageInited = true;
  }
}

export const ImageViewer = observer(() => {
  const { selectedArt, isClosing, isImageLoaded, isVideoPlaying } = imageViewerStore;
  const pathname = usePathname();

  useEffect(() => {
    const handlePopState = () => {
      handleArtQP(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);


  // Listen for ?art={imageUrl} on pathname changes
  useEffect(() => {
    handleArtQP(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, selectedArt, store.config?.art]);

  if (!selectedArt) return null;

  const thumbnailUrl = selectedArt.thumbImageUrl || selectedArt.imageUrl;
  const hasVideo = selectedArt.extraVideoUrl;

  const aspectRatio = selectedArt.width && selectedArt.height ? selectedArt.width / selectedArt.height : 1;
  return (
    <div
      onClick={() => imageViewerStore.closeArt()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        animation: isClosing ? 'backdropFadeOut 0.2s ease-out forwards' : 'backdropFadeIn 0.2s ease-out forwards'
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black/50 border border-white/20 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto relative"
        style={{
          marginBottom: 0,
          animation: isClosing ? 'modalFadeOut 0.2s ease-out forwards' : 'modalFadeIn 0.2s ease-out forwards',
          maxHeight: 'calc(100vh - 10rem)',
          minWidth: `min(calc((100vh - 10rem) * ${aspectRatio}), calc(100vw - 10rem))`
        }}
      >
        <div className="p-6 flex justify-center flex-col">
          <div className="bg-white/5 backdrop-blur-md rounded-lg overflow-hidden mb-4 cursor-pointer relative"
            onClick={() => window.open(selectedArt.imageUrl, "_blank")}
            style={{
              aspectRatio,
              maxHeight: '65vh'
            }}>
            {/* Loading spinner */}
            {!isImageLoaded && !isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-10 h-10 border-4 border-highlight/30 border-t-highlight rounded-full animate-spin" />
              </div>
            )}
            {/* Thumbnail as cover - always on top initially */}
            {!isVideoPlaying && (
              <>
                <img
                  src={thumbnailUrl}
                  alt={selectedArt.title}
                  className={`w-full h-full object-contain absolute inset-0`}
                  style={{ zIndex: 0 }}
                />
                <img
                  src={selectedArt.imageUrl}
                  alt={selectedArt.title}
                  className={`w-full h-full object-contain absolute inset-0`}
                  style={{ zIndex: 1 }}
                  onLoad={() => (imageViewerStore.isImageLoaded = true)}
                />
              </>
            )}
            {/* Video overlay */}
            {isVideoPlaying && (
              <video
                src={selectedArt.extraVideoUrl}
                className="w-full h-full object-contain absolute inset-0"
                style={{ zIndex: 2 }}
                controls
                autoPlay
                loop
              />
            )}
          </div>

          {hasVideo && (
            <button
              onClick={() => imageViewerStore.toggleVideoPlayback()}
              className="flex items-center gap-2 text-link text-sm hover:text-highlight mb-4"
              style={{ cursor: 'pointer' }}
            >
              {isVideoPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                  {store.t('Show Image')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {store.t('Watch Video (Audio maybe loud)')}
                </>
              )}
            </button>
          )}

          <div className="space-y-2">
            <p className="text-subtitle text-sm">{linkify(store.t(selectedArt))}</p>

            <div className="flex items-center gap-2 mt-4">
              <span
                className={`text-xs px-2 py-0.5 rounded ${selectedArt.type === "COMM"
                  ? "bg-purple-500/20 text-purple-400"
                  : selectedArt.type === "AI"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-highlight/20 text-link"
                  }`}
              >
                {store.t(filterOptions.find(o => o.key === selectedArt.type)?.label || selectedArt.type)}
              </span>
              {selectedArt.date && (
                <span className="text-xs text-subtitle">
                  {selectedArt.date.slice(0, 4)}-{selectedArt.date.slice(4, 6)}-{selectedArt.date.slice(6, 8)}
                </span>
              )}
            </div>

            {selectedArt.author && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <span className="text-subtitle">{store.t('by')}</span>
                {selectedArt.author.link ? (
                  <a
                    href={selectedArt.author.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:text-highlight"
                  >
                    {selectedArt.author.name}
                  </a>
                ) : (
                  <span className="text-subtitle">{selectedArt.author.name}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
