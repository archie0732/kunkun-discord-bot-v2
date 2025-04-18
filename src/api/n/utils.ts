import type { ArchieNSerachAPI, Doujin } from './interface';

export const nSearchQueryURL = (query: string, sort?: string, page?: string) => `https://nhentai.net/api/galleries/search?query=${query}&sort=${sort ?? 'recent'}&page=${page ?? '1'}` as const;

export const rowAPIToR7API = (doujin: Doujin): ArchieNSerachAPI => {
  const tags = doujin.tags.filter((tag) => tag.type === 'tag').map((tag) => tag.name).join(', ');
  const authors = doujin.tags.filter((tag) => tag.type === 'artist').map((tag) => tag.name).join(', ');
  const characters = doujin.tags.filter((tag) => tag.type === 'character').map((tag) => tag.name).join(', ');
  const parodies = doujin.tags.filter((tag) => tag.type === 'parody').map((tag) => tag.name).join(', ');
  const english = doujin.title.english ?? undefined;
  const japanese = doujin.title.japanese ?? undefined;
  const pretty = doujin.title.pretty ?? undefined;

  return {
    sourceURL: `https://nhentai.net/g/${doujin.id}`,
    r7mangaURL: `https://r7manga.vercel.app/n/${doujin.id}`,
    id: doujin.id.toString(),
    mediaID: doujin.media_id,
    title: {
      english,
      japanese,
      pretty,
    },
    thumb: `https://i3.nhentai.net/galleries/${doujin.media_id}/thumb.${typeChange(doujin.images.cover.t)}`,
    page: doujin.num_pages.toString(),
    author: authors || undefined,
    tags: tags || undefined,
    character: characters || undefined,
    parody: parodies || undefined,
  };
};

export const typeChange = (type: string) => {
  switch (type) {
    case 'p':
      return '.png';
    case 'j':
      return '.jpg';
    case 'g':
      return '.gif';
    case 'w':
      return '.webp';
    default:
      return '.png';
  }
};
