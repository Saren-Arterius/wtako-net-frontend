"use client";

// Converted from homelab-infograph/security.html (+ security_zhtw.html) — same
// mm layout, app styling, all strings via store.t.
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Canvas, Chip, Dev, Wl, NarrowCtx } from "./Diagram";
import { store } from "@/store/store";
import styles from "./diagram.module.css";

const t = (s: string) => store.t(s);

// Perimeter chain: cards, labels and cables. Each stage is pushed down by
// `sp` to give the cable edges (and their labels) room — narrow cards render
// taller so it needs more; on desktop sp stops where the stats rule begins.
const PerimeterMap = () => {
  const narrow = useContext(NarrowCtx);
  const sp = narrow ? 9 : 4;
  const T = (i: number) => 48 + i * (30 + sp); // stage card top, mm
  const wlTop = (i: number) => T(i) - (narrow ? 7 : 6.5);
  const wireStart = (i: number) => T(i) - (narrow ? 14.3 : 11.4);
  return (
    <>
      {/* the whole perimeter chain shifts left in narrow mode to fill the crop */}
      <div className={styles.chain}>
        <svg className={styles.wires} viewBox="0 0 297 210" preserveAspectRatio="none">
          <defs>
            <marker id="security-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          <g fill="none" stroke="currentColor">
            {/* perimeter chain: request path, outside in */}
            <path d="M78,40 V46.4" strokeWidth="0.9" markerEnd="url(#security-ar)" />
            {[1, 2, 3].map((i) => (
              <path key={i} d={`M78,${wireStart(i)} V${T(i) - 1.6}`} strokeWidth="0.9" markerEnd="url(#security-ar)" />
            ))}
            {/* bounty hunter rows: dotted = observe/review, dashed = act */}
            <path d="M199.6,42.35 H208.4" strokeWidth="0.45" strokeDasharray="0.5 1.2" markerEnd="url(#security-ar)" />
            <path d="M199.6,68.35 H208.4" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#security-ar)" />
            <path d="M199.6,94.35 H208.4" strokeWidth="0.45" strokeDasharray="0.5 1.2" markerEnd="url(#security-ar)" />
          </g>
        </svg>
      </div>

      <div className={styles.side}>
        <div className={styles.bh} style={{ left: "10mm", top: "26.5mm" }}>
          {t("The perimeter · outside in")}
        </div>
      </div>

      <div className={styles.chain}>
        <Chip pos={{ left: "63mm", top: "32mm", width: "30mm" }}>{t("The Internet")}</Chip>
        <Wl pos={{ left: "78mm", top: "43.5mm" }}>{t("real client IP")}</Wl>

        <Dev
          pos={{ left: "50mm", top: `${T(0)}mm`, width: "56mm" }}
          icon={<path d="M7.5 17.5 a4 4 0 1 1 .7-7.96 A5.5 5.5 0 0 1 18.4 10 a3.75 3.75 0 0 1 .6 7.5 z" />}
          name="Cloudflare"
          sub={t("edge TLS · origin stays hidden")}
        />
        <Wl pos={{ left: "78mm", top: `${wlTop(1)}mm` }}>{t("web ports only")}</Wl>

        <Dev
          pos={{ left: "50mm", top: `${T(1)}mm`, width: "56mm" }}
          icon={
            <>
              <rect x="3" y="11" width="18" height="7" rx="1" />
              <path d="M7 11 V7 M17 11 V7" />
              <circle cx="7" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="17" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
              <path d="M7 14.5 h0.01 M10 14.5 h0.01 M13 14.5 h4" />
            </>
          }
          name={t("Router · iptables")}
          sub={t("default-deny · ipset trust tiers")}
        />
        <Wl pos={{ left: "78mm", top: `${wlTop(2)}mm` }}>{t("TLS ends here")}</Wl>

        <Dev
          pos={{ left: "50mm", top: `${T(2)}mm`, width: "56mm" }}
          icon={<path d="M12 4 v16 M5.5 8 l13 8 M18.5 8 l-13 8" />}
          name={t("nginx edge")}
          sub={t("TLS 1.3 · HSTS · geo-bans")}
        />
        <Wl pos={{ left: "78mm", top: `${wlTop(3)}mm` }}>{t("LAN or password")}</Wl>

        <Dev
          pos={{ left: "50mm", top: `${T(3)}mm`, width: "56mm" }}
          icon={
            <>
              <rect x="4" y="4" width="7" height="7" rx="1" />
              <rect x="13" y="4" width="7" height="7" rx="1" />
              <rect x="4" y="13" width="7" height="7" rx="1" />
              <rect x="13" y="13" width="7" height="7" rx="1" />
            </>
          }
          name={t("Services")}
          sub={t("loopback · docker · LAN")}
        />
      </div>
    </>
  );
};

