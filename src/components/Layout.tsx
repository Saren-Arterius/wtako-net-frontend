

import { observer } from "mobx-react-lite";
import { store } from "../store/store";
import { musicPlayerStore } from "../store/MusicPlayerStore";
import Image from "next/image";
import { MusicPlayer } from "./modals/MusicPlayer";
import { ImageViewer } from "./modals/ImageViewer";
import { Navigation } from "./Navigation";
import { useEffect, useState } from "react";
import FadeInImage from "./FadeInImage";

// ========== Construction Banner ==========
const ConstructionBanner = observer(() => {
  if (!store.constructionBannerVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-600/50 border-t border-amber-500/40 text-white text-sm py-3 px-4 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <span className="flex items-center gap-2">
          <span>⚠️ This site is still under heavy construction. 90% done I guess.</span>
        </span>
        <button
          onClick={() => (store.constructionBannerVisible = false)}
          className="text-white transition-colors ml-4 p-2"
          aria-label="Close"
          style={{ cursor: 'pointer' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
});

// ========== Footer ==========
const Footer = observer(({ className = "" }: { className?: string }) => {
  return (
    <footer className={`border-t border-white/10 mt-16 ${className}`} style={{ transition: 'all ease 0.3s' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 text-sm text-subtitle text-title">
          <Image src="/logo.svg" alt="WTAKO" width="60" height="60" className="w-15 h-15 lg:w-20 lg:h-20" />
          <span style={{ letterSpacing: 2 }}>WTAKO Network</span>
          <div className="hidden lg:block w-px h-4 bg-white/10"></div>
          <div className="text-center lg:text-left">
            <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>©</span> 2026 {store.config?.siteOwner.name || ''}
            <span className="ml-5">{store.t('All rights reversed')}</span>
          </div>
          <div className="hidden lg:block w-px h-4 bg-white/10"></div>
          <div className="flex items-center gap-4 lg:ml-6">
            <a href="https://github.com/Saren-Arterius"
              target="_blank"
              rel="noopener noreferrer" className="hover:text-link transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://x.com/nekomatasaren"
              target="_blank"
              rel="noopener noreferrer" className="hover:text-link transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>

            <a href="mailto:saren@wtako.net" className="hover:text-link transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});



// ========== Layout ==========
export const Layout = observer(({ children }: { children: React.ReactNode }) => {
  const playerPadding = store.constructionBannerVisible || musicPlayerStore.currentTrack ? "pb-28 lg:pb-20" : "";

  const showBlocker = store.clickedTabIdxForSpinner !== -1 && store.clickedTabIdxForSpinner !== store._currentTabIdx;
  return (
    <div className="min-h-screen text-subtitle font-sans relative bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-2000"
        style={{
          backgroundImage: store.bgChoice ? `url(/bg-${store.bgChoice}.avif)` : 'none',
          opacity: store.bgChoice ? 1 : 0
        }}
      />
      <div className="absolute inset-0 bg-background/90"></div>
      <div className="relative z-10">
        <main className={`max-w-7xl mx-auto px-6 py-8 mt-32`}>
          {children}
        </main>

        <Footer className={`${playerPadding}`} />
        <div style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          pointerEvents: 'none',
          top: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: `blur(${showBlocker ? 2 : 0}px)`,
          transition: 'all ease 0.5s'
        }}>
          <div className="relative z-10" style={{
            opacity: showBlocker ? 1 : 0,
            transition: 'opacity ease 0.5s'
          }}>
            <div className="w-12 h-12 border-4 border-highlight/30 border-t-highlight rounded-full animate-spin"></div>
          </div>
        </div>
        <Navigation />

        <MusicPlayer />
        <ImageViewer />
      </div>
    </div >
  );
});
