"use client";

// Converted from homelab-infograph/backup.html (+ backup_zhtw.html) — same mm
// layout, app styling, all strings via store.t.
import { observer } from "mobx-react-lite";
import { Canvas, Chip, Dev, Wl } from "./Diagram";
import { store } from "@/store/store";
import styles from "./diagram.module.css";

const t = (s: string) => store.t(s);

const MiniIcon = ({ children }: { children: React.ReactNode }) => (
  <svg
    className={styles.ic}
    style={{ height: "4.2mm", width: "4.2mm", marginRight: "1.2mm", verticalAlign: "-1.1mm", display: "inline" }}
    viewBox="0 0 24 24"
  >
    {children}
  </svg>
);

const routerIc = (
  <>
    <rect x="3" y="11" width="18" height="7" rx="1" />
    <path d="M7 11 V7 M17 11 V7" />
    <circle cx="7" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="17" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
    <path d="M7 14.5 h0.01 M10 14.5 h0.01 M13 14.5 h4" />
  </>
);
const switchIc = (
  <>
    <rect x="2" y="9" width="20" height="6.5" rx="1" />
    <path d="M5.5 11.35 v2 M8.5 11.35 v2 M11.5 11.35 v2 M14.5 11.35 v2" />
    <circle cx="18.75" cy="12.2" r="0.6" />
  </>
);
const modemIc = (
  <>
    <rect x="9" y="3" width="6" height="18" rx="1" />
    <circle cx="12" cy="6.5" r="0.85" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
  </>
);
const phoneIc = (
  <>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M10.5 18.5 h3" />
  </>
);
const apIc = (
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.5" />
  </>
);

