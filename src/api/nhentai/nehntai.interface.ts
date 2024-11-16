interface Picture {
  t: string;
  w: number;
  h: number;
}

interface Image {
  page: Picture[];
  cover: Picture;
  thumbnail: Picture;
}

export interface Tag {
  id: number;
  type: string;
  name: string;
  url: string;
  count: number;
}

export interface Doujin {
  id: number;
  media_id: string;
  title: {
    english: string;
    japanese: string;
    pretty: string;
  };
  images: Image;
  scanlator: string;
  update_date: number;
  tags: Tag[];
  num_pages: number;
  num_favorites: number;
}

export interface SearchDojin {
  result: Doujin[];
}

export interface Nhnetai {
  guild: string;
  channel: string;
  sub: {
    name: string;
    commonId: string;
    latestDoujin: string;
    doujinId: number;
    doujinURL: string;
  }[];
}
