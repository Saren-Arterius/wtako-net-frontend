import { TransformedRealTimeRate } from "@/store/MonitorStore";
import { store } from "@/store/store";
import { observer } from "mobx-react-lite"

const formatBps = (bps: number): string => {
  if (bps >= 1024 * 1024 * 1024) return `${(bps / (1024 * 1024 * 1024)).toFixed(1)} Gbps`;
  if (bps >= 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} Mbps`;
  if (bps >= 1024) return `${(bps / 1024).toFixed(1)} Kbps`;
  return `${bps} bps`;
};

const COLOR_STOPS = [
  { color: "#99a37e", position: 0 },
  { color: "#F7EE7F", position: 50 },
  { color: "#A63D40", position: 90 },
  { color: "#A63D40", position: 100 }
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


function getColorAtPercent(percent: number) {
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  let start = COLOR_STOPS[0];
  let end = COLOR_STOPS[1];

  for (let i = 1; i < COLOR_STOPS.length; i++) {
    if (percent <= COLOR_STOPS[i].position) {
      start = COLOR_STOPS[i - 1];
      end = COLOR_STOPS[i];
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


export const NetworkGraphCache = observer(() => {

  const lanInfo: TransformedRealTimeRate | null = store?.serverWithStores[0].store?.lanInfo;

  const getBPS = (host: string, nif: string) => {
    let rx_bps, tx_bps;
    if (host === '192.168.0.1' && nif === 'ext1') {
      rx_bps = store?.serverWithStores[0]?.store?.io?.networkRx * 8;
      tx_bps = store?.serverWithStores[0]?.store?.io?.networkTx * 8;
    } else if (host === '192.168.0.1' && nif === 'int2') {
      rx_bps = store?.serverWithStores[1]?.store?.io?.networkRx * 8;
      tx_bps = store?.serverWithStores[1]?.store?.io?.networkTx * 8;
    }
    if (lanInfo != null && !rx_bps && !tx_bps) {
      const nifObj = lanInfo[host].interfaces[nif];
      if (nifObj) {
        rx_bps = nifObj.rx_bps;
        tx_bps = nifObj.tx_bps;
      }
    }
    return [rx_bps, tx_bps];
  }

  const getStrokeColor = (host: string, nif: string, rxMbpsMax: number, txMbpsMax: number | null = null) => {
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
  }

  const getBPSDisplay = (host: string, nif: string, reversed = false) => {
    let [rx_bps, tx_bps] = getBPS(host, nif);

    if (!rx_bps && !tx_bps) {
      return (<span style={{ fontSize: 12, opacity: 0.8 }}>N/A</span>);
    }

    if (!rx_bps) rx_bps = 0;
    if (!tx_bps) tx_bps = 0;

    if (reversed) {
      const tmp: number = rx_bps;
      rx_bps = tx_bps;
      tx_bps = tmp;
    }

    return (<>
      <span style={{ color: "rgb(255, 168, 175)", fontSize: 12 }}>↑{formatBps(tx_bps)}</span>&nbsp;
      <span style={{ color: "rgb(163, 203, 179)", fontSize: 12 }}>↓{formatBps(rx_bps)}</span>
    </>);

  }

  return (<svg
    id="mermaid-diagram"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
    className="flowchart"
    style={{ maxWidth: "1188.5px" }}
    viewBox="0 0 1188.5 867.5999755859375"
    role="graphics-document document"
    aria-roledescription="flowchart-v2"
  >
    <style
      dangerouslySetInnerHTML={{
        __html:
          `    
    #mermaid-diagram {
      font-family: system-ui;
      font-size: 16px;
      fill: #ccc;
    }

    @keyframes edge-animation-frame {
      from {
        stroke-dashoffset: 0;
      }
    }

    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }

    #mermaid-diagram .edge-animation-slow {
      stroke-dasharray: 9, 5 !important;
      stroke-dashoffset: 900;
      animation: dash 50s linear infinite;
      stroke-linecap: round;
    }

    #mermaid-diagram .edge-animation-fast {
      stroke-dasharray: 9, 5 !important;
      stroke-dashoffset: 900;
      animation: dash 20s linear infinite;
      stroke-linecap: round;
    }

    #mermaid-diagram .error-icon {
      fill: #a44141;
    }

    #mermaid-diagram .error-text {
      fill: #ddd;
      stroke: #ddd;
    }

    #mermaid-diagram .edge-thickness-normal {
      stroke-width: 1px;
    }

    #mermaid-diagram .edge-thickness-thick {
      stroke-width: 3.5px;
    }

    #mermaid-diagram .edge-pattern-solid {
      stroke-dasharray: 0;
    }

    #mermaid-diagram .edge-thickness-invisible {
      stroke-width: 0;
      fill: none;
    }

    #mermaid-diagram .edge-pattern-dashed {
      stroke-dasharray: 3;
    }

    #mermaid-diagram .edge-pattern-dotted {
      stroke-dasharray: 2;
    }

    #mermaid-diagram .marker {
      fill: #99a37e;
      stroke: #99a37e;
    }

    #mermaid-diagram .marker.cross {
      stroke: #99a37e;
    }

    #mermaid-diagram svg {
      font-family: system-ui;
      font-size: 16px;
    }

    #mermaid-diagram p {
      margin: 0;
    }

    #mermaid-diagram .label {
      font-family: system-ui;
      color: #ccc;
    }

    #mermaid-diagram .cluster-label text {
      fill: #F9FFFE;
    }

    #mermaid-diagram .cluster-label span {
      color: #F9FFFE;
    }

    #mermaid-diagram .cluster-label span p {
      background-color: transparent;
    }

    #mermaid-diagram .label text,
    #mermaid-diagram span {
      fill: #ccc;
      color: #ccc;
    }

    #mermaid-diagram .node rect,
    #mermaid-diagram .node circle,
    #mermaid-diagram .node ellipse,
    #mermaid-diagram .node polygon,
    #mermaid-diagram .node path {
      fill: #ffffff10;
      stroke: #99a37e;
      stroke-width: 1px;
    }

    #mermaid-diagram .rough-node .label text,
    #mermaid-diagram .node .label text,
    #mermaid-diagram .image-shape .label,
    #mermaid-diagram .icon-shape .label {
      text-anchor: middle;
    }

    #mermaid-diagram .node .katex path {
      fill: #000;
      stroke: #000;
      stroke-width: 1px;
    }

    #mermaid-diagram .rough-node .label,
    #mermaid-diagram .node .label,
    #mermaid-diagram .image-shape .label,
    #mermaid-diagram .icon-shape .label {
      text-align: center;
    }

    #mermaid-diagram .node.clickable {
      cursor: pointer;
    }

    #mermaid-diagram .root .anchor path {
      fill: #99a37e !important;
      stroke-width: 0;
      stroke: #99a37e;
    }

    #mermaid-diagram .arrowheadPath {
      fill: lightgrey;
    }

    #mermaid-diagram .edgePath .path {
      stroke: #99a37e;
      stroke-width: 1px;
    }

    #mermaid-diagram .flowchart-link {
      stroke: #99a37e;
      fill: none;
    }

    #mermaid-diagram .edgeLabel {
      background-color: #33342fde !important;
      text-align: center;
    }

    #mermaid-diagram .edgeLabel p {
      background-color: #33342fde !important;
    }

    #mermaid-diagram .edgeLabel rect {
      opacity: 0.5;
      background-color: #33342fde !important;
      fill: #33342fde !important;
    }

    #mermaid-diagram .labelBkg {
      background-color: rgba(87.75, 87.75, 87.75, 0.5);
    }

    #mermaid-diagram .cluster rect {
      fill: #1a1f24;
      stroke: #99a37e;
      stroke-width: 1px;
    }

    #mermaid-diagram .cluster text {
      fill: #F9FFFE;
    }

    #mermaid-diagram .cluster span {
      color: #F9FFFE;
    }

    #mermaid-diagram div.mermaidTooltip {
      position: absolute;
      text-align: center;
      max-width: 200px;
      padding: 2px;
      font-family: system-ui;
      font-size: 12px;
      background: #1a1f24;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 2px;
      pointer-events: none;
      z-index: 100;
    }

    #mermaid-diagram .flowchartTitleText {
      text-anchor: middle;
      font-size: 18px;
      fill: #ccc;
    }

    #mermaid-diagram rect.text {
      fill: none;
      stroke-width: 0;
    }

    #mermaid-diagram .icon-shape,
    #mermaid-diagram .image-shape {
      background-color: hsl(0, 0%, 34.4117647059%);
      text-align: center;
    }

    #mermaid-diagram .icon-shape p,
    #mermaid-diagram .image-shape p {
      background-color: hsl(0, 0%, 34.4117647059%);
      padding: 2px;
    }

    #mermaid-diagram .icon-shape .label rect,
    #mermaid-diagram .image-shape .label rect {
      opacity: 0.5;
      background-color: hsl(0, 0%, 34.4117647059%);
      fill: hsl(0, 0%, 34.4117647059%);
    }

    #mermaid-diagram .label-icon {
      display: inline-block;
      height: 1em;
      overflow: visible;
      vertical-align: -0.125em;
    }

    #mermaid-diagram .node .label-icon path {
      fill: currentColor;
      stroke: revert;
      stroke-width: revert;
    }

    #mermaid-diagram .node .neo-node {
      stroke: #99a37e;
    }

    #mermaid-diagram [data-look="neo"].node rect,
    #mermaid-diagram [data-look="neo"].cluster rect,
    #mermaid-diagram [data-look="neo"].node polygon {
      stroke: url(#mermaid-diagram-gradient);
      filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1));
    }

    #mermaid-diagram [data-look="neo"].node path {
      stroke: url(#mermaid-diagram-gradient);
      stroke-width: 1px;
    }

    #mermaid-diagram [data-look="neo"].node .outer-path {
      filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1));
    }

    #mermaid-diagram [data-look="neo"].node .neo-line path {
      stroke: #99a37e;
      filter: none;
    }

    #mermaid-diagram [data-look="neo"].node circle {
      stroke: url(#mermaid-diagram-gradient);
      filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1));
    }

    #mermaid-diagram [data-look="neo"].node circle .state-start {
      fill: #000000;
    }

    #mermaid-diagram [data-look="neo"].icon-shape .icon {
      fill: url(#mermaid-diagram-gradient);
      filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1));
    }

    #mermaid-diagram [data-look="neo"].icon-shape .icon-neo path {
      stroke: url(#mermaid-diagram-gradient);
      filter: drop-shadow(1px 2px 2px rgba(185, 185, 185, 1));
    }

    #mermaid-diagram :root {
      --mermaid-font-family: system-ui;
    }
  
