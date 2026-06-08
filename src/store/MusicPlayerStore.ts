import { makeAutoObservable } from "mobx";
import { Music } from "../types";
import { store } from "./store";

export class MusicPlayerStore {
  currentTrack: Music | null = null;
  isPlaying: boolean = false;
  audioRef: HTMLAudioElement | null = null;
  progress: number = 0;
  volume: number = 1;
  isLooping: boolean = false;
  isClosing: boolean = false;
  isOpening: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  playTrack(track: Music) {
    if (store.constructionBannerVisible) {
      store.constructionBannerVisible = false;
    }
    if (this.currentTrack?.url === track.url && this.audioRef) {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.audioRef.play();
        this.isPlaying = true;
      }
      return;
    }

    if (this.audioRef) {
      this.audioRef.pause();
      this.audioRef.remove();
    }

    this.currentTrack = track;
    this.audioRef = new Audio(track.url);
    if (this.isLooping) {
      this.audioRef.loop = true;
    }
    this.audioRef.volume = this.volume;
    this.audioRef.play();
    this.isPlaying = true;

    const updateProgress = () => {
      if (this.audioRef) {
        const pct = (this.audioRef.currentTime / this.audioRef.duration) * 100;
        this.progress = isFinite(pct) ? pct : 0;
      }
    };

    this.audioRef.addEventListener("timeupdate", updateProgress);
    this.audioRef.addEventListener("loadedmetadata", updateProgress);

    this.audioRef.onended = () => {
      this.isPlaying = false;
      this.progress = 0;
    };
  }

  pause() {
    if (this.audioRef) {
      this.audioRef.pause();
    }
    this.isPlaying = false;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.audioRef) {
      this.audioRef.play();
      this.isPlaying = true;
    }
  }

  updateProgress(percent: number) {
    this.progress = percent;
  }

  seek(percent: number) {
    if (this.audioRef) {
      const newTime = (percent / 100) * this.audioRef.duration;
      this.audioRef.currentTime = newTime;
      this.progress = percent;
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.audioRef) {
      this.audioRef.volume = volume;
    }
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    if (this.audioRef) {
      this.audioRef.loop = this.isLooping;
    }
  }

  closePlayer() {
    if (this.audioRef) {
      this.audioRef.pause();
      this.audioRef = null;
    }
    this.currentTrack = null;
    this.isPlaying = false;
    this.progress = 0;
  }
}

export const musicPlayerStore = new MusicPlayerStore();
