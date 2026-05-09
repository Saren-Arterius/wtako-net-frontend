"use client";

import { Suspense } from "react";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { Art } from "@/types";
import { imageViewerStore } from "@/store/ImageViewerStore";
import { linearClamped } from "../utils";
import { ContentPageHeader } from "@/components/ContentPageHeader";
import FadeInImage from "@/components/FadeInImage";

export const filterOptions = [
  { key: "ALL", label: "All Works" },
  { key: "COMM", label: "Commissions" },
  { key: "OG", label: "Original" },
  { key: "PHOTO", label: "Photos" },
  { key: "AI", label: "AI-Generated" },
] as const;

const ArtGalleryContent = observer(() => {
  const artItems: Art[] = store.art || [];
  const [sortByLatest, setSortByLatest] = useState(false);

  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let defaultFilter = 'ALL';
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlFilter = searchParams.get("filter");
      defaultFilter = (filterOptions.find(o => o.key === urlFilter) ? urlFilter : "ALL") || 'ALL';
    }
    if (defaultFilter !== filter) {
      setFilter(defaultFilter);
    }
  }, []);

  const updateFilter = (newFilter: string) => {
    setFilter(newFilter);
    const url = new URL(window.location.href);
    if (newFilter === "ALL") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", newFilter);
    }
    if (url.href !== window.location.href) window.history.pushState({}, '', url.toString());
  };

  const sortedArt = sortByLatest ? store.artLatest : artItems;

  const filteredArt = sortedArt.filter((item) =>
    filter === "ALL" ? true : item.type === filter
  );

  const getTileSize = (item: Art) => {
    if (!item.width || !item.height) return { cols: 1, rows: 1 };
    const aspect = item.width / item.height;
    if (aspect > 1.2) return { cols: 2, rows: 1 };
    if (aspect < 0.9) return { cols: 1, rows: 2 };
    return { cols: 1, rows: 1 };
  };

  const gridAutoRows = (() => {
    if (store.innerWidth >= 1024) return linearClamped(store.innerWidth, 1024, 1280, 140, 180);
    if (store.innerWidth >= 768) return linearClamped(store.innerWidth, 768, 1024, 135, 180);
    return linearClamped(store.innerWidth, 384, 768, 115, 230)
  })();


  return (
    <div className="space-y-6">
      <ContentPageHeader
        title={'Art Gallery'}
        subtitle={'Explorations in creativity'}
        filterOptions={filterOptions}
        filterKey={filter}
        onFilterChange={updateFilter}
        sortByLatest={sortByLatest}
        onSortToggle={() => setSortByLatest(!sortByLatest)}
        latestLabel={'Latest'}
        defaultLabel={'Best'}
      />

      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0.25 grid-flow-dense`}
        style={{
          gridAutoRows
        }}>
        {filteredArt.map((item, index) => {
          const { cols, rows } = getTileSize(item);
          return (
            <div
              key={index}
              onClick={() => imageViewerStore.openArt(item)}
              className="bg-white/5 overflow-hidden hover:brightness-110 transition-all cursor-pointer relative backdrop-blur-md"
              style={{
                gridColumn: `span ${cols}`,
                gridRow: `span ${rows}`,
              }}
            >
              <FadeInImage
                src={item.thumbImageUrl || item.imageUrl}
                alt={item.title}
                fill
                className="w-full h-full object-cover"
              />
              {item.extraVideoUrl && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5" style={{ opacity: 0.5 }}>
                  <svg className="w-5 h-5 text-link" fill="white" viewBox="0 0 24 24">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredArt.length === 0 && (
        <div className="text-center py-16">
          <p className="text-subtitle text-lg">{store.t('No art pieces found.')}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-subtitle text-sm mb-4">{store.t('Find more of my works on:')}</p>
        <div className="flex gap-6">
          <a
            href="https://x.com/nekomatasaren/media"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-highlight text-sm flex items-center gap-2"
          >
            {store.t('X/Twitter Media')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://e6ai.net/posts?tags=nekomatasaren+rating%3As%0D%0A"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-highlight text-sm flex items-center gap-2"
          >
            {store.t('e6AI')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://t.me/sarenaiarchive"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-highlight text-sm flex items-center gap-2"
          >
            {store.t('Telegram Archive')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});

export default function ArtPage() {
  return (
    <Layout>
      <ArtGalleryContent />
    </Layout>
  );
}