export const SecurityDiagram = observer(() => {
  const statItems = (
    <>
      <div><b className={styles.statB}>869</b><span className={styles.statS}>{t("IPS BANNED · 30 DAYS")}</span></div>
      <div><b className={styles.statB}>1%</b><span className={styles.statS}>{t("FALSE POSITIVES · 30 DAYS")}</span></div>
      <div><b className={styles.statB}>{t("60 s")}</b><span className={styles.statS}>{t("LOG TO BAN")}</span></div>
      <div><b className={styles.statB}>32 GiB</b><span className={styles.statS}>{t("SCANNER BOMB")}</span></div>
      <div><b className={styles.statB}>28</b><span className={styles.statS}>{t("VHOST LOGS WATCHED")}</span></div>
    </>
  );
  const rightCol = (
    <>
      {/* column divider */}
      <div className={styles.divider} style={{ left: "152mm", top: "27mm", height: "144mm" }} />

      {/* ============ RIGHT COLUMN · AI BOUNTY HUNTER ============ */}
      <div className={styles.bh} style={{ left: "160mm", top: "26.5mm" }}>
        {t("AI bounty hunter")}
      </div>

      <div className={styles.bh} style={{ left: "160mm", top: "32mm" }}>
        {t("Catch")}
      </div>
      <Chip pos={{ left: "160mm", top: "37.5mm", width: "38mm" }}>
        {t("access logs")}
        <small>{t("28 vhosts · live")}</small>
      </Chip>
      <Chip pos={{ left: "210mm", top: "37.5mm", width: "70mm" }}>
        {t("LLM judge")}
        <small>{t("Qwen · every 60 s")}</small>
      </Chip>

      <div className={styles.bh} style={{ left: "160mm", top: "58mm" }}>
        {t("Block")}
      </div>
      <Chip pos={{ left: "160mm", top: "63.5mm", width: "38mm" }}>
        blacklist.db
        <small>{t("SQLite verdicts")}</small>
      </Chip>
      <Chip pos={{ left: "210mm", top: "63.5mm", width: "70mm" }}>
        {t("nginx reload")}
        <small>{t("geo match · bomb as plain 200")}</small>
      </Chip>

      <div className={styles.bh} style={{ left: "160mm", top: "84mm" }}>
        {t("Sentence")}
      </div>
      <Chip pos={{ left: "160mm", top: "89.5mm", width: "38mm" }}>
        {t("2nd opinion")}
        <small>{t("senior-analyst LLM")}</small>
      </Chip>
      <Chip pos={{ left: "210mm", top: "89.5mm", width: "70mm" }}>
        {t("Telegram verdict")}
        <small>{t("pardon if fooled · FP 1%")}</small>
      </Chip>

      <div className={styles.dsc} style={{ left: "160mm", top: "104mm", width: "127mm" }}>
        <div className={styles.bh3} style={{ marginTop: 0 }}>{t("Honeypot · the 32 GiB trap")}</div>
        <ul>
          <li>{t("banned & probing IPs stream a")} <b>33 MB</b> {t("gzip bait")}</li>
          <li>{t("auto-decompressing bots inflate it to")} <b>32 GiB</b></li>
          <li>{t("WP · .env · .git probes get the bomb as a 200")}</li>
        </ul>
        <div className={styles.bh3}>{t("Containers · caged")}</div>
        <ul>
          <li><b>{t("4 containers caged")}</b> {t("zero outbound · one has a narrow egress lane")}</li>
          <li><b>{t("WAN can't reach containers")}</b> {t("DOCKER-USER guards every bridge")}</li>
        </ul>
        <div className={styles.bh3}>{t("ipset · who gets in")}</div>
        <ul style={{ columns: 2, columnGap: "8mm" }}>
          <li><b>trusted</b> {t("· LAN + Tailscale · all")}</li>
          <li><b>cloudflare</b> {t("· web ports only")}</li>
          <li><b>knock</b> {t("· invisible until knocked")}</li>
          <li><b>IoT</b> {t("· 3 ports · zero internet")}</li>
        </ul>
        <div className={styles.bh3}>{t("Accidental opens · wtako-monitor")}</div>
        <ul>
          <li><b>{t("open ports")}</b> {t("& public IP history · internal watch in case a port opens by accident")}</li>
        </ul>
      </div>
    </>
  );
  return (
  <Canvas mapW={96} mapBottom={161} mapBottomNarrow={170} narrowMaxW={291} narrowTitle={<div className={styles.bh}>{t("The perimeter · outside in")}</div>} renderNarrow={() => <><div className={styles.statsFlow}>{statItems}</div><div className={styles.sideFlow}>{rightCol}</div></>}>
    <PerimeterMap />

    {/* column divider + right column: hidden in narrow mode, re-rendered
        below the canvas via renderNarrow */}
    <div className={styles.side}>{rightCol}</div>

    <div className={styles.rule} />

    <div className={styles.stats}>{statItems}</div>
  </Canvas>
  );
});