`
      }}
    />
    <g>
      <marker
        id="mermaid-diagram_flowchart-v2-pointEnd"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refX={5}
        refY={5}
        markerUnits="userSpaceOnUse"
        markerWidth={8}
        markerHeight={8}
        orient="auto"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 z"
          className="arrowMarkerPath"
          style={{ strokeWidth: 1, strokeDasharray: "1px, 0px" }}
        ></path>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-pointStart"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refX="4.5"
        refY={5}
        markerUnits="userSpaceOnUse"
        markerWidth={8}
        markerHeight={8}
        orient="auto"
      >
        <path
          d="M 0 5 L 10 10 L 10 0 z"
          className="arrowMarkerPath"
          style={{ strokeWidth: 1, strokeDasharray: "1px, 0px" }}
        ></path>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-pointEnd-margin"
        className="marker flowchart-v2"
        viewBox="0 0 11.5 14"
        refX="11.5"
        refY={7}
        markerUnits="userSpaceOnUse"
        markerWidth="10.5"
        markerHeight={14}
        orient="auto"
      >
        <path
          d="M 0 0 L 11.5 7 L 0 14 z"
          className="arrowMarkerPath"
          style={{ strokeWidth: 0, strokeDasharray: "1px, 0px" }}
        ></path>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-pointStart-margin"
        className="marker flowchart-v2"
        viewBox="0 0 11.5 14"
        refX={1}
        refY={7}
        markerUnits="userSpaceOnUse"
        markerWidth="11.5"
        markerHeight={14}
        orient="auto"
      >
        <polygon
          points="0,7 11.5,14 11.5,0"
          className="arrowMarkerPath"
          style={{ strokeWidth: 0, strokeDasharray: "1px, 0px" }}
        />
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-circleEnd"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refX={11}
        refY={5}
        markerUnits="userSpaceOnUse"
        markerWidth={11}
        markerHeight={11}
        orient="auto"
      >
        <circle
          cx={5}
          cy={5}
          r={5}
          className="arrowMarkerPath"
          style={{ strokeWidth: 1, strokeDasharray: "1px, 0px" }}
        ></circle>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-circleStart"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refX={-1}
        refY={5}
        markerUnits="userSpaceOnUse"
        markerWidth={11}
        markerHeight={11}
        orient="auto"
      >
        <circle
          cx={5}
          cy={5}
          r={5}
          className="arrowMarkerPath"
          style={{ strokeWidth: 1, strokeDasharray: "1px, 0px" }}
        ></circle>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-circleEnd-margin"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refY={5}
        refX="12.25"
        markerUnits="userSpaceOnUse"
        markerWidth={14}
        markerHeight={14}
        orient="auto"
      >
        <circle
          cx={5}
          cy={5}
          r={5}
          className="arrowMarkerPath"
          style={{ strokeWidth: 0, strokeDasharray: "1px, 0px" }}
        ></circle>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-circleStart-margin"
        className="marker flowchart-v2"
        viewBox="0 0 10 10"
        refX={-2}
        refY={5}
        markerUnits="userSpaceOnUse"
        markerWidth={14}
        markerHeight={14}
        orient="auto"
      >
        <circle
          cx={5}
          cy={5}
          r={5}
          className="arrowMarkerPath"
          style={{ strokeWidth: 0, strokeDasharray: "1px, 0px" }}
        ></circle>
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-crossEnd"
        className="marker cross flowchart-v2"
        viewBox="0 0 11 11"
        refX={12}
        refY="5.2"
        markerUnits="userSpaceOnUse"
        markerWidth={11}
        markerHeight={11}
        orient="auto"
      >
        <path
          d="M 1,1 l 9,9 M 10,1 l -9,9"
          className="arrowMarkerPath"
          style={{ strokeWidth: 2, strokeDasharray: "1px, 0px" }}
        />
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-crossStart"
        className="marker cross flowchart-v2"
        viewBox="0 0 11 11"
        refX={-1}
        refY="5.2"
        markerUnits="userSpaceOnUse"
        markerWidth={11}
        markerHeight={11}
        orient="auto"
      >
        <path
          d="M 1,1 l 9,9 M 10,1 l -9,9"
          className="arrowMarkerPath"
          style={{ strokeWidth: 2, strokeDasharray: "1px, 0px" }}
        />
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-crossEnd-margin"
        className="marker cross flowchart-v2"
        viewBox="0 0 15 15"
        refX="17.7"
        refY="7.5"
        markerUnits="userSpaceOnUse"
        markerWidth={12}
        markerHeight={12}
        orient="auto"
      >
        <path
          d="M 1,1 L 14,14 M 1,14 L 14,1"
          className="arrowMarkerPath"
          style={{ strokeWidth: "2.5px" }}
        />
      </marker>
      <marker
        id="mermaid-diagram_flowchart-v2-crossStart-margin"
        className="marker cross flowchart-v2"
        viewBox="0 0 15 15"
        refX="-3.5"
        refY="7.5"
        markerUnits="userSpaceOnUse"
        markerWidth={12}
        markerHeight={12}
        orient="auto"
      >
        <path
          d="M 1,1 L 14,14 M 1,14 L 14,1"
          className="arrowMarkerPath"
          style={{ strokeWidth: "2.5px", strokeDasharray: "1px, 0px" }}
        />
      </marker>
      <g className="root">
        <g className="clusters" />
        <g className="edgePaths">
          <path
            d="M500.5,48L500.5,52.167C500.5,56.333,500.5,64.667,500.5,73C500.5,81.333,500.5,89.667,500.5,93.833L500.5,98"
            id="mermaid-diagram-L_ISP_Modem_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 1, fill: "none" }}
            data-edge="true"
            data-et="edge"
            data-id="L_ISP_Modem_0"
            data-points="W3sieCI6NTAwLjUsInkiOjQ4fSx7IngiOjUwMC41LCJ5Ijo3M30seyJ4Ijo1MDAuNSwieSI6OTh9XQ=="
            data-look="classic"
          />
          <path
            d="M512.281,162L515.485,170.7C518.688,179.4,525.094,196.8,573.649,216.63C622.205,236.46,712.91,258.72,758.263,269.849L803.615,280.979"
            id="mermaid-diagram-L_Modem_Router_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.1', 'ext1', 4000, 2000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Modem_Router_0"
            data-points="W3sieCI6NTEyLjI4MTQ3MzExMTA5NSwieSI6MTYyfSx7IngiOjUzMS41LCJ5IjoyMTQuMTk5OTk2OTQ4MjQyMn0seyJ4Ijo4MDcuNSwieSI6MjgxLjkzMjY0Nzg2MDc4MDA0fV0="
            data-look="classic"

          />
          <path
            d="M454.894,162L442.495,170.7C430.096,179.4,405.298,196.8,392.899,221.533C380.5,246.267,380.5,278.333,380.5,310.4C380.5,342.467,380.5,374.533,390.832,398.85C401.164,423.166,421.829,439.732,432.161,448.015L442.493,456.298"
            id="mermaid-diagram-L_Modem_CRS305_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 1, fill: "none", stroke: getStrokeColor('192.168.0.208', 'ether1', 1000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Modem_CRS305_0"
            data-points="W3sieCI6NDU0Ljg5NDI5NzYzNDQ3MDgzLCJ5IjoxNjJ9LHsieCI6MzgwLjUsInkiOjIxNC4xOTk5OTY5NDgyNDIyfSx7IngiOjM4MC41LCJ5IjozMTAuMzk5OTkzODk2NDg0NH0seyJ4IjozODAuNSwieSI6NDA2LjU5OTk5MDg0NDcyNjU2fSx7IngiOjQ0NS42MTQzNDMzNzMyMDQ0NiwieSI6NDU4Ljc5OTk4Nzc5Mjk2ODc1fV0="
            data-look="classic"

          />
          <path
            d="M923.5,162L923.5,170.7C923.5,179.4,923.5,196.8,923.5,213.533C923.5,230.267,923.5,246.333,923.5,254.367L923.5,262.4"
            id="mermaid-diagram-L_LTE_Router_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, strokeDasharray: "5 5", fill: "none", stroke: getStrokeColor('192.168.0.1', 'enp0s20f0u4', 48, 6), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_LTE_Router_0"
            data-points="W3sieCI6OTIzLjUsInkiOjE2Mn0seyJ4Ijo5MjMuNSwieSI6MjE0LjE5OTk5Njk0ODI0MjJ9LHsieCI6OTIzLjUsInkiOjI2Ni4zOTk5OTM4OTY0ODQ0fV0="
            data-look="classic"

          />
          <path
            d="M803.615,339.821L758.263,350.951C712.91,362.08,622.205,384.34,574.253,403.536C526.302,422.731,521.104,438.862,518.505,446.927L515.906,454.993"
            id="mermaid-diagram-L_Router_CRS305_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.1', 'int1', 10000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Router_CRS305_0"
            data-points="W3sieCI6ODA3LjUsInkiOjMzOC44NjczMzk5MzIxODg3fSx7IngiOjUzMS41LCJ5Ijo0MDYuNTk5OTkwODQ0NzI2NTZ9LHsieCI6NTE0LjY3ODc5NDYyODU4ODksInkiOjQ1OC43OTk5ODc3OTI5Njg3NX1d"
            data-look="classic"

          />
          <path
            d="M859.009,354.4L846.258,363.1C833.506,371.8,808.003,389.2,795.252,405.933C782.5,422.667,782.5,438.733,782.5,446.767L782.5,454.8"
            id="mermaid-diagram-L_Router_GamingPC_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 4, fill: "none", stroke: getStrokeColor('192.168.0.1', 'int3', 26000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Router_GamingPC_0"
            data-points="W3sieCI6ODU5LjAwOTM1MzQ2MzUxNTMsInkiOjM1NC4zOTk5OTM4OTY0ODQ0fSx7IngiOjc4Mi41LCJ5Ijo0MDYuNTk5OTkwODQ0NzI2NTZ9LHsieCI6NzgyLjUsInkiOjQ1OC43OTk5ODc3OTI5Njg3NX1d"
            data-look="classic"

          />
          <path
            d="M987.991,354.4L1000.742,363.1C1013.494,371.8,1038.997,389.2,1051.748,407.933C1064.5,426.667,1064.5,446.733,1064.5,456.767L1064.5,466.8"
            id="mermaid-diagram-L_Router_AI_PC_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 6, fill: "none", stroke: getStrokeColor('192.168.0.1', 'int2', 100000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Router_AI_PC_0"
            data-points="W3sieCI6OTg3Ljk5MDY0NjUzNjQ4NDcsInkiOjM1NC4zOTk5OTM4OTY0ODQ0fSx7IngiOjEwNjQuNSwieSI6NDA2LjU5OTk5MDg0NDcyNjU2fSx7IngiOjEwNjQuNSwieSI6NDcwLjc5OTk4Nzc5Mjk2ODc1fV0="
            data-look="classic"

          />
          <path
            d="M392.787,546.8L371.489,555.5C350.191,564.2,307.596,581.6,286.298,598.333C265,615.067,265,631.133,265,639.167L265,647.2"
            id="mermaid-diagram-L_CRS305_Switch25G_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.208', 'sfp-sfpplus2', 10000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_CRS305_Switch25G_0"
            data-points="W3sieCI6MzkyLjc4Njg5ODg2OTkxMzcsInkiOjU0Ni43OTk5ODc3OTI5Njg4fSx7IngiOjI2NSwieSI6NTk4Ljk5OTk4NDc0MTIxMDl9LHsieCI6MjY1LCJ5Ijo2NTEuMTk5OTgxNjg5NDUzMX1d"
            data-look="classic"

          />
          <path
            d="M521.768,546.8L525.973,555.5C530.179,564.2,538.589,581.6,542.795,600.333C547,619.067,547,639.133,547,649.167L547,659.2"
            id="mermaid-diagram-L_CRS305_Unifi1_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.208', 'sfp-sfpplus4', 10000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_CRS305_Unifi1_0"
            data-points="W3sieCI6NTIxLjc2ODE5MTk0Mjg4MzMsInkiOjU0Ni43OTk5ODc3OTI5Njg4fSx7IngiOjU0NywieSI6NTk4Ljk5OTk4NDc0MTIxMDl9LHsieCI6NTQ3LCJ5Ijo2NjMuMTk5OTgxNjg5NDUzMX1d"
            data-look="classic"

          />
          <path
            d="M616.5,536.77L651.917,547.142C687.333,557.513,758.167,578.257,793.583,596.662C829,615.067,829,631.133,829,639.167L829,647.2"
            id="mermaid-diagram-L_CRS305_RPi_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 1, fill: "none", stroke: getStrokeColor('192.168.0.208', 'sfp-sfpplus3', 100), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_CRS305_RPi_0"
            data-points="W3sieCI6NjE2LjUsInkiOjUzNi43NzAxNTQxNDMwMzN9LHsieCI6ODI5LCJ5Ijo1OTguOTk5OTg0NzQxMjEwOX0seyJ4Ijo4MjksInkiOjY1MS4xOTk5ODE2ODk0NTMxfV0="
            data-look="classic"

          />
          <path
            d="M211.413,715.2L196.844,723.9C182.276,732.6,153.138,750,138.569,766.733C124,783.467,124,799.533,124,807.567L124,815.6"
            id="mermaid-diagram-L_Switch25G_Zigbee_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 1, fill: "none", stroke: getStrokeColor('192.168.0.106', 'port2', 1000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Switch25G_Zigbee_0"
            data-points="W3sieCI6MjExLjQxMzI5OTcyMDUwMzE4LCJ5Ijo3MTUuMTk5OTgxNjg5NDUzMX0seyJ4IjoxMjQsInkiOjc2Ny4zOTk5Nzg2Mzc2OTUzfSx7IngiOjEyNCwieSI6ODE5LjU5OTk3NTU4NTkzNzV9XQ=="
            data-look="classic"

          />
          <path
            d="M318.587,715.2L333.156,723.9C347.724,732.6,376.862,750,391.431,766.733C406,783.467,406,799.533,406,807.567L406,815.6"
            id="mermaid-diagram-L_Switch25G_OldPC_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.106', 'port4', 10000), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Switch25G_OldPC_0"
            data-points="W3sieCI6MzE4LjU4NjcwMDI3OTQ5NjgsInkiOjcxNS4xOTk5ODE2ODk0NTMxfSx7IngiOjQwNiwieSI6NzY3LjM5OTk3ODYzNzY5NTN9LHsieCI6NDA2LCJ5Ijo4MTkuNTk5OTc1NTg1OTM3NX1d"
            data-look="classic"

          />
          <path
            d="M381,706.29L432.167,716.475C483.333,726.66,585.667,747.03,636.833,765.248C688,783.467,688,799.533,688,807.567L688,815.6"
            id="mermaid-diagram-L_Switch25G_Unifi2_0"
            className="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link"
            style={{ strokeWidth: 3, fill: "none", stroke: getStrokeColor('192.168.0.106', 'port1', 2500), transition: 'stroke ease 1s' }}
            data-edge="true"
            data-et="edge"
            data-id="L_Switch25G_Unifi2_0"
            data-points="W3sieCI6MzgxLCJ5Ijo3MDYuMjkwMjg4MTgxMTY5N30seyJ4Ijo2ODgsInkiOjc2Ny4zOTk5Nzg2Mzc2OTUzfSx7IngiOjY4OCwieSI6ODE5LjU5OTk3NTU4NTkzNzV9XQ=="
            data-look="classic"

          />
        </g>
        <g className="edgeLabels">
          <g className="edgeLabel">
            <g
              className="label"
              data-id="L_ISP_Modem_0"
              transform="translate(-100, 0)"
            >
              <foreignObject width={200} height={0}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel" />
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(642.48876, 241.43754)">
            <g
              className="label"
              data-id="L_Modem_Router_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('10G RJ45 to SFP+ (10G)')}
                      <br />
                      {getBPSDisplay('192.168.0.1', 'ext1')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="edgeLabel"
            transform="translate(380.5, 310.3999938964844)"
          >
            <g
              className="label"
              data-id="L_Modem_CRS305_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('1G RJ45')}
                      <br />
                      {getBPSDisplay('192.168.0.208', 'ether1')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="edgeLabel"
            transform="translate(923.5, 214.1999969482422)"
          >
            <g
              className="label"
              data-id="L_LTE_Router_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('USB 3.0')}
                      <br />
                      {getBPSDisplay('192.168.0.1', 'enp0s20f0u4')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(642.86854, 379.26924)">
            <g
              className="label"
              data-id="L_Router_CRS305_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('SFP+ AOC (10G)')}
                      <br />
                      {getBPSDisplay('192.168.0.1', 'int1', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="edgeLabel"
            transform="translate(782.5, 406.59999084472656)"
          >
            <g
              className="label"
              data-id="L_Router_GamingPC_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('QSFP+ Fiber (40G)')}
                      <br />
                      {getBPSDisplay('192.168.0.1', 'int3', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="edgeLabel"
            transform="translate(1064.5, 406.59999084472656)"
          >
            <g
              className="label"
              data-id="L_Router_AI_PC_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('QSFP28 DAC (100G)')}
                      <br />
                      {getBPSDisplay('192.168.0.1', 'int2')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(265, 598.9999847412109)">
            <g
              className="label"
              data-id="L_CRS305_Switch25G_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('SFP+ AOC (10G)')}
                      <br />
                      {getBPSDisplay('192.168.0.208', 'sfp-sfpplus2', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(547, 598.9999847412109)">
            <g
              className="label"
              data-id="L_CRS305_Unifi1_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('SFP+ to RJ45 (10G)')}
                      <br />
                      {getBPSDisplay('192.168.0.208', 'sfp-sfpplus4', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(829, 598.9999847412109)">
            <g
              className="label"
              data-id="L_CRS305_RPi_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('SFP+ to RJ45 (100M)')}
                      <br />
                      {getBPSDisplay('192.168.0.208', 'sfp-sfpplus3', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(124, 767.3999786376953)">
            <g
              className="label"
              data-id="L_Switch25G_Zigbee_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('2.5G to 1G')}
                      <br />
                      {getBPSDisplay('192.168.0.106', 'port2', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(406, 767.3999786376953)">
            <g
              className="label"
              data-id="L_Switch25G_OldPC_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('SFP+ (10G)')}
                      <br />
                      {getBPSDisplay('192.168.0.106', 'port4', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g className="edgeLabel" transform="translate(688, 767.3999786376953)">
            <g
              className="label"
              data-id="L_Switch25G_Unifi2_0"
              transform="translate(-100, -27.199996948242188)"
            >
              <foreignObject width={200} height="54.399993896484375">
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                  className="labelBkg"
                >
                  <span className="edgeLabel">
                    <p>
                      {store.t('2.5G RJ45')}
                      <br />
                      {getBPSDisplay('192.168.0.106', 'port1', true)}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
        </g>
        <g className="nodes">
          <g
            className="node default"
            id="mermaid-diagram-flowchart-ISP-0"
            data-look="classic"
            transform="translate(500.5, 28)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-20}
              width={232}
              height={40}
            />
            <g className="label" style={{}} transform="translate(-100, -12)">
              <rect />
              <foreignObject width={200} height={24}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Fiber Broadband (ISP)')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Modem-1"
            data-look="classic"
            transform="translate(500.5, 130)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-32}
              width={232}
              height={64}
            />
            <g className="label" style={{}} transform="translate(-100, -24)">
              <rect />
              <foreignObject width={200} height={48}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('Modem / ONT')}
                      <br />
                      ({store.t('4x1G, 1x10G RJ45')})
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-LTE-2"
            data-look="classic"
            transform="translate(923.5, 130)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-32}
              width={232}
              height={64}
            />
            <g className="label" style={{}} transform="translate(-100, -24)">
              <rect />
              <foreignObject width={200} height={48}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Mobile 4G LTE Backup Network')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Router-3"
            data-look="classic"
            transform="translate(923.5, 310.3999938964844)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-44}
              width={232}
              height={88}
            />
            <g className="label" style={{}} transform="translate(-100, -36)">
              <rect />
              <foreignObject width={200} height={72}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('Router / NVME NAS')}
                      <br />
                      ({store.t('2x SFP+, 2x QSFP28')})
                      <br />
                      {store.t('WAN1, VRRP Main')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-CRS305-4"
            data-look="classic"
            transform="translate(500.5, 502.79998779296875)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-44}
              width={232}
              height={88}
            />
            <g className="label" style={{}} transform="translate(-100, -36)">
              <rect />
              <foreignObject width={200} height={72}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('CRS305 Switch')}
                      <br />
                      ({store.t('1x 1G RJ45, 4x SFP+')})
                      <br />
                      {store.t('WAN2, VRRP Backup')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-GamingPC-5"
            data-look="classic"
            transform="translate(782.5, 502.79998779296875)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-44}
              width={232}
              height={88}
            />
            <g className="label" style={{}} transform="translate(-100, -36)">
              <rect />
              <foreignObject width={200} height={72}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('Gaming PC')}
                      <br />
                      ({store.t('40G QSFP+')})
                      <br />
                      @{store.t('26Gbps (PCIe 3.0 x4)')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-AI_PC-6"
            data-look="classic"
            transform="translate(1064.5, 502.79998779296875)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-32}
              width={232}
              height={64}
            />
            <g className="label" style={{}} transform="translate(-100, -24)">
              <rect />
              <foreignObject width={200} height={48}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('AI Core (DGX Spark)')}
                      <br />
                      ({store.t('2x 200G QSFP56')})
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Switch25G-7"
            data-look="classic"
            transform="translate(265, 683.1999816894531)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-32}
              width={232}
              height={64}
            />
            <g className="label" style={{}} transform="translate(-100, -24)">
              <rect />
              <foreignObject width={200} height={48}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('2.5G Switch')}
                      <br />
                      ({store.t('2x SFP+, 4x 2.5G RJ45')})
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Unifi1-8"
            data-look="classic"
            transform="translate(547, 683.1999816894531)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-20}
              width={232}
              height={40}
            />
            <g className="label" style={{}} transform="translate(-100, -12)">
              <rect />
              <foreignObject width={200} height={24}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Unifi AP1 (Wired Backhaul)')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-RPi-9"
            data-look="classic"
            transform="translate(829, 683.1999816894531)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-32}
              width={232}
              height={64}
            />
            <g className="label" style={{}} transform="translate(-100, -24)">
              <rect />
              <foreignObject width={200} height={48}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>
                      {store.t('Raspberry Pi 2')}
                      <br />
                      {store.t('WAN2, Isolated NAT2')}
                    </p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Zigbee-10"
            data-look="classic"
            transform="translate(124, 839.5999755859375)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-20}
              width={232}
              height={40}
            />
            <g className="label" style={{}} transform="translate(-100, -12)">
              <rect />
              <foreignObject width={200} height={24}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Zigbee Coordinator')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-OldPC-11"
            data-look="classic"
            transform="translate(406, 839.5999755859375)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-20}
              width={232}
              height={40}
            />
            <g className="label" style={{}} transform="translate(-100, -12)">
              <rect />
              <foreignObject width={200} height={24}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Idle Old Computer')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
          <g
            className="node default"
            id="mermaid-diagram-flowchart-Unifi2-12"
            data-look="classic"
            transform="translate(688, 839.5999755859375)"
          >
            <rect
              className="basic label-container"
              style={{}}
              x={-116}
              y={-20}
              width={232}
              height={40}
            />
            <g className="label" style={{}} transform="translate(-100, -12)">
              <rect />
              <foreignObject width={200} height={24}>
                <div
                  style={{
                    display: "table",
                    whiteSpace: "break-spaces",
                    lineHeight: "1.5",
                    maxWidth: 200,
                    textAlign: "center",
                    width: 200
                  }}
                >
                  <span className="nodeLabel">
                    <p>{store.t('Unifi AP2 (Wired Backhaul)')}</p>
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>
        </g>
      </g>
    </g>
    <defs>
      <filter id="mermaid-diagram-drop-shadow" height="130%" width="130%">
        <feDropShadow
          dx={4}
          dy={4}
          stdDeviation={0}
          floodOpacity="0.06"
          floodColor="#FFFFFF"
        />
      </filter>
    </defs>
    <defs>
      <filter id="mermaid-diagram-drop-shadow-small" height="150%" width="150%">
        <feDropShadow
          dx={2}
          dy={2}
          stdDeviation={0}
          floodOpacity="0.06"
          floodColor="#FFFFFF"
        />
      </filter>
    </defs>
    <linearGradient
      id="mermaid-diagram-gradient"
      gradientUnits="objectBoundingBox"
      x1="0%"
      y1="0%"
      x2="100%"
      y2="0%"
    >
      <stop offset="0%" stopColor="#cccccc" stopOpacity={1} />
      <stop
        offset="100%"
        stopColor="hsl(180, 0%, 18.3529411765%)"
        stopOpacity={1}
      />
    </linearGradient>
  </svg>
  );
});
