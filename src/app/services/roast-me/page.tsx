"use client";

// Page is zh-TW only: progress/error strings come from the server in zh-TW.

import { Layout } from "@/components/Layout";
import { roastMeStore, ROAST_ME_BASE_URL, FeedEntry } from "@/store/RoastMeStore";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FadeInImage from "@/components/FadeInImage";
import { MagiBanner } from "@/components/MagiBanner";
import { ModalShell, ModalImage } from "@/components/modals/ModalShell";

const SPECIES = ["貓", "狗", "狼", "狐", "龍", "馬", "兔", "熊", "鳥", "爬蟲類"];

const aspectRatio = (e: FeedEntry) =>
  e.image_width && e.image_height ? e.image_width / e.image_height : 1;

// one of the site's 404 stickers, picked per page load
const STICKER = `404-${1 + Math.floor(Math.random() * 7)}.webp`;

const RoastForm = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const [species, setSpecies] = useState("");
  const [extra, setExtra] = useState("");
  const [canPublish, setCanPublish] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewEntry, setViewEntry] = useState<FeedEntry | null>(null);
  const [modalCopied, setModalCopied] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [badFile, setBadFile] = useState(false);
  const badTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [cols, setCols] = useState(2);

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setViewEntry(null);
      setModalClosing(false);
    }, 200);
  };

  const pickImage = (f: File | null) => {
    if (!f) return;
    clearTimeout(badTimer.current);
    if (!f.type.startsWith("image/")) {
      setBadFile(true);
      badTimer.current = setTimeout(() => setBadFile(false), 5000);
      return;
    }
    setBadFile(false);
    setFile(f);
    roastMeStore.clearResult();
    setSpecies("");
    setExtra("");
    roastMeStore.setPreview(f);
  };

  useEffect(() => {
    const mqs = [matchMedia("(min-width: 1024px)"), matchMedia("(min-width: 640px)")];
    const update = () => setCols(mqs[0].matches ? 4 : mqs[1].matches ? 3 : 2);
    update();
    mqs.forEach((m) => m.addEventListener("change", update));
    return () => mqs.forEach((m) => m.removeEventListener("change", update));
  }, []);

  useEffect(() => {
    roastMeStore.connect();
    const sid = new URLSearchParams(window.location.search).get("s");
    if (sid) roastMeStore.resume(sid);
    const onPaste = (e: ClipboardEvent) => {
      if (roastMeStore.status === "processing") return;
      pickImage(e.clipboardData?.files[0] ?? null);
    };
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
      clearTimeout(badTimer.current);
      roastMeStore.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const text = [species, extra.trim()].filter(Boolean).join(" ") || "";
    await roastMeStore.submit(file, text, canPublish);
  };

  const processing = roastMeStore.status === "processing";
  const result = roastMeStore.result;
  const resultImage = result
    ? result.image_sha512
      ? `${ROAST_ME_BASE_URL}/image/${result.image_sha512}`
      : roastMeStore.previewUrl
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-highlight font-light">來酸我獸設</h1>
        <p className="text-subtitle mt-1">上傳圖片，讓 AI 毒舌短評你的角色</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white/4 rounded-none sm:rounded-xl backdrop-blur-md p-6 -mx-6 sm:mx-0 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickImage(e.dataTransfer.files[0] ?? null);
            }}
            className={`flex items-center justify-center h-96 rounded-lg border border-dashed cursor-pointer transition-colors overflow-hidden ${
              dragOver ? "border-highlight/60 bg-white/10" : "border-white/20 bg-white/5 hover:border-highlight/50"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                pickImage(e.target.files?.[0] ?? null);
                e.target.value = ""; // so re-picking the same file still fires change
              }}
              disabled={processing}
              className="hidden"
            />
            {resultImage || roastMeStore.previewUrl ? (
              <FadeInImage
                src={resultImage ?? roastMeStore.previewUrl!}
                alt="pre"
                width={1024}
                height={1024}
                sizes="(max-width: 768px) 100vw, 512px"
                className="max-h-full max-w-full object-contain"
              />
            ) : result ? (
              <div className="flex flex-col items-center gap-2">
                <FadeInImage src={`/${STICKER}`} width={256} height={256} alt="Sticker" />
                <span className="text-subtitle">圖片去了黑洞</span>
              </div>
            ) : (
              <span className={`text-sm ${badFile ? "text-red-300" : "text-subtitle/40"}`}>
                {badFile ? "不支援的檔案格式" : "點選、拖曳或貼上（Ctrl+V）圖片"}
              </span>
            )}
          </label>

          {/* Progress */}
          {processing && roastMeStore.progress && (
            <div className="p-3 bg-highlight/10 rounded-lg">
              <p className="text-subtitle text-sm">
                <span className="text-highlight/80 font-medium">進度: </span>
                <span className="text-subtitle/80">{roastMeStore.progress}</span>
              </p>
            </div>
          )}

          {/* Error */}
          {roastMeStore.error && (
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-subtitle text-sm text-red-200">{roastMeStore.error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl">{result.emoji_max2}</span>
                <p className="text-3xl text-highlight font-light">{result.short_verdict_max5}</p>
              </div>
              <p className="text-subtitle text-center">{result.roast_zhtw}</p>
              {!result.has_fur_feather_scale_and_safe_to_publish && result.reason_zhtw && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-subtitle text-sm text-yellow-200/80">未公開：{result.reason_zhtw}</p>
                </div>
              )}
              <span
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  } catch {
                    // Silent fail for non-critical action
                  }
                }}
                className="text-xs text-subtitle/60 text-center cursor-pointer underline hover:text-subtitle transition-colors block"
                style={{ userSelect: "none" }}
              >
                {copied ? "已複製" : "複製分享連結"}
              </span>
            </div>
          )}

          {file && !viewEntry && (
            <>
              <div className="border-t border-white/10" />
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              disabled={processing}
              className="w-full sm:w-auto px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-subtitle focus:outline-none focus:border-highlight/50 transition-colors"
            >
              <option value="" disabled className="bg-black/80">
                (選填) 物種
              </option>
              {SPECIES.map((s) => (
                <option key={s} value={s} className="bg-black/80">
                  {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={extra}
              maxLength={40}
              onChange={(e) => setExtra(e.target.value)}
              disabled={processing}
              placeholder="(選填) 其他設定 / 角色 / 作品"
              className="w-full sm:w-64 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-subtitle placeholder-subtitle/40 focus:outline-none focus:border-highlight/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!file || processing}
              className="w-full sm:w-auto px-6 py-2 bg-highlight text-white rounded-lg hover:bg-highlight/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "噴酸中..." : "開酸"}
            </button>
          </div>

          <label className="flex justify-center items-center gap-2 text-subtitle text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={canPublish}
              onChange={(e) => setCanPublish(e.target.checked)}
              disabled={processing}
              className="accent-highlight"
            />
            允許公開
          </label>
            </>
          )}
        </form>
      </div>

      <MagiBanner />

      {/* How to Use */}
      <div className="bg-white/4 rounded-none sm:rounded-xl backdrop-blur-md p-6 -mx-6 sm:mx-0 border border-white/10">
        <h2 className="text-xl text-highlight mb-4">如何使用</h2>
        <div className="space-y-2">
          <p className="text-subtitle">1. 上傳你的角色圖片（支援 png/jpg/gif/webp/avif）</p>
          <p className="text-subtitle">2. 選填物種與角色 / 作品名稱</p>
          <p className="text-subtitle">3. 等待毒舌短評生成，網址列可直接分享給別人</p>
        </div>
      </div>

      {/* Public Feed */}
      <div className="bg-white/4 rounded-none sm:rounded-xl backdrop-blur-md p-6 -mx-6 sm:mx-0 border border-white/10">
        <h2 className="text-xl text-highlight mb-1">最近被酸</h2>
        {roastMeStore.totalRoasts !== null && (
          <p className="text-subtitle/40 text-sm mb-3">總共酸了 {roastMeStore.totalRoasts} 次</p>
        )}
        {roastMeStore.feed.length === 0 ? (
          <p className="text-subtitle/40 text-sm">還沒有被酸的獸設...</p>
        ) : (
          // round-robin by index: CSS columns would fill column-major (newest stacked left)
          <div className="flex gap-4">
            {Array.from({ length: cols }, (_, c) => (
              <div key={c} className="flex-1 min-w-0 space-y-4">
                {roastMeStore.feed
                  .filter((_, i) => i % cols === c)
                  .map((entry) => (
                    <div
                      key={entry.image_sha512}
                      onClick={() => setViewEntry(entry)}
                      className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <FadeInImage
                        src={`${ROAST_ME_BASE_URL}/image/${entry.image_sha512}`}
                        alt={entry.roast_zhtw}
                        width={entry.image_width ?? 320}
                        height={entry.image_height ?? 320}
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="w-full h-auto max-h-[50vh] object-contain"
                      />
                      <div className="p-3">
                        <p className="text-highlight text-base mb-1">
                          {entry.emoji_max2} {entry.short_verdict_max5}
                        </p>
                        <p className="text-subtitle text-sm line-clamp-3">{entry.roast_zhtw}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Disclaimer */}
      <div className="text-subtitle/40 text-xs text-center space-y-1 pb-4">
        <p className="text-subtitle/60 text-sm mb-1">免責聲明</p>
        <p>不建議上傳未經授權或涉及版權、非本人擁有之圖片。</p>
        <p>圖片為使用者生成內容（UGC）、文字內容為人工智慧生成內容（AIGC），本站不對任何損害負責。</p>
        <p>若要上傳 NSFW 或非獸設之圖片，請取消勾選「允許公開」。</p>
        <p>公開的圖片將於上傳後一週自動刪除。</p>
        <p>未公開（或無法公開）的圖片僅用於生成，完成後即刻刪除，不留存任何圖片資料。</p>
      </div>

      {/* Feed entry viewer */}
      {viewEntry &&
        createPortal(
          <ModalShell isClosing={modalClosing} onClose={closeModal} aspectRatio={aspectRatio(viewEntry)}>
            <div className="p-6 flex justify-center flex-col">
              <ModalImage
                src={`${ROAST_ME_BASE_URL}/image/${viewEntry.image_sha512}`}
                alt={viewEntry.roast_zhtw}
                aspectRatio={aspectRatio(viewEntry)}
              />
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl">{viewEntry.emoji_max2}</span>
                <p className="text-3xl text-highlight font-light">{viewEntry.short_verdict_max5}</p>
              </div>
              <p className="text-subtitle text-center mt-3">{viewEntry.roast_zhtw}</p>
              <span
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}${window.location.pathname}?s=${viewEntry.session_id}`
                    );
                    setModalCopied(true);
                    setTimeout(() => setModalCopied(false), 1000);
                  } catch {
                    // Silent fail for non-critical action
                  }
                }}
                className="text-xs text-subtitle/60 text-center cursor-pointer underline hover:text-subtitle transition-colors block mt-4"
                style={{ userSelect: "none" }}
              >
                {modalCopied ? "已複製" : "複製分享連結"}
              </span>
            </div>
          </ModalShell>,
          document.body
        )}
    </div>
  );
});

export default function RoastMePage() {
  return (
    <Layout>
      <RoastForm />
    </Layout>
  );
}
