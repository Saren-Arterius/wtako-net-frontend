// Realtime link-traffic helpers for the network diagram poster.
// Data arrives over the monitor websocket (MonitorStore.lanInfo / io.networkRx/Tx).
import { store } from "@/store/store";

export const formatBps = (bps: number): string => {
  // units without the "bps" suffix: "24.4M", "1364"
  if (bps >= 1024 * 1024 * 1024) return `${(bps / (1024 * 1024 * 1024)).toFixed(1)}G`;
  if (bps >= 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)}M`;
  if (bps >= 1024) return `${(bps / 1024).toFixed(1)}K`;
  return `${bps}`;
};

const COLOR_STOPS = [
  { color: "#99a37e", position: 0 },
  { color: "#F7EE7F", position: 50 },
  { color: "#A63D40", position: 90 },
  { color: "#A63D40", position: 100 },
];
// text variant: zero pressure reads as the plain label color, then joins the
// wire ramp
export const TEXT_STOPS = [
  { color: "#E9DFCF", position: 0 },
  { color: "#F7EE7F", position: 50 },
  { color: "#A63D40", position: 90 },
  { color: "#A63D40", position: 100 },
];

function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

export function getColorAtPercent(percent: number, stops: { color: string; position: number }[] = COLOR_STOPS) {
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  let start = stops[0];
  let end = stops[1];

  for (let i = 1; i < stops.length; i++) {
    if (percent <= stops[i].position) {
      start = stops[i - 1];
      end = stops[i];
      break;
    }
  }

  const range = end.position - start.position;
  const adjustedPercent = (percent - start.position) / range;

  const startRGB = hexToRGB(start.color);
  const endRGB = hexToRGB(end.color);

  const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * adjustedPercent);
  const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * adjustedPercent);
  const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * adjustedPercent);

  return rgbToHex(r, g, b);
}

// rx/tx bps for one interface of one host, with the router/AI-core special
// cases that report through the io totals instead of lanInfo.
export const getBPS = (host: string, nif: string): [number | undefined, number | undefined] => {
  let rx_bps, tx_bps;
  if (host === "192.168.0.1" && nif === "ext1") {
    rx_bps = store?.serverWithStores[0]?.store?.io?.networkRx * 8;
    tx_bps = store?.serverWithStores[0]?.store?.io?.networkTx * 8;
  } else if (host === "192.168.0.1" && nif === "int2") {
    rx_bps = store?.serverWithStores[1]?.store?.io?.networkRx * 8;
    tx_bps = store?.serverWithStores[1]?.store?.io?.networkTx * 8;
  }
  const lanInfo = store?.serverWithStores[0]?.store?.lanInfo;
  if (lanInfo != null && !rx_bps && !tx_bps) {
    const nifObj = lanInfo[host]?.interfaces[nif];
    if (nifObj) {
      rx_bps = nifObj.rx_bps;
      tx_bps = nifObj.tx_bps;
    }
  }
  return [rx_bps, tx_bps];
};

// link color by max(rx,tx) saturation of capacity
export const getStrokeColor = (host: string, nif: string, rxMbpsMax: number, txMbpsMax: number | null = null) => {
  let [rx_bps, tx_bps] = getBPS(host, nif);
  if (!rx_bps) rx_bps = 0;
  if (!tx_bps) tx_bps = 0;
  let pct = (rx_bps / (rxMbpsMax * 1024 * 1024)) * 100;
  if (txMbpsMax !== null) {
    const pct2 = (tx_bps / (txMbpsMax * 1024 * 1024)) * 100;
    if (pct2 > pct) pct = pct2;
  } else {
    const pct2 = (tx_bps / (rxMbpsMax * 1024 * 1024)) * 100;
    if (pct2 > pct) pct = pct2;
  }
  return getColorAtPercent(pct);
};
