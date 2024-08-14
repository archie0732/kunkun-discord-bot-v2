import fetch from "node-fetch";

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

export class DoujinList {
  result: Doujin[];
  tagName: string;

  fetchTagID(): Tag {
    for (const doujin of this.result) {
      for (const tag of doujin.tags) {
        if (
          tag.type &&
          tag.type === "artist" &&
          (tag.name === this.tagName.replaceAll("-", " ") || tag.name === this.tagName)
        ) {
          return tag;
        }
      }
    }
    console.log(`https://nhentai.net/api/galleries/search?query=${this.tagName}`);
    throw "cannot find the tag by APIserach";
  }

  doujin(): Doujin {
    if (this.result.length === 0) throw "no doujin find in the result list!";
    return this.result[0];
  }

  constructor(data: any, tagName: string) {
    this.result = data.result;
    this.tagName = tagName;
  }
}

export async function fetchSearch(name: string): Promise<DoujinList> {
  try {
    const url = `https://nhentai.net/api/galleries/search?query=${name}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}:${url}`);
    }
    const data = await res.json();
    if (!data) throw `cannot find json data`;
    return new DoujinList(data, name);
  } catch (error) {
    throw error;
  }
}

export async function getLastTagAPI(tagID: string): Promise<Doujin> {
  try {
    const url = `https://nhentai.net/api/galleries/tagged?tag_id=${tagID}`;
    const res = await fetch(url);
    if (!res.ok) throw `[nhentai]fetch api error: status code: ${res.status}:${url}`;
    const data = await res.json();

    return new DoujinList(data, "").doujin();
  } catch (error) {
    throw error;
  }
}
