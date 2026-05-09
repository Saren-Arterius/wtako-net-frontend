import { makeAutoObservable } from "mobx";
import { Art } from "../types";
import { store } from "./store";

export class ImageViewerStore {
  selectedArt: Art | null = null;
  isClosing: boolean = false;
  isImageLoaded: boolean = false;
  isVideoPlaying: boolean = false;
  pageInited: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  openArt(art: Art) {
    this.selectedArt = art;
    this.isClosing = false;
    this.isImageLoaded = false;
    this.isVideoPlaying = false;
  }

  closeArt() {
    this.isClosing = true;
    setTimeout(() => {
      this.selectedArt = null;
      this.isClosing = false;
      this.isVideoPlaying = false;
    }, 200);
  }

  toggleVideoPlayback() {
    this.isVideoPlaying = !this.isVideoPlaying;
  }

  openBackground() {
    if (!store.bgChoice || !store.config?.bgMapping) return;
    const bgUrl = store.config.bgMapping[`${store.bgChoice}`];
    if (!bgUrl) return;
    const matchingArt = store.art.find(a => a.imageUrl === bgUrl);
    if (matchingArt) {
      this.openArt(matchingArt);
    }
  }

}

export const imageViewerStore = new ImageViewerStore();
