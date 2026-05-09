import { configure } from "mobx";

configure({
  enforceActions: "never", // Disables the requirement for actions
});


import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";
import { store } from "./store";

export interface StorageInfo {
  [key: string]: {
    info?: {
      status: number;
      statusText?: string;
      metrics?: {
        scrub?: {
          status: string;
          progress: number;
          scrubStarted?: number;
        };
        [key: string]: unknown;
      };
    };
    data?: unknown;
    lastUpdate?: number;
  };
}

export interface Gauges {
  hostname: string;
  cpu: string;
  gpu: string;
  case: string;
  os: string;
}

export interface GaugesLimits {
  temperature: {
    cpu: { min: number; max: number };
    gpu: { min: number; max: number };
    cx5?: { min: number; max: number };
    cx7?: { min: number; max: number };
  };
  io: {
    diskRead: { max: number };
    diskWrite: { max: number };
    networkRx: { max: number };
    networkTx: { max: number };
    backupNetworkRx?: { max: number };
    backupNetworkTx?: { max: number };
  };
  fanSpeed?: {
    cpu?: { max: number };
    ssd?: { max: number };
    motherboard?: { max: number };
  };
  vllm?: {
    prefillTokensPerSecond?: { max: number };
    generationTokensPerSecond?: { max: number };
    numRequestsRunning?: { max: number };
    numRequestsWaiting?: { max: number };
  };
}

export interface SystemInfo {
  hostname: string;
  os: string;
  cpu: string;
  gpu?: string;
  case?: string;
}

export interface Metrics {
  storageInfo?: StorageInfo;
  [key: string]: unknown;
}

export interface IoMetrics {
  diskRead: number;
  diskWrite: number;
  networkRx: number;
  networkTx: number;
  networkPacketsRx: number;
  networkPacketsTx: number;
  networkRxTotal: number;
  networkTxTotal: number;
  activeConn: number;
  backupNetworkPacketsRx: number;
  backupNetworkPacketsTx: number;
  backupNetworkRx: number;
  backupNetworkTx: number;
  isUsingBackup: boolean;
  routeMetrics: Record<string, unknown>;
}

export interface FanSpeed {
  cpu: number;
  motherboard: number;
  ssd?: number;
}

export interface Frequencies {
  cpu: number[];
  gpuCore: number;
}

export interface Pwr {
  gpu: number;
}

export interface Temperatures {
  cpu: number;
  gpu: number;
  cx5?: number;
  cx7?: number;
}

export interface Usage {
  cpu: number;
  gpu: number;
  ram: number;
  vram: number;
  swap?: number;
}

export interface UsageMB {
  ram: number;
  vram: number;
  swap?: number;
}

export interface NetworkMetrics {
  ping_statistics?: {
    latency: { latest: number; last1m: number; last5m: number; last1h: number; last24h: number };
    packet_loss: { latest_percent: number; last1m: number; last5m: number; last1h: number; last24h: number };
  };
  network_traffic?: {
    historical: {
      last1m: { avg_rx_Bps: number; avg_tx_Bps: number };
      last5m: { avg_rx_Bps: number; avg_tx_Bps: number };
      last1h: { avg_rx_Bps: number; avg_tx_Bps: number };
    };
  };
}

export interface MemoryTotals {
  ramTotal: number;
  vramTotal: number;
  swapTotal: number;
}

export class MonitorStore {
  serverUrl: string;
  socket: Socket | null = null;

  // Data from monitor server (common fields)
  storageInfo: StorageInfo = {};
  initInfo: unknown = null;
  metrics: Metrics | null = null;

  // WTAKO-specific metrics
  networkMetrics: NetworkMetrics | null = null;
  iotMetrics: unknown[] = [];
  internetMetrics: unknown[] = [];

  // MAGI-specific metrics
  vllmMetrics: {
    prefillTokensPerSecond: number;
    generationTokensPerSecond: number;
    numRequestsRunning: number;
    numRequestsWaiting: number;
    lastUpdate: number;
  } | null = null;

  // System info
  SYSTEM_INFO: SystemInfo = { hostname: "", os: "", cpu: "", case: "" };
  system: string = "";
  uptime: number = 0;

