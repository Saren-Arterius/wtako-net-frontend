"use client";

import { Layout } from "@/components/Layout";
import { SystemHealth } from "@/components/SystemHealth";
import { ProjectItemComponent } from "@/components/ProjectItemComponent";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { store } from "../store/store";
import { musicPlayerStore } from "../store/MusicPlayerStore";
import { imageViewerStore } from "../store/ImageViewerStore";
import { Art, SiteOwner } from "../types";
import Link from "next/link";
import Image from "next/image";
import FadeInImage from "@/components/FadeInImage";

// ========== WelcomeSection ==========
const WelcomeSection = observer(() => {
  return (
    <div className="xl:col-span-6 col-span-12">
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 sm:col-span-8 ">
          <h2 className="text-xl text-title font-light mb-1">{store.t('Welcome to')}</h2>
          <h1 className="text-4xl sm:text-5xl font-light text-subtitle mb-3 tracking-wide" style={{ letterSpacing: 2 }}>
            {store.t('WTAKO Network')}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4 w-full max-w-[290px] sm:max-w-[380px]">
            <div className="flex-1 h-px bg-highlight"></div>
            <div className="w-1 h-1 bg-highlight rounded-full flex-shrink-0"></div>
            <div className="flex-1 h-px bg-highlight"></div>
          </div>
          <p className="text-content/80 text-lg leading-relaxed mb-4">
            {store.t('A personal space for creativity, code, and self-hosted freedom.')}
          </p>
          <p className="text-content/65 leading-relaxed text-sm">
            {store.t('It\'s just a few regular computers connected to a home network. Why "WTAKO"? To answer that, I would have to travel back in time to ask myself.')}
          </p>
        </div>
        <div className="col-span-4 hidden sm:block">
          <div className="flex justify-end">
            <Image src="/wtako.svg" alt="WTAKO" width="200" height="200" className="w-50 h-auto" />
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">

        <div>
          <div className="bg-white/4 rounded-xl backdrop-blur-md p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                {store.config?.siteOwner.avatarUrl && (
                  <FadeInImage src={store.config.siteOwner.avatarUrl} alt={store.config.siteOwner.name} width="50" height="50" className="w-12 h-12 rounded-full object-cover border-1 border-white/30" />
                )}
                <div>
                  <span className="text-content/80 text-sm block">Owner</span>
                  <span className="text-title font-medium">{store.config?.siteOwner?.name}</span> <span className="text-content/65 text-xs">{store.config?.siteOwner?.handle}</span>
                </div>
              </div>
              <p className="text-highlight/80 text-sm italic flex-1 hidden sm:block" style={{ filter: 'brightness(1.5)' }}>&quot;{store.t(store.config?.siteOwner as SiteOwner)}&quot;</p>
              <Link href="/about" className="flex items-center gap-2 flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-full border border-content/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-content/65" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            </div>
            <p className="text-highlight/80 text-sm italic mt-3 sm:hidden" style={{ filter: 'brightness(1.5)' }}>&quot;{store.t(store.config?.siteOwner as SiteOwner)}&quot;</p>
          </div>

        </div>
      </div>
    </div>
  );
});

