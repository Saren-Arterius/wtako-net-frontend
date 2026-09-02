"use client";

import { observer } from "mobx-react-lite";
import { MonitorStore } from "@/store/MonitorStore";

// singleton listener; client-only (module import during prerender skips it)
const magiMonitor =
  typeof window !== "undefined" ? new MonitorStore("https://magi-monitor.wtako.net/") : null;

// inline alert strip for pages whose feature depends on MAGI; zh-TW like those pages
export const MagiBanner = observer(() => {
  // isAlive re-evaluates via MonitorStore's 1s polling tick — stale data never alerts
  if (!magiMonitor || !magiMonitor.isAlive) return null;
  const { aiHealth, vllmMetrics } = magiMonitor;

  const down = !!aiHealth && !aiHealth.thinking_brain?.healthy;
  const loaded = !!vllmMetrics && vllmMetrics.numRequestsRunning >= 4;
  if (!down && !loaded) return null;

  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm text-center ${down ? "bg-red-500/20 border border-red-500/30 text-red-200" : "bg-amber-500/10 border border-amber-500/20 text-amber-200/90"}`}
    >
      {down ? "❌ Magi 掛了" : "⚠️ Magi 負載較高"}
    </div>
  );
});
