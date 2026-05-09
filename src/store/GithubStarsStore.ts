import { makeAutoObservable } from "mobx";

export class GithubStarsStore {
  stars: Record<string, number> = {};

  constructor() {
    makeAutoObservable(this);
  }

  private extractRepoFromUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/|$)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }

  async fetchStarsBatch(urls: string[]): Promise<void> {
    const promises = urls
      .filter(url => url.includes("github.com"))
      .map(async (url) => {
        const repo = this.extractRepoFromUrl(url);
        if (!repo) return;
        const cacheKey = `${repo.owner}/${repo.repo}`;
        if (this.stars[cacheKey] !== undefined) return;
        try {
          const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
          if (response.ok) {
            const data = await response.json();
            this.stars[cacheKey] = data.stargazers_count || 0;
          }
        } catch {
          // silently fail
        }
      });
    await Promise.all(promises);
  }

  getStars(url: string): number | undefined {
    const repo = this.extractRepoFromUrl(url);
    if (!repo) return undefined;
    const cacheKey = `${repo.owner}/${repo.repo}`;
    return this.stars[cacheKey];
  }
}

export const githubStarsStore = new GithubStarsStore();
