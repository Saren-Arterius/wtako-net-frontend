export interface Sortable {
  date?: string; // YYYYMMDD format
  order?: number;
}

export interface Art extends Sortable {
  title: string;
  description: string;
  descriptionZH?: string;
  type: "COMM" | "AI" | "OG" | "PHOTO";
  imageUrl: string;
  thumbImageUrl?: string;
  extraVideoUrl?: string;
  author?: { name: string; link: string };
  width?: number;
  height?: number;
}

export interface Music extends Sortable {
  title: string;
  url: string;
  description: string;
  descriptionZH?: string;

  urlType: "SOUNDCLOUD" | "ONLINESEQUENCER" | "FILE";
  coverUrl?: string;
}

export interface Project extends Sortable {
  title: string;
  description: string;
  descriptionZH?: string;
  status: "ACTIVE" | "WIP" | "ARCHIVED";
  tags: string[];
  url: string;
  cover?: {
    iconText?: string;
    imageUrl?: string;
  };
}

export interface Character extends Sortable {
  name: string;
  nameZH?: string;
  species: string;
  speciesZH?: string;
  sex: string;
  sexZH?: string;
  description: string;
  descriptionZH?: string;
  traits: string[];
  image: string;
  refArt: string;
}

export interface SiteOwner {
  name: string;
  handle: string;
  motd: string;
  motdZH?: string;
  avatarUrl: string;
}

export interface Server {
  name: string;
  description: string;
  descriptionZH?: string;
  monitorUrl: string;
}

export interface Service {
  name: string;
  iconUrl: string;
  url: string;
  lanUrl?: string;
  type: 'PUBLIC' | 'PRIVATE',
}

export interface Content {
  art: Art[];
  music: Music[];
  projects: Project[];
  characters: Character[];
  siteOwner: SiteOwner;
  bgCount: number;
  bgMapping: Record<string, string>;
  servers: Server[],
  services: Service[]
}