  // Gauges
  temperatures: Temperatures = { cpu: 0, gpu: 0 };
  usage: Usage = { cpu: 0, gpu: 0, ram: 0, vram: 0 };
  usageMB: UsageMB = { ram: 0, vram: 0 };
  ramTotal: number = 0;
  vramTotal: number = 0;
  swapTotal: number = 0;
  disks: Record<string, unknown> = {};
  io: IoMetrics = {
    diskRead: 0,
    diskWrite: 0,
    networkRx: 0,
    networkTx: 0,
    networkPacketsRx: 0,
    networkPacketsTx: 0,
    networkRxTotal: 0,
    networkTxTotal: 0,
    activeConn: 0,
    backupNetworkPacketsRx: 0,
    backupNetworkPacketsTx: 0,
    backupNetworkRx: 0,
    backupNetworkTx: 0,
    isUsingBackup: false,
    routeMetrics: {},
  };
  fanSpeed: FanSpeed = { cpu: 0, motherboard: 0 };
  frequencies: Frequencies = { cpu: [0], gpuCore: 0 };
  pwr: Pwr = { gpu: 0 };

  // Tracking
  firstDataPushedAt: number = 0;
  lastDataPushedAt: number = 0;
  lastUpdate: number = 0;
  _uiPollingTimestamp: number = 0;

  // GAUGE_LIMITS
  GAUGE_LIMITS: GaugesLimits = {
    temperature: {
      cpu: { min: 30, max: 95 },
      gpu: { min: 30, max: 80 },
      cx5: { min: 30, max: 105 },
      cx7: { min: 30, max: 100 },
    },
    io: {
      diskRead: { max: 3.75 * 1024 * 1024 * 1024 },
      diskWrite: { max: 3.75 * 1024 * 1024 * 1024 },
      networkRx: { max: 1.25 * 1024 * 1024 * 1024 },
      networkTx: { max: 1.25 * 1024 * 1024 * 1024 },
      backupNetworkRx: { max: 6 * 1024 * 1024 },
      backupNetworkTx: { max: 1 * 1024 * 1024 },
    },
    fanSpeed: {
      cpu: { max: 2200 },
      ssd: { max: 2200 },
      motherboard: { max: 12000 },
    },
    vllm: {
      prefillTokensPerSecond: { max: 3000 },
      generationTokensPerSecond: { max: 60 },
      numRequestsRunning: { max: 8 },
      numRequestsWaiting: { max: 20 },
    },
  };

  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    makeAutoObservable(this);
    this.connect();
    this.startPolling();
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this._uiPollingTimestamp = Date.now();
    }, 1000);
  }

  get isAlive(): boolean {
    return this._uiPollingTimestamp > 0 && Date.now() - this.lastDataPushedAt <= 5000;
  }

  connect() {
    console.log('Connecting to', this.serverUrl);
    this.socket = io(this.serverUrl, {
      autoConnect: true,
    });

    // Current events are exhaustive. AI Agents MUST NOT add events.

    // Common events
    this.socket.on("storageInfo", (data) => this.saveData("storageInfo", data));
    this.socket.on("initInfo", (data) => this.saveData("initInfo", data));
    this.socket.on("metrics", (data) => this.saveData("metrics", data));

    // WTAKO-specific events
    this.socket.on("networkMetrics", (data) => this.saveData("networkMetrics", data));
    this.socket.on("iotMetrics", (data) => this.saveData("iotMetrics", data));
    this.socket.on("internetMetrics", (data) => this.saveData("internetMetrics", data));

    // MAGI-specific events
    this.socket.on("vllmMetrics", (data) => this.saveData("vllmMetrics", data));

    this.socket.on("connect", () => console.log(`Connected to ${this.serverUrl}`));
    this.socket.on("disconnect", () => console.log(`Disconnected from ${this.serverUrl}`));
    this.socket.on("connect_error", (error) => console.error(`Connection error to ${this.serverUrl}:`, error));
  }

  private saveData(label: string, data: unknown) {
    if (!store.inited) return;
    if (label === 'initInfo') {
      console.log(this.serverUrl, label, data);
    }
    try {
      const info = typeof data === "string" ? JSON.parse(data) : data;
      if (label === 'usageMB') {
        const infoTyped = info as UsageMB;
        this.usageMB = { ...this.usageMB, ...infoTyped };
      } else {
        for (const key of Object.keys(info)) {
          const typedThis = this as unknown as Record<string, unknown>;
          typedThis[key] = (info as Record<string, unknown>)[key];
        }
      }
      const now = Date.now();
      if (this.firstDataPushedAt === 0) this.firstDataPushedAt = now;
      this.lastDataPushedAt = now;
      if (now - this._uiPollingTimestamp > 995) {
        this._uiPollingTimestamp = now;
      }
    } catch (error) {
      console.error(`Error processing ${label}:`, error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}