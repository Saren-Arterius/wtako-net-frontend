import { makeAutoObservable } from "mobx";
import { store } from "./store";

const YTDLPROXY_BASE_URL = "https://ytdlp-proxy.wtako.net";

export type VideoStatus = "idle" | "queued" | "downloading" | "ready" | "error";

interface VideoJob {
  jobId: string;
  status: "queued" | "already_queued" | "ready";
}

export class YtdlpStore {
  status: VideoStatus = "idle";
  jobId: string | null = null;
  progress: string | null = null;
  error: string | null = null;
  videoUrl: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async prepare(url: string): Promise<VideoJob> {
    const response = await fetch(`${YTDLPROXY_BASE_URL}/video/prepare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(store.t("Rate limit exceeded. Please wait a moment before trying again."));
      }
      throw new Error(data.error || store.t("Failed to queue video"));
    }

    return response.json();
  }

  async waitForVideo(jobId: string, onProgress?: (progress: string) => void): Promise<Blob> {
    while (this.status === "queued" || this.status === "downloading") {
      const response = await fetch(`${YTDLPROXY_BASE_URL}/video/watch?jobId=${jobId}`);

      if (response.status === 200) {
        return await response.blob();
      }

      if (response.status === 404) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "Job not found") {
          throw new Error(store.t(data.message || "Job not found"));
        }
        if (data.progress && onProgress) {
          onProgress(data.progress);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      if (response.status === 429) {
        throw new Error(store.t("Rate limit exceeded. Please wait a moment before trying again."));
      }

      throw new Error(store.t("Video fetch failed"));
    }

    throw new Error(store.t("Cancelled"));
  }

  async fetchVideo(url: string): Promise<string> {
    this.status = "queued";
    this.error = null;
    this.progress = store.t("Fetching video...");

    try {
      const { jobId } = await this.prepare(url);
      this.jobId = jobId;

      const blob = await this.waitForVideo(jobId, (prog) => {
        this.progress = prog;
      });

      if (this.videoUrl) {
        URL.revokeObjectURL(this.videoUrl);
      }

      const videoUrl = URL.createObjectURL(blob);
      this.videoUrl = videoUrl;
      this.status = "ready";
      this.progress = store.t("Fetched video!");

      return videoUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : store.t("Unknown error occurred");
      this.error = errorMessage;
      this.status = "error";
      throw err;
    }
  }

  reset() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = null;
    }
    this.status = "idle";
    this.jobId = null;
    this.progress = null;
    this.error = null;
  }

  cancelPolling() {
    this.status = "idle";
  }

  clearVideo() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = null;
    }
  }
}

export const ytdlpStore = new YtdlpStore();
