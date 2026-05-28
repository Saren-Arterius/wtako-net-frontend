

import { observer } from "mobx-react-lite";
import { useLayoutEffect } from "react";
import { store } from "../store/store";
import { imageViewerStore } from "../store/ImageViewerStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_HEIGHT = 72; // px (h-20)
const SCROLL_THRESHOLD = 5; // px threshold to trigger hide/show

export const navItems = [
  { name: "HOME", path: "/" },
  { name: "ART", path: "/art" },
  { name: "MUSIC", path: "/music" },
  { name: "PROJECTS", path: "/projects" },
  { name: "SERVICES", path: "/services" },
  { name: "SERVER", path: "/server" },
  { name: "ABOUT", path: "/about" },
];

const servicesIdx = navItems.indexOf(navItems.find(n => n.name === 'SERVICES')!);

const NavText = observer(({ mobile = false }: { mobile?: boolean } = {}) => {
  const pathname = usePathname();
  const refs = navItems.map(() => useRef(null));
  useEffect(() => {
    setTimeout(() => {
      const missingTabWidths = mobile && !store.tabWidthsMobile || !mobile && !store.tabWidths;
      if (typeof window !== "undefined" && missingTabWidths) {
        const widths = [];
        for (let i = 0; i < navItems.length; i++) {
          const el = refs[i].current;
          if (!el) break;
          const w = parseFloat(window.getComputedStyle(el).width);
          if (!w) break;
          widths.push(w);
        }
        if (widths.length === navItems.length) {
          if (mobile) {
            store.tabWidthsMobile = widths;
          } else {
            store.tabWidths = widths;
          }
        }
      }
    }, 30)

    const activeTab = navItems.find(n => pathname === n.path || pathname.replace(/\/$/, "") === n.path);

    store.updateTabIdx(activeTab ? navItems.indexOf(activeTab) : servicesIdx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mobile, store.innerWidth, store.lang]);

  const missingTabWidths = mobile && !store.tabWidthsMobile || !mobile && !store.tabWidths;

  return navItems.map((item, i) => (
    <div
      key={item.path}
      ref={refs[i]}
      style={{ marginBottom: !mobile && i === 0 ? -2 : 0 }}>
      <Link
        href={item.path}
        onClick={() => {
          store.onTabIdxClicked(i);
        }}
        className={`px-4 py-2 text-sm font-medium transition-all ${store.currentTabIdx === i
          ? "text-subtitle"
          : "text-subtitle/65 hover:text-subtitle"
          }`}
        style={{
          letterSpacing: 1,
          opacity: store.clickedTabIdx !== store.currentTabIdx && i === store.clickedTabIdx ? 0.2 : 1,
          transition: 'opacity ease-out 0.3s'
        }}
      >
        {store.t(item.name)}
      </Link>
      {i === 0 && (
        <div style={{ width: 0 }}>
          <div className="border-b-2 border-title" style={{
            position: 'relative',
            transform: `translateY(8px) translateX(${mobile ? store.tabPrefixWidthMobile : store.tabPrefixWidth}px)`,
            width: mobile ? store.tabIndicatorWidthMobile : store.tabIndicatorWidth,
            transition: 'transform ease 0.3s, width ease 0.3s' + (!missingTabWidths ? ', opacity ease 1s' : ''),
            opacity: missingTabWidths ? 0 : 1
          }}></div>
        </div>
      )}
    </div>
  ))
});


// ========== Navigation ==========
export const Navigation = observer(() => {
  const ticking = useRef(false);
  const ticking2 = useRef(false);
  const hozScroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    store.inited = true;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - store.lastScrollY;

      // Only toggle visibility when scrolling past threshold
      if (Math.abs(diff) > SCROLL_THRESHOLD && currentScrollY > SCROLL_THRESHOLD) {
        store.navScrollDown = currentScrollY > store.lastScrollY;
      }
      store.lastScrollY = currentScrollY;
      ticking.current = false;
    };

    const requestTick = () => {
      if (!ticking.current) {
        requestAnimationFrame(handleScroll);
        ticking.current = true;
      }
    };
    store.navScrollDown = false;
    window.addEventListener('scroll', requestTick, { passive: true });
    return () => window.removeEventListener('scroll', requestTick);
  }, []);

  useLayoutEffect(() => {
    const el = hozScroll.current;
    if (!el) return;

    // Restore scroll position before paint - no visible jump
    if (store.hozScrollLeft > 0) {
      el.scrollLeft = store.hozScrollLeft;
    }
    requestAnimationFrame(() => {
      el.scrollTo({
        left: Math.max(0, store.tabPrefixWidthMobile - (store.innerWidth / 2) + (store.tabIndicatorWidthMobile / 2)),
        behavior: 'smooth'
      });
    })

    const handleScroll = () => {
      store.hozScrollLeft = el.scrollLeft;
      ticking2.current = false;
    };

    const requestTick = () => {
      if (!ticking2.current) {
        requestAnimationFrame(handleScroll);
        ticking2.current = true;
      }
    };

    el.addEventListener('scroll', requestTick, { passive: true });
    return () => {
      el.removeEventListener('scroll', requestTick);
    };
  }, [store.tabPrefixWidthMobile]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 border-b border-white/10 backdrop-blur-md z-50 md:translate-y-0 bg-black/${store.lastScrollY > 100 && (store.currentTabIdx === 1 || store.currentTabIdx === 2) ? 50 : 10}`}
      style={{
        backdropFilter: 'blur(8px)',
        transform: store.navShouldShrinkMobile ? `translateY(-${NAV_HEIGHT}px)` : 'translateY(0)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-32 lg:h-20" style={{ transition: 'all 0.3s ease', height: (store.navIsMobile || store.navShouldShrinkNonMobile) ? 80 : 128 }}>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="WTAKO" width="64" height="64"
              className="w-32 h-32 lg:w-16 lg:h-16"
              style={{
                transition: 'all 0.3s ease',
                objectFit: 'contain',
                width: (store.navIsMobile || store.navShouldShrinkNonMobile) ? 64 : 128,
                height: (store.navIsMobile || store.navShouldShrinkNonMobile) ? 64 : 128
              }} />
            <div className="text-base lg:text-xl font-light tracking-wide" style={{ lineHeight: '0.9em' }}>
              <span className="text-title" style={{ letterSpacing: '2px', fontWeight: 400, fontSize: '1.1em' }}>WTAKO</span>
              <br />
              <span className="text-title/65" style={{ letterSpacing: '3px', fontSize: '0.6em' }}>NETWORK</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <NavText />
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => store.toggleLang()} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors font-medium w-10 h-10">
              {store.lang === 'en' ? '中' : 'EN'}
            </button>
            <button onClick={() => imageViewerStore.openBackground()} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors h-10">
              <svg className="w-5 h-5 text-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2" ref={hozScroll}>
          <div className="flex items-center gap-1 min-w-max">
            <NavText mobile={true} />
          </div>
        </div>
      </div>
    </nav>
  );
});
