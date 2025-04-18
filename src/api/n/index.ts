import type { ArchieNSerachAPI, SearchDojin } from './interface';
import { nSearchQueryURL, rowAPIToR7API } from './utils';

export const nHomePage = async (sort?: 'recent' | 'popular-today' | 'popular' | 'popular-week'): Promise<ArchieNSerachAPI[]> => {
  const url = nSearchQueryURL('*', sort);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`[nhentai API]fetch homepage API error, status code: ${response.status}`);
  }

  const list = (await response.json()) as SearchDojin;

  return list.result.map((doujin) => rowAPIToR7API(doujin));
};

export const nSearch = async (query: string, sort?: 'recent' | 'popular-today' | 'popular' | 'popular-week') => {
  const url = nSearchQueryURL(query, sort);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`[nhentai API]fetch search query ${query} API error, status code: ${response.status}`);
  }

  const data = (await response.json()) as SearchDojin;

  return data.result.map((doujin) => rowAPIToR7API(doujin));
};