// ========== CharactersSection ==========
const CharactersSection = observer(() => {
  return (
    <div className="xl:col-span-6 col-span-12 xl:border-l xl:border-white/10 xl:pl-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl text-title font-light">{store.t('My Characters')}</h3>
        </div>
        <Link href="/about" className="text-link text-sm hover:text-highlight">{store.t('View All')}</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {
          store.characters.map((char) => (
            <div key={char.name} className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 hover:border-highlight/30 transition-colors" style={{ minHeight: 360 }}>
              <div className="flex flex-col items-center text-center">
                <FadeInImage style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const art = store.art.find(a => a.imageUrl === char.refArt);
                    if (art) {
                      imageViewerStore.openArt(art);
                    }
                  }} src={char.image} alt={char.name} width="128" height="128" className="w-32 h-32 rounded-full object-cover mb-3" />
                <h4 className="text-xl text-subtitle">{store.t(char, 'name')}</h4>
                <p className="text-content/65 text-sm">{store.t(char, 'species')} | {store.t(char, 'sex')}</p>
                <p className="text-content/65 mt-2 text-sm">{store.t(char)}</p>
              </div>
              <Link href={`/about#${char.name.toLowerCase()}`} className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-link text-sm hover:text-highlight">
                {store.t('View Profile')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  );
});

// ========== ArtGallery ==========
const ArtGallery = observer(() => {
  const artItems: Art[] = store.art || [];

  // Pre-compute art by type once
  const artByType = artItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || []).concat(item);
    return acc;
  }, {} as Record<string, Art[]>);

  const getTypeArt = (type: string) => artByType[type]?.slice(0, 3) || [];
  const getTypeCount = (type: string) => artByType[type]?.length || 0;

  const artCategories = [
    { type: "COMM", title: store.t('Commissioned'), description: store.t('Works by talented artists'), color: "purple" },
    { type: "AI", title: store.t('AI-Generated'), description: store.t('Explorations with AI'), color: "cyan" },
    { type: "OG", title: store.t('Original'), description: store.t('My own creations'), color: "highlight" },
  ];

  return (
    <div className="lg:pr-6 lg:border-r lg:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg text-title font-light">{store.t('Art Gallery')}</h3>
        </div>
        <Link href="/art" className="text-link text-sm hover:text-highlight">{store.t('View All')}</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {artCategories.map((category) => {
          const categoryArt = getTypeArt(category.type);
          return (
            <div key={category.type} className="bg-white/4 rounded-xl backdrop-blur-md p-5 border border-white/10 text-center">
              <p className="text-sm text-content/65 font-medium">{category.title}</p>
              <p className="text-xs text-content/65 mt-0.5">{category.description}</p>
              <div className="mt-3">
                {categoryArt.length === 0 ? (
                  <span className="text-xs text-link">{store.t('No pieces')}</span>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-1">
                      {categoryArt.map((item, j) => (
                        <div
                          key={j}
                          className="aspect-square cursor-pointer hover:opacity-80 transition-opacity bg-white/5 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                          onClick={() => imageViewerStore.openArt(item)}
                        >
                          <FadeInImage
                            src={item.thumbImageUrl || item.imageUrl}
                            alt={item.title}
                            fill
                            className="w-full h-full rounded-md object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {getTypeCount(category.type) > 3 && (
                      <Link href={`/art?filter=${category.type}`} className="flex items-center justify-center mt-1 rounded-md text-xs text-link hover:bg-white/10 transition-colors" style={{ padding: '0.5em' }}>
                        {store.t('and')} {getTypeCount(category.type) - 3} {store.t('more...')}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ========== MusicGallery ==========
const MusicGallery = observer(() => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-link" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 className="text-lg text-title font-light">{store.t('Music Gallery')}</h3>
        </div>
        <Link href="/music" className="text-link text-sm hover:text-highlight">{store.t('View')} {store.music.length === 0 ? store.t('All') : (store.music.length - 4) + store.t(' More')}</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(store.music).slice(0, 4).map((track, i) => (
          <div key={i} onClick={() => musicPlayerStore.playTrack(track)} className="bg-white/4 rounded-lg backdrop-blur-md overflow-hidden border border-white/10 cursor-pointer hover:border-highlight/50 transition-colors">
            <div className="aspect-square bg-white/5 backdrop-blur-md flex items-center justify-center relative">
              {track.coverUrl ? (
                <FadeInImage src={track.coverUrl} alt={track.title} width="80" height="80" className="w-full h-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-highlight/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-link" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all bg-black/40 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-content" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-2">
              <p className="text text-subtitle truncate text-center">{track.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ========== ProjectsSection ==========
const ProjectsSection = observer(() => {
  return (
    <section className="xl:col-span-4 col-span-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-title" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h3 className="text-lg text-title font-light">{store.t('Coding Projects')}</h3>
        </div>
        <Link href="/projects" className="text-link text-sm hover:text-highlight">{store.t('View')} {store.projects.length === 0 ? store.t('All') : (store.projects.length - 3) + store.t(' More')}</Link>
      </div>
      <div className="space-y-3">
        {store.projects.slice(0, 3).map((project, i) => (
          <div key={i} style={{ cursor: 'pointer' }} className="block"
            onClick={() => {
              window.open(project.url, "_blank", "noopener noreferrer")
            }}>
            <ProjectItemComponent project={project} compact />
          </div>
        ))}
      </div>
    </section>
  );
});


// ========== HomeSection (Main Component) ==========
export const HomeSection = observer(() => {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-12 xl:gap-6 gap-y-6 items-start">
        <WelcomeSection />
        <div className="xl:hidden border-t border-white/10 my-6 col-span-12"></div>
        <CharactersSection />
      </section>

      <div className="border-t border-white/10 my-8 w-full"></div>

      <section className="grid lg:grid-cols-2 grid-cols-1 lg:gap-6 gap-y-6">
        <ArtGallery />
        <div className="lg:hidden border-t border-white/10 my-6 col-span-1"></div>
        <MusicGallery />
      </section>

      <div className="border-t border-white/10 my-8 w-full"></div>

      <section className="grid xl:grid-cols-12 gap-6 items-start">
        <ProjectsSection />
        <div className="xl:hidden border-t border-white/10 my-6 col-span-12"></div>
        <SystemHealth homePage={true} />
      </section>
    </div>
  );
});


export default function Home() {
  return (
    <Layout>
      <HomeSection />
    </Layout>
  );
}
