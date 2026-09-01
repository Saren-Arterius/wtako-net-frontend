import type { ReactNode } from "react";

// Shared modal chrome (backdrop + panel with fade in/out, aspect-aware width)
// and the image box, extracted from the gallery ImageViewer so every viewer
// positions and displays images identically.

export function ModalShell({
  isClosing,
  onClose,
  aspectRatio,
  panelClassName = "max-w-3xl",
  children,
}: {
  isClosing: boolean;
  onClose: () => void;
  aspectRatio?: number;
  panelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        animation: isClosing ? "backdropFadeOut 0.2s ease-out forwards" : "backdropFadeIn 0.2s ease-out forwards",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-black/50 border border-white/20 rounded-xl ${panelClassName} w-full overflow-auto relative`}
        style={{
          marginBottom: 0,
          animation: isClosing ? "modalFadeOut 0.2s ease-out forwards" : "modalFadeIn 0.2s ease-out forwards",
          maxHeight: "calc(100vh - 10rem)",
          ...(aspectRatio
            ? { minWidth: `min(calc((100vh - 10rem) * ${aspectRatio}), calc(100vw - 10rem))` }
            : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalImage({
  src,
  alt,
  aspectRatio,
  onClick,
  children,
}: {
  src?: string;
  alt?: string;
  aspectRatio?: number;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 backdrop-blur-md rounded-lg overflow-hidden mb-4 cursor-pointer relative"
      style={{ aspectRatio, maxHeight: "65vh" }}
    >
      {children ?? <img src={src} alt={alt} className="w-full h-full object-contain" />}
    </div>
  );
}
