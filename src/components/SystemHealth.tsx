

import { observer } from "mobx-react-lite";
import { store as ms } from "../store/store";
import Link from "next/link";
import { useState } from "react";

// ========== MetricBar ==========
interface MetricBarProps {
  iconPath: string;
  label: string;
  value: number;
  max?: number;
  colorClass: string;
  formatValue?: (v: number) => string;
  exponent?: number;
  displayText?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  return `${bytes} B/s`;
};


const textStatusOk = "text-green-200/50";
const textStatusWarn = "text-amber-300/50";
const textStatusBad = "text-red-400/30";

const bgStatusOk = "bg-green-200/50";
const bgStatusWarn = "bg-amber-300/50";
const bgStatusBad = "bg-red-400/30";

const MetricBar = observer(({ iconPath, label, value, max, colorClass, formatValue, exponent, displayText }: MetricBarProps) => {
  const ratio = max ? Math.min(value / max, 1) : Math.min(value, 100) / 100;
  const percentage = exponent ? Math.pow(ratio, exponent) * 100 : ratio * 100;
  const displayValue = displayText ?? (formatValue ? formatValue(value) : `${Math.round(value)}%`);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-content/65 mb-1">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
          </svg>
          {ms.t(label)}
        </span>
        <span>{displayValue}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
});

// ========== TempDisplay ==========
interface TempDisplayProps {
  label: string;
  value: number;
  colorClass: string;
}

const TempDisplay = observer(({ label, value, colorClass }: TempDisplayProps) => (
  <div>
    <p className="text-xs text-subtitle mb-1">{ms.t(label)}</p>
    <p className={`text-xs ${colorClass}`}>{Math.round(value)}°C</p>
  </div>
));

// ========== VllmMetricDisplay ==========
interface VllmMetricDisplayProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

const VllmMetricDisplay = observer(({ label, value, max, unit }: VllmMetricDisplayProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClass = value >= max * 0.85 ? bgStatusBad : value >= max * 0.6 ? bgStatusWarn : bgStatusOk;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-content/65 mb-1">
        <span className="text-subtitle">{ms.t(label)}</span>
        <span className="text-content">{Math.round(value)} {unit}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
});

// ========== SystemInfoDisplay ==========
interface SystemInfoDisplayProps {
  SYSTEM_INFO: { os: string; cpu: string; case?: string };
  uptime: number;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

// ========== NetworkQualityDisplay ==========
interface NetworkQualityDisplayProps {
  pingStats: {
    latency: { latest: number; last1m: number; last5m: number; last1h: number; last24h: number };
    packet_loss: { latest_percent: number; last1m: number; last5m: number; last1h: number; last24h: number };
  };
  networkTraffic: {
    historical: {
      last1m: { avg_rx_Bps: number; avg_tx_Bps: number };
      last5m: { avg_rx_Bps: number; avg_tx_Bps: number };
      last1h: { avg_rx_Bps: number; avg_tx_Bps: number };
    };
  };
}

const getNetworkQualityColor = (latency: number): string => {
  if (latency < 20) return textStatusOk;
  if (latency < 100) return textStatusWarn;
  return textStatusBad;
};

const getPacketLossColor = (loss: number): string => {
  if (loss === 0) return textStatusOk;
  if (loss < 1) return textStatusWarn;
  return textStatusBad;
};

const NetworkQualityDisplay = observer(({ pingStats, networkTraffic }: NetworkQualityDisplayProps & {}) => {
  const { latency, packet_loss } = pingStats;
  const traffic = networkTraffic.historical;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('Latency:')}</span>
        <span className={getNetworkQualityColor(latency.latest)}>{latency.latest.toFixed(2)} ms</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('5m avg:')}</span>
        <span className={getNetworkQualityColor(latency.last5m)}>{latency.last5m.toFixed(2)} ms</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('1h avg:')}</span>
        <span className={getNetworkQualityColor(latency.last1h)}>{latency.last1h.toFixed(2)} ms</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('Loss (5m):')}</span>
        <span className={getPacketLossColor(packet_loss.latest_percent)}>{packet_loss.latest_percent.toFixed(2)}%</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('RX (1h):')}</span>
        <span className="text-content/80">{formatBytes(traffic.last1h.avg_rx_Bps)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-content/65">{ms.t('TX (1h):')}</span>
        <span className="text-content/80">{formatBytes(traffic.last1h.avg_tx_Bps)}</span>
      </div>
    </div>
  );
});

