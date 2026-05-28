"use client";

import { Layout } from "@/components/Layout";
import { store } from "@/store/store";
import { ytdlpStore } from "@/store/YtdlpStore";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

const YtdlpForm = observer(() => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      await ytdlpStore.fetchVideo(url.trim());
    } catch {
      // Error handled in store
    }
  };

  const handleReset = () => {
    ytdlpStore.reset();
    setUrl("");
  };

  useEffect(() => {
    return () => {
      ytdlpStore.cancelPolling();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-highlight font-light">{store.t("yt-dlp Proxy")}</h1>
        <p className="text-subtitle mt-1">{store.t("Watch YouTube and Bilibili videos")}</p>
      </div>

      {/* Download Form */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={store.t("Enter YouTube or Bilibili URL...")}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-subtitle placeholder-subtitle/40 focus:outline-none focus:border-highlight/50 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={ytdlpStore.status === "queued" || ytdlpStore.status === "downloading"}
              className="px-6 py-2 bg-highlight text-white rounded-lg hover:bg-highlight/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {store.t("Watch")}
            </button>

            {(ytdlpStore.status === "ready" || ytdlpStore.status === "error" || ytdlpStore.status === "queued" || ytdlpStore.status === "downloading") && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-white/10 text-subtitle rounded-lg hover:bg-white/20 transition-colors"
              >
                {store.t("Reset")}
              </button>
            )}
          </div>
        </form>

        {/* Progress */}
        {(ytdlpStore.status === "queued" || ytdlpStore.status === "downloading") && ytdlpStore.progress && (
          <div className="mt-4 p-3 bg-highlight/10 rounded-lg">
            <p className="text-subtitle text-sm">
              <span className="text-highlight/80 font-medium">{store.t("Progress")}: </span>
              <span className="text-subtitle/80">{ytdlpStore.progress}</span>
            </p>
          </div>
        )}

        {/* Error */}
        {ytdlpStore.error && (
          <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-subtitle text-sm text-red-200">{ytdlpStore.error}</p>
          </div>
        )}

        {/* Video Player */}
        {ytdlpStore.status === "ready" && ytdlpStore.videoUrl && (
          <div className="mt-6">
            <video
              src={ytdlpStore.videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: 500 }}
            />
            <p className="text-subtitle text-sm mt-2 text-green-300">{store.t("Playing...")}</p>
          </div>
        )}
      </div>

      {/* How to Use */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <h2 className="text-xl text-highlight mb-4">{store.t("How to Use")}</h2>
        <div className="space-y-2">
          <p className="text-subtitle">{store.t("1. Paste a YouTube or Bilibili URL")}</p>
          <p className="text-subtitle">{store.t("2. Click and wait for the video to load")}</p>
          <p className="text-subtitle">{store.t("3. Watch the video in the player below")}</p>
        </div>
      </div>

      {/* Supported Sites */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <h2 className="text-xl text-highlight mb-4">{store.t("Supported Sites")}</h2>
        <div className="flex flex-wrap gap-3">
          <span className="text-subtitle text-sm bg-highlight/10 px-4 py-1.5 rounded-full">{store.t("YouTube")}</span>
          <span className="text-subtitle text-sm bg-highlight/10 px-4 py-1.5 rounded-full">{store.t("Bilibili")}</span>
        </div>
      </div>

      {/* Limitations */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <h2 className="text-xl text-highlight mb-4">{store.t("Limitations")}</h2>
        <div className="space-y-2">
          <p className="text-subtitle text-sm">{store.t("Maximum video duration: 1 hour")}</p>
          <p className="text-subtitle text-sm">{store.t("Maximum resolution: 480p")}</p>
          <p className="text-subtitle text-sm">{store.t("Format: Auto-detects (mp4/webm)")}</p>
          <p className="text-subtitle text-sm">{store.t("Rate limit: 3 requests per 60 seconds")}</p>
        </div>
      </div>
    </div>
  );
});

export default function YtdlpPage() {
  return (
    <Layout>
      <YtdlpForm />
    </Layout>
  );
}
