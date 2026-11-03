"use client";

// Converted from homelab-infograph/index.html (+ zh-TW.html) — same mm layout,
// app styling, all strings via store.t so the zh toggle swaps the poster text.
import { observer } from "mobx-react-lite";
import { Canvas, Chip, Dev, Wl } from "./Diagram";
import { store } from "@/store/store";
import { formatBps, getBPS, getStrokeColor } from "@/components/traffic";
import styles from "./diagram.module.css";

const t = (s: string) => store.t(s);

// live ↑tx ↓rx readout, two rows to the right of a cable's speed label
const Bps = ({ host, nif, reversed }: { host: string; nif: string; reversed?: boolean }) => {
  let [rx, tx] = getBPS(host, nif);
  if (rx == null && tx == null) return null;
  if (reversed) [rx, tx] = [tx ?? 0, rx ?? 0];
  // idle link: keep the divider + the readout's space, hide the digits
  const idle = !rx && !tx;
  return (
    <span className={styles.bps} style={{ display: "flex", flexDirection: "column", fontWeight: 400, lineHeight: 1.25 }}>
      <span style={{ color: "rgb(255, 168, 175)", visibility: idle ? "hidden" : undefined }}>↑{formatBps(tx ?? 0)}</span>
      <span style={{ color: "rgb(163, 203, 179)", visibility: idle ? "hidden" : undefined }}>↓{formatBps(rx ?? 0)}</span>
    </span>
  );
};

// cable stroke tinted by live utilization (olive idle -> yellow -> red), see traffic.ts
const wire = (host: string, nif: string, rxMbpsMax: number, txMbpsMax: number | null = null) => ({
  stroke: getStrokeColor(host, nif, rxMbpsMax, txMbpsMax),
  transition: "stroke ease 1s",
});

