import { makeAutoObservable, runInAction } from "mobx";
import { Art, Character, Content, Music, Project, Server, Service, SiteOwner, Sortable } from "../types";
import { MonitorStore } from "./MonitorStore";
import configRaw from '../data/config.json';
import zhRaw from '../data/zh.json';

const config = configRaw as Content;
const zh = zhRaw as Record<string, string>;

function compareSortable(a: Sortable, b: Sortable): number {
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  if (orderB !== orderA) return orderB - orderA;
  return (b.date ?? "0") > (a.date ?? "0") ? 1 : -1;
}

function compareLatest(a: Sortable, b: Sortable): number {
  const dateA = a.date ?? "0";
  const dateB = b.date ?? "0";
  if (dateB !== dateA) return dateB > dateA ? 1 : -1;
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  return orderB - orderA;
}

function convertRemToPx(rem: number) {
  // Get the font size of the root element (html)
  if (typeof window === "undefined") return rem;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return rem * rootFontSize;
}

interface ServerWithMonitorStore extends Server {
  store: MonitorStore,
}

const tabGap = convertRemToPx(0.25);
const allT: Record<string, string> = JSON.parse(JSON.stringify(zhRaw));

const DEFAULT_LANG = 'en';
let initLang: 'en' | 'zh' = DEFAULT_LANG;
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("lang");
  if (saved === 'en' || saved === 'zh') {
    initLang = saved;
  } else {
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
      initLang = 'zh';
    }
  }
}

const defaultWH = 768;

export class Store {
  inited: boolean = false;

  // content
  config: Content | null = null;
  _lang: 'en' | 'zh' = initLang;

  // nav
  navScrollDown: boolean = false;
  _currentTabIdx: number = -1;
  clickedTabIdx: number = -1;
  clickedTabIdxForSpinner: number = -1;
  tabWidths: number[] | null = null;
  tabWidthsMobile: number[] | null = null;
  hozScrollLeft: number = 0;

  // layout
  _bgChoice: number | null = null;
  _innerWidth: number = typeof window !== "undefined" ? window.innerWidth : defaultWH;
  _innerHeight: number = typeof window !== "undefined" ? window.innerHeight : defaultWH;
  constructionBannerVisible: boolean = false;
  magiBannerDismissed: boolean = false;
  lastScrollY: number = 0;

  constructor() {
    makeAutoObservable(this);
    this.initWindowListeners();
    this.config = config;
    this._bgChoice = (Math.floor((Date.now() / 60000)) % config.bgCount) + 1;
  }

  // ================== navigation ==================

  updateTabIdx(idx: number) {
    runInAction(() => {
      this._currentTabIdx = idx;
      if (this.clickedTabIdx === idx) {
        this.clickedTabIdx = -1;
      }
      if (this.clickedTabIdxForSpinner === idx) {
        this.clickedTabIdxForSpinner = -1;
      }
    })
  }

  onTabIdxClicked(idx: number) {
    runInAction(() => {
      if (this._currentTabIdx === idx) {
        this.clickedTabIdxForSpinner = -1;
        this.clickedTabIdx = -1;
        return;
      }
      this.clickedTabIdx = idx;
      setTimeout(() => {
        if (this._currentTabIdx !== idx && this.clickedTabIdx !== -1) {
          this.clickedTabIdxForSpinner = idx;
        }
      }, 300);
    })
  }

  get currentTabIdx() {
    return this._currentTabIdx;
  }

  get tabPrefixWidth() {
    if (!this.tabWidths) return 0;
    return this.tabWidths.slice(0, store.currentTabIdx).reduce((a, b) => a + b + tabGap, 0);
  }

  get tabIndicatorWidth() {
    if (!this.tabWidths) return 0;
    return this.tabWidths[store.currentTabIdx];
  }

  get tabPrefixWidthMobile() {
    if (!this.tabWidthsMobile) return 0;
    return this.tabWidthsMobile.slice(0, store.currentTabIdx).reduce((a, b) => a + b + tabGap, 0);
  }

  get tabIndicatorWidthMobile() {
    if (!this.tabWidthsMobile) return 0;
    return this.tabWidthsMobile[store.currentTabIdx];
  }

  get navIsMobile() {
    return this.innerWidth < 1024;
  }

  get navShouldShrinkNonMobile() {
    return !this.navIsMobile && this.navScrollDown;
  }

  get navShouldShrinkMobile() {
    return this.navIsMobile && this.navScrollDown;
  }

  // ================== layout ==================

  initWindowListeners() {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      this._innerWidth = window.innerWidth;
      this._innerHeight = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
  }

  get innerWidth() {
    if (!this.inited) return defaultWH;
    return this._innerWidth;
  }

  get innerHeight() {
    if (!this.inited) return defaultWH;
    return this._innerHeight;
  }

  get bgChoice() {
    if (!this.inited) return null;
    return this._bgChoice;
  }

  // ================== content ==================

  get characters(): Character[] {
    return [...this.config?.characters || []].sort(compareSortable);
  }

  get art(): Art[] {
    return [...this.config?.art || []].sort(compareSortable);
  }

  get projects(): Project[] {
    return [...this.config?.projects || []].sort(compareSortable);
  }

  get music(): Music[] {
    return [...this.config?.music || []].sort(compareSortable);
  }

  get artLatest(): Art[] {
    return [...this.config?.art || []].sort(compareLatest);
  }

  get projectsLatest(): Project[] {
    return [...this.config?.projects || []].sort(compareLatest);
  }

  get musicLatest(): Music[] {
    return [...this.config?.music || []].sort(compareLatest);
  }

  get services(): Service[] {
    return this.config?.services || [];
  }

  get serverWithStores(): ServerWithMonitorStore[] {
    if (!this.config?.servers) return [];
    const sws = this.config.servers as ServerWithMonitorStore[];
    for (const server of sws) {
      console.log(server.name, server.monitorUrl)
      server.store = new MonitorStore(server.monitorUrl);
    }
    return sws;
  }

  // ================== lang ==================

  get lang() {
    if (!this.inited) return DEFAULT_LANG;
    return this._lang;
  }

  toggleLang() {
    runInAction(() => {
      this._lang = this.lang === 'en' ? 'zh' : 'en';
      this.tabWidths = null;
      this.tabWidthsMobile = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("lang", this.lang);
      }
    })
  }

  t(
    content: string | Art | Music | Project | Character | Server | SiteOwner,
    key: string | null = null
  ) {
    if (!content) return '';
    if (typeof content === 'string') {
      if (this.lang === 'zh') {
        const translated = zh[content];
        allT[content] = translated || '';
        if (translated) return translated;
        return content;
      }
      return content;
    }
    if (this.lang === 'zh') {
      if (key !== null) {
        const keyZH = key + 'ZH';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (keyZH in content && (content as any)[keyZH]) return (content as any)[keyZH];
      }
      if ('motdZH' in content && content.motdZH) return content.motdZH;
      if ('descriptionZH' in content && content.descriptionZH) return content.descriptionZH;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (key !== null && key in content && (content as any)[key]) return (content as any)[key];
    if ('motd' in content) return content.motd;
    if ('description' in content) return content.description;
    return '';
  }
}

declare global {
  interface Window {
    ssstore?: Store;
    allT?: typeof allT;
  }
}

export const store = new Store();
if (typeof window !== 'undefined') {
  window.ssstore = store;
  window.allT = allT;
}