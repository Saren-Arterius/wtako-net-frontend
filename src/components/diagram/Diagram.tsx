"use client";

import { createContext, useEffect, useRef, useState } from "react";
import styles from "./diagram.module.css";

// lets deeply-nested map pieces (the security chain) re-layout for narrow mode
export const NarrowCtx = createContext(false);

// The pages are 297mm x 210mm (A4 landscape) with mm-based absolute
// positions, exactly as in homelab-infograph/*.html. We render at true size
// and scale to the container so the layout is pixel-faithful to the originals.
const MM = 96 / 25.4; // CSS px per mm
const PAGE_W = 297 * MM;
// original 210mm page minus the removed 20.5mm header band (see .shift)
const PAGE_H = 179.5 * MM;

const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(" ");
// renderNarrow: on phones (< MIN_W) the canvas scales to the MAP width
// (mapW mm, default 205) instead of the full page so the map fits without
// horizontal scrolling, gets the .narrow class (hides the side column), and
// renderNarrow() re-renders that column below the canvas as plain unscaled,
// readable HTML.
const DEFAULT_MAP_W = 205;
const NARROW_TRIGGER = 900; // px, below this use the mobile view

export const Canvas = ({ children, renderNarrow, narrowTitle, mapW = DEFAULT_MAP_W, mapBottom = 186, mapBottomNarrow, narrowMaxW }: {
  children: React.ReactNode;
  renderNarrow?: () => React.ReactNode;
  narrowTitle?: React.ReactNode; // rendered as plain left-aligned HTML above the map, narrow only
  mapW?: number;
  mapBottom?: number; // mm, where the map content ends in the narrow crop
  mapBottomNarrow?: number; // same, when the layout reflows (bigger cards/labels)
  narrowMaxW?: number; // px cap for the narrow map (then centered): keep ≤ mapW*MM*NARROW_TRIGGER/PAGE_W so it never exceeds the desktop rendering
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(PAGE_W);
  const [zoomed, setZoomed] = useState(false);
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const f = () => setVh(window.innerHeight);
    f();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("resize", f);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("resize", f);
      window.removeEventListener("keydown", esc);
    };
  }, []);
  const reflow = w < NARROW_TRIGGER && !!renderNarrow && !zoomed;
  const vw = reflow ? Math.min(w, narrowMaxW ?? Infinity) : w;
  const scale = reflow ? vw / (mapW * MM) : vw / PAGE_W;
  // narrow: the canvas ends where the map content ends; the divider + stats
  // (and side column) continue below as unscaled HTML flow.
  const mapEnd = reflow && mapBottomNarrow !== undefined ? mapBottomNarrow : mapBottom;
  const pageH = reflow ? (mapEnd + 2) * MM : PAGE_H;
  const page = (s: number, narrow: boolean) => (
    <div
      className={cx(styles.page, narrow && styles.narrow)}
      style={{
        transform: `scale(${s})`,
        transformOrigin: "top left",
        ...(narrow ? { "--mapw": `${mapW}mm`, "--mapwn": `${mapW}`, "--inv": `${1 / s}`, height: pageH } as React.CSSProperties : null),
      }}
    >
      {/* keeps the original mm coordinates while the header band is gone */}
      <div className={styles.shift}>
        <NarrowCtx.Provider value={narrow}>{children}</NarrowCtx.Provider>
      </div>
    </div>
  );
  // zoom: the full poster at 80% of the viewport height, panning horizontally
  const zScale = (0.8 * vh) / PAGE_H;
  const zoomBtn = (cls: string) => (
    <button
      onClick={() => setZoomed(!zoomed)}
      aria-label={zoomed ? "close enlarged diagram" : "enlarge diagram"}
      className={cx(cls, "rounded-md bg-white/10 hover:bg-white/25 text-content/80 px-2 py-1 text-sm backdrop-blur-sm")}
    >
      {zoomed ? "✕" : "⛶"}
    </button>
  );
  if (zoomed) {
    // inline expansion: the poster grows to 80% of the viewport height, in
    // place, panning horizontally; the button stays pinned to the screen
    return (
      <div className="relative w-full overflow-x-auto" style={{ height: 0.8 * vh }}>
        {zoomBtn("fixed top-4 right-4 z-40")}
        <div style={{ width: PAGE_W * zScale, height: 0.8 * vh }} className="overflow-hidden">
          {page(zScale, false)}
        </div>
      </div>
    );
  }
  return (
    <div ref={outerRef} className="relative w-full overflow-x-auto">
      {/* enlarge only helps when the poster is scaled down; wide screens show it full-size */}
      {reflow && zoomBtn("absolute top-2 right-2 z-10")}
      {/* narrowTitle: .bh div(s) rendered as plain left-aligned flow HTML */}
      {reflow && narrowTitle && (
        <div className={styles.sideFlow}>
          {narrowTitle}
        </div>
      )}
      <div style={{ width: vw, height: pageH * scale, margin: reflow && vw < w ? "0 auto" : undefined }} className="overflow-hidden">
        {page(scale, reflow)}
      </div>
      {reflow && renderNarrow()}
    </div>
  );
};

interface Pos {
  left: string;
  top: string;
  width?: string;
  height?: string;
}

export const Dev = ({
  pos,
  role,
  keyDev,
  outline,
  icon,
  name,
  sub,
}: {
  pos: Pos;
  role?: string;
  keyDev?: boolean;
  outline?: boolean;
  icon: React.ReactNode;
  name: string;
  sub: string;
}) => (
  <div className={cx(styles.dev, keyDev && styles.key, outline && styles.ups)} style={pos}>
    {role && <span className={styles.role}>{role}</span>}
    <div className={styles.img}>
      <svg className={cx(styles.ic, styles.icDev)} viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <div className={styles.name}>{name}</div>
    <div className={styles.sub}>{sub}</div>
  </div>
);

export const Chip = ({
  pos,
  outline,
  className,
  children,
}: {
  pos: Pos;
  outline?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cx(styles.chip, outline && styles.ups, className)} style={pos}>
    {children}
  </div>
);

// cable / speed label pinned at its center point
export const Wl = ({ pos, className, children }: { pos: Pos; className?: string; children: React.ReactNode }) => (
  <div className={cx(styles.wl, className)} style={pos}>
    {children}
  </div>
);
