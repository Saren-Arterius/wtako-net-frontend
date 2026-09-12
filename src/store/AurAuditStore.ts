import { makeAutoObservable, runInAction } from "mobx";

const BASE = "https://aur-audit.wtako.net";

// Deliberately NOT class fields: MobX must not wrap a live EventSource, and the
// request counter must not become an observable.
let es: EventSource | null = null;
let reqSeq = 0;

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

  async fetchPackages(cursor: number | null = null, silent = false) {
    const req = ++reqSeq;
    if (!silent) {
      this.isLoading = true;
      this.error = null;
    }
    try {
      const url = new URL(`${BASE}/packages`);
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
      if (req !== reqSeq) return; // a newer request already won

      runInAction(() => {
        this.packages = data.packages;
        this.cursor = data.nextCursor;
        this.hasMore = !!data.nextCursor;
        this.isLoading = false;
      });
    } catch (err) {
      if (req !== reqSeq) return;
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  async fetchByNames(names: string[], silent = false) {
    const req = ++reqSeq;
    if (!silent) {
      this.isLoading = true;
      this.error = null;
    }
    try {
      const url = new URL(`${BASE}/package-analysis`);
      url.searchParams.set("names", names.join(","));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      if (req !== reqSeq) return;

      runInAction(() => {
        this.packages = Object.values(data.packages || {}).filter((p: unknown): p is PackageResult => p !== null && typeof p === 'object');
        this.cursor = null;
        this.hasMore = false;
        this.isLoading = false;
      });
    } catch (err) {
      if (req !== reqSeq) return;
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
  }

  setSearch = (search: string) => {
    runInAction(() => {
      this.search = search;
    });
  }

  nextPage = () => {
    if (this.cursor && !this.isLoading) {
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

  /** Re-run whatever produced the current view, without the loading spinner. */
  silentRefresh = () => {
    if (this.isLoading || this.history.length > 0) return; // paged back into history: leave the view alone
    const names = this.search.split(",").map((s) => s.trim()).filter(Boolean);
    if (names.length > 0) void this.fetchByNames(names, true);
    else void this.fetchPackages(null, true);
  }

  /**
   * SSE instead of polling: `queue` carries the /health body, `changed` means
   * audit-results moved so the visible page is refetched. EventSource reconnects
   * by itself; onopen refetches anything missed while offline.
   */
  connect = () => {
    if (es) return;
    es = new EventSource(`${BASE}/events`);
    es.addEventListener("queue", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as Partial<HealthData>;
      const q = data.queues;
      if (!q) return;
      runInAction(() => {
        this.healthStats = {
          waiting: (q.aur.waiting || 0) + (q.sss.waiting || 0),
          running: (q.aur.running || 0) + (q.sss.running || 0),
        };
      });
    });
    es.addEventListener("changed", () => this.silentRefresh());
    es.onopen = () => this.silentRefresh();
  }

  disconnect = () => {
    es?.close();
    es = null;
  }
}

export const aurAuditStore = new AurAuditStore();
