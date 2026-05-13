"use client";

import { Layout } from "@/components/Layout";
import { observer } from "mobx-react-lite";
import { SystemHealth } from "@/components/SystemHealth";
import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { store } from "@/store/store";
import { TransformedRealTimeRate } from "@/store/MonitorStore";

const formatBps = (bps: number): string => {
  if (bps >= 1024 * 1024 * 1024) return `${(bps / (1024 * 1024 * 1024)).toFixed(1)} Gbps`;
  if (bps >= 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} Mbps`;
  if (bps >= 1024) return `${(bps / 1024).toFixed(1)} Kbps`;
  return `${bps} bps`;
};


export const ServerDashboard = observer(() => {
  const [svgCode, setSvgCode] = useState("");
  const [inited, setInited] = useState(false);


  const NETWORK_DIAGRAM = `graph TD
    ISP["${store.t('Fiber Broadband (ISP)')}"]

    Modem["${store.t('Modem / ONT')}<br/>(${store.t('4x1G, 1x10G RJ45')})"]

    LTE["${store.t('Mobile 4G LTE Backup Network')}"]

    Router["${store.t('Router / NVME NAS')}<br/>(${store.t('2x SFP+, 2x QSFP28')})<br/>${store.t('WAN1, VRRP Main')}"]

    CRS305["${store.t('CRS305 Switch')}<br/>(${store.t('1x 1G RJ45, 4x SFP+')})<br/>${store.t('WAN2, VRRP Backup')}"]

    GamingPC["${store.t('Gaming PC')}<br/>(${store.t('40G QSFP+')})<br/>@${store.t('26Gbps (PCIe 3.0 x4)')}"]

    AI_PC["${store.t('AI Core (DGX Spark)')}<br/>(${store.t('2x 200G QSFP56')})"]

    Switch25G["${store.t('2.5G Switch')}<br/>(${store.t('2x SFP+, 4x 2.5G RJ45')})"]

    Unifi1["${store.t('Unifi AP1 (Wired Backhaul)')}"]

    RPi["${store.t('Raspberry Pi 2')}<br/>${store.t('WAN2, Isolated NAT2')}"]

    Zigbee["${store.t('Zigbee Coordinator')}"]

    OldPC["${store.t('Idle Old Computer')}"]

    Unifi2["${store.t('Unifi AP2 (Wired Backhaul)')}"]

    ISP --- Modem

    Modem -- "${store.t('10G RJ45 to SFP+ (10G)')}\n[XXXX]192.168.0.1|ext1[XXXX]" --> Router
    Modem -- "${store.t('1G RJ45')}\n[XXXX]192.168.0.208|ether1[XXXX]" --> CRS305

    LTE -- "${store.t('USB 3.0')}\n[XXXX]192.168.0.1|enp0s20f0u4[XXXX]" --> Router

    Router <-->|"${store.t('SFP+ AOC (10G)')}\n[XXXX]192.168.0.1|int1|1[XXXX]"| CRS305
    Router -- "${store.t('QSFP+ Fiber (40G)')}\n[XXXX]192.168.0.1|int3[XXXX]" --> GamingPC
    Router -- "${store.t('QSFP28 DAC (100G)')}\n[XXXX]192.168.0.1|int2[XXXX]" --> AI_PC

    CRS305 -- "${store.t('SFP+ AOC (10G)')}\n[XXXX]192.168.0.208|sfp-sfpplus2|1[XXXX]" --> Switch25G
    CRS305 -- "${store.t('SFP+ to RJ45 (10G)')}\n[XXXX]192.168.0.208|sfp-sfpplus4|1[XXXX]" --> Unifi1
    CRS305 -- "${store.t('SFP+ to RJ45 (100M)')}\n[XXXX]192.168.0.208|sfp-sfpplus3|1[XXXX]" --> RPi

    Switch25G -- "${store.t('2.5G to 1G')}\n[XXXX]192.168.0.106|port2|1[XXXX]" --> Zigbee
    Switch25G -- "${store.t('SFP+ (10G)')}\n[XXXX]192.168.0.106|port4|1[XXXX]" --> OldPC

    Switch25G -- "${store.t('2.5G RJ45')}\n[XXXX]192.168.0.106|port1|1[XXXX]" --> Unifi2

    linkStyle 0 stroke-width:1px;
    linkStyle 1 stroke-width:3px;
    linkStyle 2 stroke-width:1px;
    linkStyle 3 stroke-width:3px,stroke-dasharray: 5 5;
    linkStyle 4 stroke-width:3px;
    linkStyle 5 stroke-width:4px;
    linkStyle 6 stroke-width:6px;
    linkStyle 7 stroke-width:3px;
    linkStyle 8 stroke-width:3px;
    linkStyle 9 stroke-width:1px;
    linkStyle 10 stroke-width:1px;
    linkStyle 11 stroke-width:3px;
    linkStyle 12 stroke-width:3px;
`;


  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#99a37e",
        primaryTextColor: "#e7e3cf",
        primaryStroke: "#99a37e",
        lineColor: "#99a37e",
        tertiaryColor: "#1a1f24",
        background: "transparent",
        clusterBkg: "#1a1f24",
        clusterBorder: "#99a37e",
        nodeBkg: "#ffffff10",
        nodeBorder: "#99a37e",
        mainBkg: "#ffffff10",
        actorBkg: "#1a1f24",
        actorBorder: "#99a37e",
        actorTextColor: "#e7e3cf",
        labelBoxBkgColor: "#1a1f24",
        labelBoxBorderColor: "#99a37e",
        labelTextColor: "#e7e3cf",
        sequenceActorBkg: "#1a1f24",
        sequenceActorBorderColor: "#99a37e",
        sequenceMessageColor: "#99a37e",
        sequenceLabelColor: "#e7e3cf",
        sequenceLoopColor: "#1a1f24",
        noteBorderColor: "#99a37e",
        noteBkgColor: "#1a1f24",
        noteTextColor: "#e7e3cf",
        messageTextColor: "#e7e3cf",
        messageLineColor: "#99a37e",
      },
      fontFamily: "system-ui",
      flowchart: {
        curve: "basis",
        useMaxWidth: true,
        padding: 0
      }
    });
    setInited(true);
  });

  const tmpCode = svgCode.split('[XXXX]');
  const lanInfo: TransformedRealTimeRate | null = store?.serverWithStores[0].store?.lanInfo;
  for (let i = 0; i < tmpCode.length; i++) {
    if (i % 2 === 0) continue;
    if (!lanInfo) {
      tmpCode[i] = '';
      continue;
    }
    // console.log(tmpCode[i]);
    const [host, nif, reversed] = tmpCode[i].split('|');
    // console.log({host, nif, lanInfo, t: lanInfo[host].interfaces[nif]});
    // console.log({lanInfo, host, nif});
    let rx_bps, tx_bps;
    if (host === '192.168.0.1' && nif === 'ext1') {
      rx_bps = store?.serverWithStores[0]?.store?.io?.networkRx * 8;
      tx_bps = store?.serverWithStores[0]?.store?.io?.networkTx * 8;
    } else if (host === '192.168.0.1' && nif === 'int2') {
      rx_bps = store?.serverWithStores[1]?.store?.io?.networkRx * 8;
      tx_bps = store?.serverWithStores[1]?.store?.io?.networkTx * 8;
    }
    if (rx_bps && !tx_bps) {
      const nifObj = lanInfo[host].interfaces[nif];
      if (nifObj) {
        rx_bps = nifObj.rx_bps;
        tx_bps = nifObj.tx_bps;
      }
    }

    if (!rx_bps && !tx_bps) {
      tmpCode[i] = `<span style="font-size: 12px; opacity: 0.8">N/A</span>`;
      continue;
    }

    if (!rx_bps) rx_bps = 0;
    if (!tx_bps) tx_bps = 0;

    if (reversed) {
      const tmp: number = rx_bps;
      rx_bps = tx_bps;
      tx_bps = tmp;
    }

    tmpCode[i] = `<span style="color: #f0bcf2; font-size: 12px; opacity: 0.8">↑${formatBps(tx_bps)}</span><span style="color: #bcddf2; font-size: 12px; opacity: 0.8">↓${formatBps(rx_bps)}</span>`;
  }
  const svgCodeApplied = tmpCode.join('');

  useEffect(() => {
    mermaid.parse(NETWORK_DIAGRAM);
    mermaid.render("mermaid-diagram", NETWORK_DIAGRAM).then(({ svg }) => {
      setSvgCode(svg);
    });
  }, [inited, store.lang])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-highlight font-light">{store.t('Server Dashboard')}</h1>
          <p className="text-subtitle mt-1">{store.t('Real-time system health and metrics')}</p>
        </div>
      </div>

      {/* System Health Components */}
      <SystemHealth />

      {/* Network Configuration Diagram */}
      <div className="bg-white/4 rounded-lg backdrop-blur-md p-6 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <h2 className="text-lg text-highlight font-medium">{store.t('WTAKO Network Configuration')}</h2>
          <a
            className="self-start md:self-auto text-sm text-link hover:text-highlight transition-colors flex items-center gap-2"
            href="https://saren.wtako.net/wtako-network-diagram.html?a2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {store.t('Full Diagram View')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="flex justify-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: svgCodeApplied }} />
      </div>
    </div>
  );
});

export default function ServerPage() {
  return (
    <Layout>
      <ServerDashboard />
    </Layout>
  );
}
