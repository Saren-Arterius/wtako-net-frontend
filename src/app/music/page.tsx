"use client";

import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { store } from "@/store/store";
import { musicPlayerStore } from "@/store/MusicPlayerStore";
import { linkify } from "../utils";
import { ContentPageHeader } from "@/components/ContentPageHeader";
import FadeInImage from "@/components/FadeInImage";

const filterOptions = [] as const;

export const MusicGallery = observer(() => {
  const [filter, setFilter] = useState<string>("ALL");
  const [sortByLatest, setSortByLatest] = useState(false);
  const sortedMusic = sortByLatest ? store.musicLatest : store.music;

  return (
    <div className="space-y-6">
      <ContentPageHeader
        title={'Music Gallery'}
        subtitle={'Original compositions and soundscapes. All melodies are by me unless stated otherwise. I specialize in making Celtic music.'}
        filterOptions={filterOptions}
        filterKey={filter}
        onFilterChange={setFilter}
        sortByLatest={sortByLatest}
        onSortToggle={() => setSortByLatest(!sortByLatest)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedMusic.map((item, index) => (
          <div
            key={index}
            className="bg-white/4 rounded-xl backdrop-blur-md p-4 border border-white/10"
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 md:w-32 md:h-32 rounded-lg bg-white/5 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                {item.coverUrl ? (
                  <FadeInImage
                    src={item.coverUrl}
                    alt={item.title}
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-highlight/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-link" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg text-highlight">{item.title}</h3>
                  {item.date && (
                    <span className="text-xs text-subtitle/60">
                      {item.date.slice(0, 4)}-{item.date.slice(4, 6)}-{item.date.slice(6, 8)}
                    </span>
                  )}

                </div>
                <p className="text-subtitle text-sm mt-2">{linkify(store.t(item))}</p>
                {item.urlType === "FILE" ? (
                  <button
                    onClick={() => musicPlayerStore.playTrack(item)}
                    style={{ cursor: 'pointer' }}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    {store.t('Listen')}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-link text-sm hover:text-highlight"
                  >
                    {store.t('Listen')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedMusic.length === 0 && (
        <div className="text-center py-16">
          <p className="text-subtitle text-lg">{store.t('No music tracks found.')}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-subtitle text-sm mb-4">{store.t('Find more of my music or raw melodies on:')}</p>
        <div className="flex gap-6">
          <a
            href="https://soundcloud.com/saren-wtako"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-highlight text-sm flex items-center gap-2"
          >
            {store.t('SoundCloud')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://onlinesequencer.net/members/6193"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-highlight text-sm flex items-center gap-2"
          >
            {store.t('OnlineSequencer')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});


export default function MusicPage() {
  return (
    <Layout>
      <MusicGallery />
    </Layout>
  );
}
