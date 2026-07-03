import { makeAutoObservable, runInAction } from "mobx";

export interface PackageResult {
  guid: string;
  packageName: string | null;
  title: string;
  link: string;
  description: string;
  status: "scanned" | "scanning" | "error";
  pubDate: string;
  pubDateTs: number;
  version: string | null;
  analysisOn: number | null;
  aurUrl: string;
  blackFlags: string[];
  redFlags: string[];
  yellowFlags: string[];
}

export type FilterType = "scanned" | "red" | "yellow" | "black";

export interface HealthData {
  status: string;
  timestamp: number;
  queues: {
    aur: { waiting: number; running: number; delayed: number; completed: number; failed: number };
    sss: { waiting: number; running: number; delayed: number; completed: number; failed: number };
  };
}

export type HealthStats = { waiting: number; running: number };

export class AurAuditStore {
  packages: PackageResult[] = [];
  filter: FilterType = "scanned";
  search: string = "";
  isLoading: boolean = false;
  error: string | null = null;
  cursor: number | null = null;
  hasMore: boolean = false;
  history: { packages: PackageResult[], cursor: number | null, hasMore: boolean }[] = [];
  healthStats: HealthStats | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPackages(cursor: number | null = null) {
    this.isLoading = true;
    this.error = null;
    try {
      const url = new URL("https://aur-audit.wtako.net/packages");
      if (this.filter !== "scanned") {
        url.searchParams.set("filter", this.filter);
      }
      if (cursor) {
        url.searchParams.set("before", cursor.toString());
      }
      url.searchParams.set("limit", "20");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();

      runInAction(() => {
        this.packages = data.packages;
        this.cursor = data.nextCursor;
        this.hasMore = !!data.nextCursor;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  async fetchByNames(names: string[]) {
    this.isLoading = true;
    this.error = null;
    try {
      const url = new URL("https://aur-audit.wtako.net/package-analysis");
      url.searchParams.set("names", names.join(","));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();

      console.log('package-analysis response:', data);

      runInAction(() => {
        this.packages = Object.values(data.packages || {}).filter((p: unknown): p is PackageResult => p !== null && typeof p === 'object');
        this.cursor = null;
        this.hasMore = false;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  setFilter = (filter: FilterType) => {
    runInAction(() => {
      this.filter = filter;
      this.search = "";
      this.history = [];
    });
    this.fetchPackages();
  }

  setSearch = (search: string) => {
    runInAction(() => {
      this.search = search;
    });
  }

  nextPage = () => {
    if (this.cursor) {
      this.history.push({ packages: [...this.packages], cursor: this.cursor, hasMore: this.hasMore });
      this.fetchPackages(this.cursor);
    }
  }

  prevPage = () => {
    if (this.history.length > 0) {
      const prev = this.history.pop()!;
      this.packages = prev.packages;
      this.cursor = prev.cursor;
      this.hasMore = prev.hasMore;
    }
  }

  canGoPrev = () => this.history.length > 0;

  refresh = () => {
    this.history = [];
    this.fetchPackages(null);
  }

  async fetchHealthStats() {
    try {
      const res = await fetch("https://aur-audit.wtako.net/health");
      if (!res.ok) return;
      const data: HealthData = await res.json();
      const totalWaiting = (data.queues.aur.waiting || 0) + (data.queues.sss.waiting || 0);
      const totalRunning = (data.queues.aur.running || 0) + (data.queues.sss.running || 0);
      runInAction(() => {
        this.healthStats = { waiting: totalWaiting, running: totalRunning };
      });
    } catch {
      // Silently fail if health check fails
    }
  }
}

export const aurAuditStore = new AurAuditStore();