const SystemInfoDisplay = observer(({ SYSTEM_INFO, uptime }: SystemInfoDisplayProps) => (
  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
    <div>
      <p className="text-subtitle mb-1">{ms.t('OS / Kernel')}</p>
      <p className="text-content/80 truncate" title={SYSTEM_INFO.os}>{SYSTEM_INFO.os}</p>
    </div>
    <div>
      <p className="text-subtitle mb-1">{ms.t('CPU')}</p>
      <p className="text-content/80 truncate" title={SYSTEM_INFO.cpu}>{SYSTEM_INFO.cpu}</p>
    </div>
    {SYSTEM_INFO.case && (
      <div>
        <p className="text-subtitle mb-1">{ms.t('Case')}</p>
        <p className="text-content/80 truncate" title={SYSTEM_INFO.case}>{SYSTEM_INFO.case}</p>
      </div>
    )}
    <div>
      <p className="text-subtitle mb-1">{ms.t('Uptime')}</p>
      <p className="text-content/80">{formatUptime(uptime)}</p>
    </div>
  </div>
));

interface SystemHealthProps {
  homePage?: boolean;
}

export const SystemHealth = observer(({ homePage }: SystemHealthProps) => {
  const servers = ms.serverWithStores;
  const [showDetailed, setShowDetailed] = useState(false);

  const getTempStatus = (temp: number, limits: { min: number; max: number }): string => {
    if (temp >= limits.max) return textStatusBad;
    if (temp >= limits.max * 0.85) return textStatusWarn;
    return textStatusOk;
  };

  const getUtilizationColor = (value: number, threshold_high = 0.8, threshold_mid = 0.6): string => {
    if (value >= threshold_high) return bgStatusBad;
    if (value >= threshold_mid) return bgStatusWarn;
    return bgStatusOk;
  };

  const cpuIcon = "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z";
  const gpuIcon = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4";
  const ramIcon = "M4 6h16M4 10h16M4 14h16M4 18h16";
  const vramIcon = "M4 6h16M4 10h16M4 14h10M4 18h10";
  const ioIcon = "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4";
  const netIcon = "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4";

  return (
    <section className={`xl:col-span-8 col-span-12 ${homePage ? 'xl:border-l xl:border-white/10 xl:pl-6' : ''}`} style={{ marginTop: !homePage ? '-2rem' : '' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {homePage && (
            <>
              <svg className="w-5 h-5 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg text-title font-light">{ms.t('System Health')}</h3>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!homePage && (
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className="text-link text-sm hover:text-highlight cursor-pointer"
            >
              {showDetailed ? ms.t('Show Percentages') : ms.t('Show Memory Values')}
            </button>
          )}
          {homePage && (
            <Link href="/server" className="text-link text-sm hover:text-highlight">
              {ms.t('View Full Dashboard')}
            </Link>
          )}
        </div>
      </div>
      <div className={`grid grid-cols-${ms.innerWidth > 900 ? 2 : 1} gap-4`}>
        {servers.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white/4 rounded-lg backdrop-blur-md p-4 border border-white/10">
            <div className="flex items-center gap-2 text-content/65">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{ms.t('No servers configured.')}</span>
            </div>
          </div>
        ) : (
          servers.map((server) => {
            const { name, monitorUrl, store } = server;
            const { temperatures, usage, usageMB, io, fanSpeed, pwr, vllmMetrics, aiHealth, GAUGE_LIMITS, disks, SYSTEM_INFO, uptime, networkMetrics, frequencies, storageInfo } = store;
            const swap = usage.swap ?? 0;
            const pingStats = networkMetrics?.ping_statistics;
            const networkTraffic = networkMetrics?.network_traffic;
            const hasCx5 = temperatures.cx5 !== undefined && temperatures.cx5 > 0;
            const hasCx7 = temperatures.cx7 !== undefined && temperatures.cx7 > 0;
            const hasGpu = temperatures.gpu !== undefined && temperatures.gpu > 0;
            const hasSsdFan = fanSpeed.ssd !== undefined && fanSpeed.ssd > 0;
            const isWtako = name.toLowerCase().includes("wtako");
            const isMagi = name.toLowerCase().includes("magi");
            const showGpu = !isWtako;
            const showVram = !isWtako;
            const showCpuFan = !isMagi;
            const systemSSD = (disks as Record<string, {
              usageGB: number; temperature?: number; temperatureLimit?: { min: number; max: number }; usage?: number; name?: string; info?: { status: number; statusText?: string }
            }>)['systemSSD'];
            const storageSSD = (disks as Record<string, {
              usageGB: number; temperature?: number; temperatureLimit?: { min: number; max: number }; usage?: number; name?: string
            }>)['storageSSD'];

            return (
              <div key={name} className="bg-white/4 rounded-lg backdrop-blur-md p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-subtitle font-medium">{name}</span>
                    <span className="text-content/65 text-sm">{ms.t(server)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!homePage && (
                      <Link
                        href={monitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link text-sm hover:text-highlight transition-colors flex items-center gap-1 hidden lg:flex"
                      >
                        {ms.t('Open Full Monitor')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    )}
                    <div className="flex items-center gap-1">
                      {store.isAlive ? (
                        <>
                          <div className={`w-2 h-2 rounded-full ${bgStatusOk} animate-pulse`}></div>
                          <span className={`${textStatusOk} text-xs`}>{ms.t('Online')}</span>
                        </>
                      ) : (
                        <>
                          <div className={`w-2 h-2 rounded-full ${bgStatusBad}`}></div>
                          <span className={`${textStatusBad} text-xs`}>{ms.t('Offline')}</span>
                        </>
                      )}
                    </div>

                  </div>
                </div>
                {!homePage && (
                  <div className="lg:hidden mb-2">
                    <Link
                      href={monitorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link text-sm hover:text-highlight transition-colors flex items-center gap-1"
                    >
                      {ms.t('Open Full Monitor')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                )}
                <div className="space-y-3">
                  <div className={`grid grid-cols-${ms.innerWidth > 480 ? 3 : 2} gap-3`}>
                    <MetricBar iconPath={cpuIcon} label="CPU" value={usage.cpu} colorClass={getUtilizationColor(usage.cpu / 100)} />
                    {showGpu && <MetricBar iconPath={gpuIcon} label="GPU" value={usage.gpu} colorClass={getUtilizationColor(usage.gpu / 100)} />}
                    <MetricBar iconPath={ramIcon} label="RAM" value={usage.ram} colorClass={getUtilizationColor(usage.ram / 100)} displayText={showDetailed ? `${(usageMB.ram / 1024).toFixed(1)}GB` : undefined} />
                    {showVram && <MetricBar iconPath={vramIcon} label="VRAM" value={usage.vram} colorClass={getUtilizationColor(usage.vram / 100)} displayText={showDetailed ? `${(usageMB.vram / 1024).toFixed(1)}GB` : undefined} />}
                    {swap > 0 && (
                      <MetricBar iconPath={ramIcon} label="Swap" value={swap} colorClass={getUtilizationColor(swap / 100)} displayText={showDetailed ? `${((usageMB.swap ?? 0) / 1024).toFixed(1)}GB` : undefined} />
                    )}
                    {systemSSD?.usage !== undefined && (
                      <MetricBar iconPath={ioIcon} label={systemSSD.name || "System SSD"} displayText={showDetailed ? `${(systemSSD?.usageGB)}GB` : undefined} value={systemSSD.usage} colorClass={getUtilizationColor(systemSSD.usage / 100)} />
                    )}
                    {storageSSD?.usage !== undefined && (
                      <MetricBar iconPath={ioIcon} label={storageSSD.name || "Storage SSD"} displayText={showDetailed ? `${(storageSSD?.usageGB)}GB` : undefined} value={storageSSD.usage} colorClass={getUtilizationColor(storageSSD.usage / 100)} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <MetricBar
                      iconPath={ioIcon}
                      label="Disk Read"
                      value={io.diskRead}
                      max={GAUGE_LIMITS.io?.diskRead?.max ?? 8053063680}
                      colorClass={getUtilizationColor(io.diskRead / (GAUGE_LIMITS.io?.diskRead?.max ?? 8053063680))}
                      formatValue={formatBytes}
                      exponent={0.4}
                    />
                    <MetricBar
                      iconPath={ioIcon}
                      label="Disk Write"
                      value={io.diskWrite}
                      max={GAUGE_LIMITS.io?.diskWrite?.max ?? 8053063680}
                      colorClass={getUtilizationColor(io.diskWrite / (GAUGE_LIMITS.io?.diskWrite?.max ?? 8053063680))}
                      formatValue={formatBytes}
                      exponent={0.4}
                    />
                    <MetricBar
                      iconPath={netIcon}
                      label={isWtako ? "Internet RX" : "Network RX"}
                      value={io.networkRx}
                      max={GAUGE_LIMITS.io?.networkRx?.max ?? 13421772800}
                      colorClass={getUtilizationColor(io.networkRx / (GAUGE_LIMITS.io?.networkRx?.max ?? 13421772800))}
                      formatValue={formatBytes}
                      exponent={0.4}
                    />
                    <MetricBar
                      iconPath={netIcon}
                      label={isWtako ? "Internet TX" : "Network TX"}
                      value={io.networkTx}
                      max={GAUGE_LIMITS.io?.networkTx?.max ?? 13421772800}
                      colorClass={getUtilizationColor(io.networkTx / (GAUGE_LIMITS.io?.networkTx?.max ?? 13421772800))}
                      formatValue={formatBytes}
                      exponent={0.4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                    <TempDisplay label="CPU Temp" value={temperatures.cpu} colorClass={getTempStatus(temperatures.cpu, { min: 30, max: 95 })} />
                    {hasGpu && <TempDisplay label="GPU Temp" value={temperatures.gpu!} colorClass={getTempStatus(temperatures.gpu!, { min: 30, max: 80 })} />}
                    {hasCx5 && <TempDisplay label="CX5 Temp" value={temperatures.cx5!} colorClass={getTempStatus(temperatures.cx5!, { min: 30, max: 105 })} />}
                    {hasCx7 && <TempDisplay label="CX7 Temp" value={temperatures.cx7!} colorClass={getTempStatus(temperatures.cx7!, { min: 30, max: 100 })} />}
                    {systemSSD?.temperature && (
                      <TempDisplay label="System SSD" value={systemSSD.temperature} colorClass={getTempStatus(systemSSD.temperature, systemSSD.temperatureLimit ?? { min: 30, max: 70 })} />
                    )}
                    {storageSSD?.temperature && (
                      <TempDisplay label="Storage SSD" value={storageSSD.temperature} colorClass={getTempStatus(storageSSD.temperature, storageSSD.temperatureLimit ?? { min: 30, max: 70 })} />
                    )}
                    {!homePage && frequencies.cpu && frequencies.cpu.length >= 2 && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('CPU MHz')}</p>
                        <p className="text-xs text-gray-300">{Math.round(Math.min(...frequencies.cpu))} - {Math.round(Math.max(...frequencies.cpu))}</p>
                      </div>
                    )}
                    {!homePage && frequencies.gpuCore > 0 && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('GPU MHz')}</p>
                        <p className="text-xs text-gray-300">{frequencies.gpuCore}</p>
                      </div>
                    )}
                    {!homePage && storageInfo?.systemSSD?.info?.status !== undefined && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('System SSD Health')}</p>
                        <p className={`text-xs ${storageInfo.systemSSD.info.status === 0 ? textStatusOk : textStatusWarn}`}>
                          {ms.t(storageInfo.systemSSD.info.statusText as string) || (storageInfo.systemSSD.info.status === 0 ? ms.t('Normal') : ms.t('Warning'))}
                        </p>
                      </div>
                    )}
                    {!homePage && storageInfo?.storageSSD?.info?.status !== undefined && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('Storage SSD Health')}</p>
                        <p className={`text-xs ${storageInfo.storageSSD.info.status === 0 ? textStatusOk : textStatusWarn}`}>
                          {ms.t(storageInfo.storageSSD.info.statusText as string) || (storageInfo.storageSSD.info.status === 0 ? ms.t('Normal') : ms.t('Warning'))}
                        </p>
                      </div>
                    )}
                    {pwr.gpu > 0 && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('GPU Power')}</p>
                        <p className="text-xs text-gray-300">{Math.round(pwr.gpu)}W</p>
                      </div>
                    )}
                    {fanSpeed.cpu > 0 && showCpuFan && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('CPU Fan')}</p>
                        <p className="text-xs text-gray-300">{Math.round(fanSpeed.cpu)} RPM</p>
                      </div>
                    )}
                    {hasSsdFan && (
                      <div>
                        <p className="text-xs text-subtitle mb-1">{ms.t('SSD Fan')}</p>
                        <p className="text-xs text-gray-300">{Math.round(fanSpeed.ssd!)} RPM</p>
                      </div>
                    )}
                  </div>

                  {/* vLLM Metrics */}
                  {GAUGE_LIMITS.vllm && (() => {
                    const v = vllmMetrics ?? { prefillTokensPerSecond: 0, generationTokensPerSecond: 0, numRequestsRunning: 0, numRequestsWaiting: 0 };
                    return (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="text-subtitle text-sm font-medium flex items-center gap-2">
                          {ms.t('vLLM')}
                          {aiHealth && (
                            <>
                              <span style={{ opacity: aiHealth.thinking_brain?.healthy ? 1 : 0.2 }} title="thinking_brain">🧠</span>
                              <span style={{ opacity: aiHealth.speaking_lips?.healthy ? 1 : 0.2 }} title="speaking_lips">👄</span>
                              <span style={{ opacity: aiHealth.listening_ears?.healthy ? 1 : 0.2 }} title="listening_ears">🦻</span>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <VllmMetricDisplay
                            label={'Prefill'}
                            value={v.prefillTokensPerSecond}
                            max={GAUGE_LIMITS.vllm.prefillTokensPerSecond?.max ?? 3000}
                            unit="tok/s"
                          />
                          <VllmMetricDisplay
                            label={'Decode'}
                            value={v.generationTokensPerSecond}
                            max={GAUGE_LIMITS.vllm.generationTokensPerSecond?.max ?? 60}
                            unit="tok/s"
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-content/65 pt-1">
                          <span>{ms.t('Running:')} <span className="text-content">{v.numRequestsRunning}</span> / {GAUGE_LIMITS.vllm.numRequestsRunning?.max ?? 8}</span>
                          <span>{ms.t('Waiting:')} <span className="text-content">{v.numRequestsWaiting}</span> / {GAUGE_LIMITS.vllm.numRequestsWaiting?.max ?? 20}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Network Quality - WTAKO only */}
                  {isWtako && pingStats && networkTraffic && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-subtitle text-sm font-medium mb-2">{ms.t('Network Quality')}</div>
                      <NetworkQualityDisplay pingStats={pingStats} networkTraffic={networkTraffic} />
                    </div>
                  )}

                  {/* System Info */}
                  {SYSTEM_INFO && (
                    <SystemInfoDisplay SYSTEM_INFO={SYSTEM_INFO} uptime={uptime} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
});

// ========== SystemHealthSkeleton ==========
export const SystemHealthSkeleton = ({ homePage }: SystemHealthProps) => (
  <section className={`xl:col-span-8 col-span-12 ${homePage ? 'xl:border-l xl:border-white/10 xl:pl-6' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white/10 rounded" />
        <div className="h-5 w-32 bg-white/10 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-32 bg-white/10 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white/4 rounded-lg backdrop-blur-md p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-16 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="h-10 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);