export const BackupDiagram = observer(() => {
  const rightCol = (
    <>
      {/* column divider */}
      <div className={styles.divider} style={{ left: "152mm", top: "27mm", height: "140mm" }} />

      {/* ============ RIGHT COLUMN · NETWORK ============ */}
      <div className={styles.bh} style={{ left: "160mm", top: "26.5mm" }}>
        {t("Network failover")}
      </div>

      <div className={`${styles.bh} ${styles.scn}`} style={{ left: "160mm", top: "35mm" }}>
        {t("Router dies")}
      </div>
      <Chip pos={{ left: "160mm", top: "40.5mm", width: "34mm" }} className={styles.chipL}>
        ✗ <MiniIcon>{routerIc}</MiniIcon>{t("Router")}
      </Chip>
      <Chip pos={{ left: "206mm", top: "40.5mm", width: "72mm" }}>
        <MiniIcon>{switchIc}</MiniIcon>{t("CRS305 takes over")}
        <small>{t("1G RJ45 · weak but enough · Wi-Fi lives")}</small>
      </Chip>

      <div className={`${styles.bh} ${styles.scn}`} style={{ left: "160mm", top: "68mm" }}>
        {t("Fiber dies")}
      </div>
      <Chip pos={{ left: "160mm", top: "73.5mm", width: "34mm" }} className={styles.chipL}>
        ✗ <MiniIcon>{modemIc}</MiniIcon>{t("Fiber")}
      </Chip>
      <Chip pos={{ left: "206mm", top: "73.5mm", width: "72mm" }}>
        <MiniIcon>{phoneIc}</MiniIcon>{t("4G phone takes over")}
        <small>{t("Samsung Note 10 · backup WAN")}</small>
      </Chip>

      <div className={`${styles.bh} ${styles.scn}`} style={{ left: "160mm", top: "101mm" }}>
        {t("CRS305 dies")}
      </div>
      <Chip pos={{ left: "160mm", top: "106.5mm", width: "34mm" }} className={styles.chipL}>
        ✗ <MiniIcon>{switchIc}</MiniIcon>CRS305
      </Chip>
      <Chip pos={{ left: "206mm", top: "106.5mm", width: "72mm" }}>
        <MiniIcon>
          <>
            <path d="M3 8.5 a13 13 0 0 1 18 0" />
            <path d="M6.5 12 a8 8 0 0 1 11 0" />
            <path d="M9.7 15.3 a4 4 0 0 1 4.6 0" />
            <path d="M4 20 L20 4" />
          </>
        </MiniIcon>{t("No Wi-Fi")}
        <small>{t("router-as-AP · not worth wiring")}</small>
      </Chip>

      <div className={`${styles.bh} ${styles.scn}`} style={{ left: "160mm", top: "134mm" }}>
        {t("AP dies")}
      </div>
      <Chip pos={{ left: "160mm", top: "139.5mm", width: "34mm" }} className={styles.chipL}>
        ✗ <MiniIcon>{apIc}</MiniIcon>AP 1
      </Chip>
      <Chip pos={{ left: "206mm", top: "139.5mm", width: "72mm" }}>
        <MiniIcon>{apIc}</MiniIcon>{t("AP 2 takes over")}
        <small>UniFi AP · Wi-Fi 7</small>
      </Chip>
    </>
  );
  const statItems = (
    <>
      <div><b className={styles.statB}>22 TB</b><span className={styles.statS}>{t("USB COLD-BACKUP HDD")}</span></div>
      <div><b className={styles.statB}>{t("90 days")}</b><span className={styles.statS}>{t("SNAPSHOT RETENTION")}</span></div>
      <div><b className={styles.statB}>1-click</b><span className={styles.statS}>{t("MANUAL COPY · ANYTIME")}</span></div>
      <div><b className={styles.statB}>6</b><span className={styles.statS}>{t("SYNCTHING DEVICES")}</span></div>
      <div><b className={styles.statB}>3</b><span className={styles.statS}>{t("FAILOVERS ON STANDBY")}</span></div>
    </>
  );
  const notes = (
    <div className={styles.dsc} style={{ left: "10mm", top: "152.5mm", width: "132mm" }}>
      <div className={styles.fcol}>
        <div className={styles.bh3} style={{ marginTop: 0, letterSpacing: 0 }}>
          {t("Snapshots")} 3✓ 2✓ <b>1✗</b> 1✓ 0✓
        </div>
        <ul>
          <li>{t("hourly + daily + weekly · kept")} <b>{t("90 days")}</b></li>
          <li><b>{t("1-click copy")}</b> {t("→ USB HDD · whenever")}</li>
          <li>{t("btrfs checksums · scrub runs monthly")}</li>
        </ul>
      </div>
      <div className={styles.fcol2}>
        <div className={styles.bh3} style={{ marginTop: 0, letterSpacing: 0 }}>
          Syncthing 3✓ 2✓ 1✓ 1✓ 0✓
        </div>
        <ul>
          <li>{t("password vault · work files")} · <b>{t("6 devices")}</b></li>
          <li><b>{t("old versions")}</b> {t("kept · phone + laptop = offsite")}</li>
        </ul>
      </div>
      <div style={{ clear: "both" }} />
    </div>
  );
  return (
  <Canvas mapW={152} mapBottom={148} narrowMaxW={460} narrowTitle={<div className={styles.bh}>{t("Storage · snapshots + 1-click copy")}</div>} renderNarrow={() => <><div className={styles.statsFlow}>{statItems}</div><div className={styles.sideFlow}>{notes}{rightCol}</div></>}>
    <svg className={styles.wires} viewBox="0 0 297 210" preserveAspectRatio="none">
      <defs>
        <marker id="backup-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      <g fill="none" stroke="currentColor">
        {/* storage: snapshots flow into the target */}
        <path d="M39,56 V75.2" strokeWidth="0.9" markerEnd="url(#backup-ar)" />
        <path d="M104,56 V75.2" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#backup-ar)" />
        {/* Syncthing full mesh: 6 nodes, every peer to every peer */}
        <g strokeWidth="0.3" strokeDasharray="0.5 1.2">
          <path d="M24,124.5 L75,121.0 M24,124.5 L126,126.5 M24,124.5 L24,142.5 M24,124.5 L75,147.1 M24,124.5 L126,142.5
                   M75,121.0 L126,126.5 M75,121.0 L24,142.5 M75,121.0 L75,147.1 M75,121.0 L126,142.5
                   M126,126.5 L24,142.5 M126,126.5 L75,147.1 M126,126.5 L126,142.5
                   M24,142.5 L75,147.1 M24,142.5 L126,142.5 M75,147.1 L126,142.5" />
        </g>
        {/* failover scenario rows: X dies -> survivor */}
        <path d="M196,44.5 H204" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#backup-ar)" />
        <path d="M196,77.5 H204" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#backup-ar)" />
        <path d="M196,110.5 H204" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#backup-ar)" />
        <path d="M196,143.5 H204" strokeWidth="0.6" strokeDasharray="1.6 1.4" markerEnd="url(#backup-ar)" />
      </g>
    </svg>

    {/* left-column titles: storage renders as flow HTML in narrow mode; the
        Syncthing one stays in the canvas (between map and mesh, where it
        belongs) with --inv keeping its on-screen size equal to the flow type */}
    <div className={styles.side}>
      <div className={styles.bh} style={{ left: "10mm", top: "26.5mm" }}>
        {t("Storage · snapshots + 1-click copy")}
      </div>
    </div>
    <div className={`${styles.bh} ${styles.mapbh}`} style={{ left: "10mm", top: "108mm" }}>
      {t("Syncthing sync · critical files only")}
    </div>

    <Dev
      pos={{ left: "18mm", top: "36mm", width: "42mm" }}
      icon={routerIc}
      name={t("Router + NVMe NAS")}
      sub={t("snapshots · NVMe")}
    />
    <Dev
      pos={{ left: "84mm", top: "36mm", width: "40mm" }}
      icon={
        <>
          <rect x="4" y="5" width="16" height="11" rx="1" />
          <path d="M2 19.5 h20" />
        </>
      }
      name={t("Laptop")}
      sub="Arch Linux"
    />
    <Dev
      pos={{ left: "38mm", top: "76mm", width: "72mm" }}
      role={t("BACKUP TARGET")}
      keyDev
      icon={
        <>
          <rect x="7" y="3" width="10" height="18" rx="1" />
          <path d="M10 6.5 h4 M10 9.5 h4" />
          <circle cx="12" cy="17" r="1.6" />
        </>
      }
      name={t("Gaming PC · 22 TB USB HDD")}
      sub={t("receives NAS + laptop + its own backup")}
    />
    <Wl pos={{ left: "39mm", top: "66mm" }}>{t("Fiber")}</Wl>
    <Wl pos={{ left: "104mm", top: "66mm" }}>Wi-Fi</Wl>
    <div className={styles.note} style={{ left: "74mm", top: "102mm" }}>
      {t("USB HDD powers off when done")}
    </div>

    <Chip pos={{ left: "17mm", top: "121mm", width: "14mm" }}>NAS</Chip>
    <Chip pos={{ left: "65mm", top: "117.6mm", width: "20mm" }}>{t("Laptop")}</Chip>
    <Chip pos={{ left: "113mm", top: "123mm", width: "26mm" }}>{t("Gaming PC")}</Chip>
    <Chip pos={{ left: "15mm", top: "139mm", width: "18mm" }}>{t("Phone")}</Chip>
    <Chip pos={{ left: "59mm", top: "143.8mm", width: "32mm" }}>{t("Tablet · 24/7")}</Chip>
    <Chip pos={{ left: "108mm", top: "139mm", width: "36mm" }}>{t("4G phone · 24/7")}</Chip>

    {/* snapshots/syncthing notes: repositioned clear of the stats in narrow
        mode, and re-rendered below the canvas there */}
    <div className={styles.side}>
      {notes}
    </div>

    {/* column divider + right column: hidden in narrow mode, re-rendered
        below the canvas via renderNarrow */}
    <div className={styles.side}>{rightCol}</div>

    <div className={styles.rule} />

    <div className={styles.stats}>{statItems}</div>
  </Canvas>
  );
});
