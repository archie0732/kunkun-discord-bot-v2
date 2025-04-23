export interface NovelDetail {
  title: string;
  cover: string;
  author: string;
  tags: string[];
  description: string;
  updateTime: string;
  volchapters: { name: string, url: string, cover: string }[];
  updateChapter: string;
}

export interface NovelChapter {
  title: string;
  url: string;
}

export interface NovelSearch {
  title: string;
  id: string;
}