export const NetworkDiagram = observer(() => {
  const services = (
    <section className={styles.svc}>
      <h2 className={styles.svcTitle}>{t("WHAT IT RUNS · SELF-HOSTED AT HOME")}</h2>
      <h3>AI</h3>
      <ul>
        <li><b>vLLM</b> {t("on DGX Spark: Qwen 3.8 Flash Next, 71 tok/s peak")}</li>
        <li><b>Open WebUI</b></li>
        <li><b>ComfyUI</b></li>
        <li>{t("Cantonese")} <b>{t("voice assistant")}</b></li>
        <li>{t("Voice typing (ASR IME)")}</li>
      </ul>
      <h3>{t("Media & Files")}</h3>
      <ul>
        <li><b>Jellyfin</b></li>
        <li><b>Immich</b></li>
        <li><b>Aria2</b> · <b>yt-dlp</b></li>
        <li><b>Dropzone</b> · <b>ArozOS</b></li>
      </ul>
      <h3>{t("Home & Web")}</h3>
      <ul>
        <li><b>Home Assistant</b></li>
        <li><b>UniFi</b> {t("controller")}</li>
        <li>{t("Isolated internet-free IoT on VLAN 10")}</li>
        <li>{t("Hardware monitor:")} <b>Bun + Redis</b></li>
        <li><b>wtako.net</b> · <b>Next.js 16</b></li>
        <li><b>Arch Linux</b> {t("· CachyOS mirrors")}</li>
      </ul>
      <h3>{t("Always On")}</h3>
      <ul>
        <li><b>Bluesky PDS</b> {t("· own server")}</li>
        <li><b>KVM</b> {t("hypervisor · Win10 + Arch VMs")}</li>
        <li><b>Tailscale</b> VPN + <b>Syncthing</b> {t("file sync")}</li>
        <li><b>{t("Telegram bots")}</b></li>
        <li><b>{t("Legacy PHP services")}</b> · AUR Audit</li>
        <li><b>Watchtower</b></li>
      </ul>
      <h3>{t("The Machine · Router / NAS")}</h3>
      <ul>
        <li><b>Intel i9-13900H</b> {t("· 14 cores, 20 threads")}</li>
        <li><b>96 GB</b> {t("RAM")}</li>
        <li><b>19.2 TB</b> {t("NVMe")}</li>
        <li><b>2x 10G SFP+</b> + <b>2x 100G QSFP28</b></li>
        <li>{t("Arch Linux · kernel 6.18 LTS")}</li>
      </ul>
    </section>
  );
  const statItems = (
    <>
      <div><b className={styles.statB}>4 Gbps</b><span className={styles.statS}>{t("FIBER INTERNET")}</span></div>
      <div><b className={styles.statB}>100G</b><span className={styles.statS}>{t("AI LINK")}</span></div>
      <div><b className={styles.statB}>176B</b><span className={styles.statS}>{t("PARAMETERS · RUN LOCALLY")}</span></div>
      <div><b className={styles.statB}>25+</b><span className={styles.statS}>{t("SELF-HOSTED SERVICES")}</span></div>
      <div><b className={styles.statB}>0</b><span className={styles.statS}>{t("CLOUD DEPENDENCY")}</span></div>
    </>
  );
  return (
  <Canvas mapBottom={188}
    renderNarrow={() => (
      <>
        <div className={styles.statsFlow}>{statItems}</div>
        <div className={styles.svcFlow}>{services}</div>
      </>
    )}
  >
    {/* cables: line weight encodes speed, dash = backup. Same topology as wtako.net/server */}
    <svg className={styles.wires} viewBox="0 0 297 210" preserveAspectRatio="none">
      <g fill="none" stroke="currentColor">
        <path d="M45,35 V46" strokeWidth="0.35" style={wire('192.168.0.1', 'ext1', 4000, 2000)} />
        <path d="M45,62 H115 V78" strokeWidth="0.9" style={wire('192.168.0.1', 'ext1', 4000, 2000)} />
        <path d="M60,55 H192 V78" strokeWidth="0.35" style={wire('192.168.0.208', 'ether1', 1000)} />
        <path d="M177,35 V43 H118.5 V78" strokeWidth="0.6" strokeDasharray="1.6 1.4" style={wire('192.168.0.1', 'enp0s20f0u4', 48, 6)} />
        <path d="M120,90 H154" strokeWidth="0.9" style={wire('192.168.0.1', 'int1', 10000)} />
        <path d="M90,94 L35,114" strokeWidth="1.2" style={wire('192.168.0.1', 'int3', 26000)} />
        <path d="M101,94 L99,114" strokeWidth="1.8" style={wire('192.168.0.1', 'int2', 100000)} />
        <path d="M176,94 L159,114" strokeWidth="0.9" style={wire('192.168.0.208', 'sfp-sfpplus2', 10000)} />
        <path d="M190,94 V142 H148 V153" strokeWidth="0.9" style={wire('192.168.0.208', 'sfp-sfpplus4', 10000)} />
        <path d="M197,94 V154" strokeWidth="0.35" style={wire('192.168.0.208', 'sfp-sfpplus3', 100)} />
        {/* 2.5G switch drops: feed + bus tinted by port1, each drop by its own port */}
        <path d="M163,131 L138,142 M26,142 H138" strokeWidth="0.35" style={wire('192.168.0.106', 'port1', 2500)} />
        <path d="M26,142 V153" strokeWidth="0.35" style={wire('192.168.0.106', 'port1', 2500)} />
        <path d="M67,142 V153" strokeWidth="0.35" style={wire('192.168.0.106', 'port2', 1000)} />
        <path d="M108,142 V153" strokeWidth="0.9" style={wire('192.168.0.106', 'port4', 10000)} />
      </g>
    </svg>

    {/* internet edge */}
    <Chip pos={{ left: "12mm", top: "28mm", width: "52mm" }}>
      {t("Fiber Broadband (ISP)")}
      <small>4000 / 2000 Mbps</small>
    </Chip>
    <Chip pos={{ left: "155mm", top: "28mm", width: "44mm" }} outline>
      {t("4G LTE Backup")}
      <small>Samsung Note 10</small>
    </Chip>

    <Dev
      pos={{ left: "28mm", top: "44mm", width: "34mm" }}
      outline
      icon={
        <>
          <rect x="9" y="3" width="6" height="18" rx="1" />
          <circle cx="12" cy="6.5" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
        </>
      }
      name={t("Fiber Modem")}
      sub={t("4x1G + 1x10G ports")}
    />

    {/* core */}
    <Dev
      pos={{ left: "76mm", top: "76mm", width: "46mm" }}
      role={t("WAN1 · PRIMARY")}
      keyDev
      outline
      icon={
        <>
          <rect x="3" y="11" width="18" height="7" rx="1" />
          <path d="M7 11 V7 M17 11 V7" />
          <circle cx="7" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
          <path d="M7 14.5 h0.01 M10 14.5 h0.01 M13 14.5 h4" />
        </>
      }
      name={t("Router + NVMe NAS")}
      sub="2x SFP+ · 2x QSFP28"
    />
    <Dev
      pos={{ left: "152mm", top: "76mm", width: "48mm" }}
      role={t("WAN2 · STANDBY")}
      outline
      icon={
        <>
          <rect x="2" y="9" width="20" height="6.5" rx="1" />
          <path d="M5.5 11.35 v2 M8.5 11.35 v2 M11.5 11.35 v2 M14.5 11.35 v2" />
          <circle cx="18.75" cy="12.2" r="0.6" />
        </>
      }
      name="MikroTik CRS305"
      sub={t("4x SFP+ switch")}
    />

    {/* compute */}
    <Dev
      pos={{ left: "16mm", top: "112mm", width: "38mm" }}
      icon={
        <>
          <rect x="7" y="3" width="10" height="18" rx="1" />
          <path d="M10 6.5 h4 M10 9.5 h4" />
          <circle cx="12" cy="17" r="1.6" />
        </>
      }
      name={t("Gaming PC")}
      sub={t("PCIe 3.0 x4 limit")}
    />
    <Dev
      pos={{ left: "76mm", top: "112mm", width: "46mm" }}
      role={t("AI CORE")}
      keyDev
      outline
      icon={
        <>
          <rect x="5.5" y="6.5" width="13" height="11" rx="2.5" />
          <circle cx="12" cy="12" r="2.8" />
        </>
      }
      name="NVIDIA DGX Spark"
      sub="2x 200G QSFP56"
    />
    <Dev
      pos={{ left: "136mm", top: "112mm", width: "46mm" }}
      outline
      icon={
        <>
          <rect x="4" y="9.5" width="16" height="6.5" rx="1" />
          <path d="M6.5 11.6 v2 M9.5 11.6 v2 M12.5 11.6 v2" />
          <circle cx="16.5" cy="12.75" r="0.6" />
        </>
      }
      name={t("2.5G Edge Switch")}
      sub="4x 2.5G · 2x SFP+"
    />

    {/* edge devices */}
    <Dev
      pos={{ left: "10mm", top: "153mm", width: "32mm" }}
      icon={
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      }
      name="UniFi AP 2"
      sub="Wi-Fi 7"
    />
    <Dev
      pos={{ left: "49mm", top: "153mm", width: "36mm" }}
      outline
      icon={
        <>
          <path d="M12 4 l7 4.5 v11 h-14 v-11 z" />
          <path d="M10 19 v-5 a2 2 0 0 1 4 0 v5" />
        </>
      }
      name={t("Zigbee Coordinator")}
      sub={t("smart-home hub")}
    />
    <Dev
      pos={{ left: "90mm", top: "153mm", width: "36mm" }}
      icon={
        <>
          <rect x="6" y="4" width="12" height="8" rx="1" />
          <path d="M12 12 v4" />
          <path d="M9 16 h6" />
          <path d="M8.5 8 h4" />
          <path d="M7.5 19.5 h9" />
        </>
      }
      name={t("Old Computer")}
      sub={t("standby tester")}
    />
    <Dev
      pos={{ left: "132mm", top: "153mm", width: "32mm" }}
      outline
      icon={
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      }
      name="UniFi AP 1"
      sub="Wi-Fi 7"
    />
    <Dev
      pos={{ left: "170mm", top: "153mm", width: "32mm" }}
      icon={
        <>
          <rect x="4" y="6" width="16" height="13" rx="1" />
          <path d="M7.5 6 V4 M10.5 6 V4 M13.5 6 V4 M16.5 6 V4" />
          <rect x="8" y="10" width="6" height="5" />
        </>
      }
      name="Raspberry Pi 2"
      sub={t("isolated network")}
    />

    {/* cable labels + live traffic readout */}
    <Wl pos={{ left: "89mm", top: "62mm" }}><span>10G</span><Bps host="192.168.0.1" nif="ext1" /></Wl>
    <Wl pos={{ left: "132mm", top: "55mm" }}><span>1G</span><Bps host="192.168.0.208" nif="ether1" /></Wl>
    <Wl pos={{ left: "134mm", top: "43mm" }}>{t("USB backup")}<Bps host="192.168.0.1" nif="enp0s20f0u4" /></Wl>
    <Wl pos={{ left: "137mm", top: "90mm" }}><span>10G</span><Bps host="192.168.0.1" nif="int1" reversed /></Wl>
    <Wl pos={{ left: "62mm", top: "105.5mm" }}><span>40G</span><Bps host="192.168.0.1" nif="int3" reversed /></Wl>
    <Wl pos={{ left: "100mm", top: "105.5mm" }}><span>100G</span><Bps host="192.168.0.1" nif="int2" /></Wl>
    <Wl pos={{ left: "167mm", top: "105.5mm" }}><span>10G</span><Bps host="192.168.0.208" nif="sfp-sfpplus2" reversed /></Wl>
    <Wl pos={{ left: "148mm", top: "147mm" }}><span>10G</span><Bps host="192.168.0.208" nif="sfp-sfpplus4" reversed /></Wl>
    <Wl pos={{ left: "190mm", top: "147mm" }} className={styles.edgeR}><span>100M</span><Bps host="192.168.0.208" nif="sfp-sfpplus3" reversed /></Wl>
    <Wl pos={{ left: "108mm", top: "147mm" }}><span>10G</span><Bps host="192.168.0.106" nif="port4" reversed /></Wl>
    <Wl pos={{ left: "67mm", top: "147mm" }}><span>2.5G</span><Bps host="192.168.0.106" nif="port2" reversed /></Wl>
    <Wl pos={{ left: "26mm", top: "147mm" }}><span>2.5G</span><Bps host="192.168.0.106" nif="port1" reversed /></Wl>

    {services}

    <div className={styles.legend}>
      <span><i className={styles.k} style={{ borderTopWidth: "1.8mm" }} />100G QSFP28</span>
      <span><i className={styles.k} style={{ borderTopWidth: "1.2mm" }} />{t("40G fiber")}</span>
      <span><i className={styles.k} style={{ borderTopWidth: "0.9mm" }} />10G SFP+</span>
      <span><i className={styles.k} style={{ borderTopWidth: "0.35mm" }} />1G / 2.5G / 100M</span>
      <span><i className={styles.k} style={{ borderTopWidth: "0.6mm", borderTopStyle: "dashed" }} />{t("backup link")}</span>
      <span><i style={{ display: "inline-block", width: "7mm", height: "0.6mm", background: "linear-gradient(90deg, #99a37e, #F7EE7F 50%, #A63D40)" }} />{t("live utilization")}</span>
      <span><i className={styles.kb} />{t("UPS-backed")}</span>
    </div>

    <div className={styles.stats}>{statItems}</div>
  </Canvas>
  );
});
