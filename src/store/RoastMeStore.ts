import { makeAutoObservable, runInAction } from "mobx";
import { io, Socket } from "socket.io-client";

export const ROAST_ME_BASE_URL = "https://roast-me.wtako.net";

export interface RoastResult {
  roast_zhtw: string;
  emoji_max2: string;
  short_verdict_max5: string;
  has_fur_feather_scale_and_safe_to_publish: boolean;
  reason_zhtw: string | null;
  image_sha512: string | null;
  image_width?: number | null;
  image_height?: number | null;
}

export interface FeedEntry extends RoastResult {
  session_id: string;
}

interface SessionMessage {
  error: string | null;
  session_id: string | null;
  progress: string | null;
  result: RoastResult | null;
}

export type RoastStatus = "idle" | "processing" | "done" | "error";

export class RoastMeStore {
  status: RoastStatus = "idle";
  sessionId: string | null = null;
  progress: string | null = null;
  result: RoastResult | null = null;
  error: string | null = null;
  previewUrl: string | null = null;
  feed: FeedEntry[] = [];
  totalRoasts: number | null = null;
  socket: Socket | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  connect() {
    if (this.socket) return;
    const socket = io(ROAST_ME_BASE_URL, { autoConnect: true });

    socket.on("connect", () => {
      socket.emit("join", "global");
      if (this.sessionId) socket.emit("join", `session:${this.sessionId}`);
    });

    socket.on("session", (msg: SessionMessage) => {
      if (msg.session_id !== this.sessionId) return;
      runInAction(() => {
        if (msg.result) {
          this.result = msg.result;
          this.status = "done";
          this.progress = null;
          this.error = null;
        } else if (msg.error) {
          if (msg.error === "找不到這個 session") {
            // stale/expired ?s= link — just show the fresh form
            this.clearResult();
            return;
          }
          this.error = msg.error;
          this.status = "error";
          this.progress = null;
        } else if (msg.progress) {
          this.progress = msg.progress;
          this.status = "processing";
        }
      });
    });

    // entries arrive as arrays: one backfill on join, then one-push appends
    socket.on("entries", (entries: FeedEntry[]) => {
      runInAction(() => {
        const seen = new Set(this.feed.map((e) => e.image_sha512));
        this.feed.unshift(...entries.filter((e) => e.image_sha512 && !seen.has(e.image_sha512)));
      });
    });

    socket.on("stats", (m: { totalRoasts: number }) => {
      runInAction(() => {
        this.totalRoasts = m.totalRoasts;
      });
    });

    this.socket = socket;
  }

  setPreview(file: File) {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = URL.createObjectURL(file);
  }

  async submit(file: File, textPrompt: string, canPublish: boolean) {
    this.connect();
    this.status = "processing";
    this.progress = null;
    this.result = null;
    this.error = null;

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("text_prompt", textPrompt);
      fd.append("can_publish", canPublish ? "true" : "false");

      const res = await fetch(`${ROAST_ME_BASE_URL}/roast-me`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      this.sessionId = data.session_id;
      window.history.replaceState(null, "", `?s=${data.session_id}`);
      this.socket?.emit("join", `session:${data.session_id}`);
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "未知錯誤";
        this.status = "error";
      });
    }
  }

  clearResult() {
    this.status = "idle";
    this.sessionId = null;
    this.progress = null;
    this.result = null;
    this.error = null;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    window.history.replaceState(null, "", window.location.pathname);
  }

  resume(sessionId: string) {
    this.connect();
    this.sessionId = sessionId;
    this.status = "processing";
    window.history.replaceState(null, "", `?s=${sessionId}`);
    this.socket?.emit("join", `session:${sessionId}`);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.status = "idle";
    this.sessionId = null;
    this.progress = null;
    this.result = null;
    this.error = null;
    this.feed = [];
    this.totalRoasts = null;
  }
}

export const roastMeStore = new RoastMeStore();
