"use client";

import { observer } from "mobx-react-lite";
import { createPortal } from "react-dom";
import { useState } from "react";
import { MonitorStore } from "@/store/MonitorStore";
import { store } from "@/store/store";

// singleton listener; client-only (module import during prerender skips it)
const magiMonitor =
  typeof window !== "undefined" ? new MonitorStore("https://magi-monitor.wtako.net/") : null;

// bottom alert strip (construction-banner look), roast-me page only;
// click anywhere (or the X) slides it down and keeps it gone until page reload
export const MagiBanner = observer(() => {
  const [closing, setClosing] = useState(false);

  // isAlive re-evaluates via MonitorStore's 1s polling tick — stale data never alerts
  if (!magiMonitor || !magiMonitor.isAlive || store.magiBannerDismissed) return null;
  const { aiHealth, vllmMetrics } = magiMonitor;

  const down = !!aiHealth && !aiHealth.thinking_brain?.healthy;
  const loaded = !!vllmMetrics && vllmMetrics.numRequestsRunning >= 4;
  if (!down && !loaded) return null;

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      store.magiBannerDismissed = true;
      setClosing(false);
    }, 300);
  };

  // portal to body so nothing in the page tree can unstick it from the viewport bottom
  return createPortal(
    <div
      onClick={dismiss}
      style={{ animation: ` ${closing ? "slide-down" : "slide-up"} 0.3s ease-out forwards` }}
      className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t text-white text-xs py-1.5 px-4 cursor-pointer ${
        down ? "bg-red-600/60 border-red-500/40" : "bg-amber-600/50 border-amber-500/40"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <span>{down ? "❌ Magi 掛了" : "⚠️ Magi 負載較高"}</span>
        <button className="text-white ml-3 p-1" aria-label="Close" style={{ cursor: "pointer" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
});
