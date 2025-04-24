export interface NovelDetail {
  id: string;
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
  chapterTitle: string;
  vol: {
    title: string;
    url: string;
  }[]
}

export interface NovelSearch {
  title: string;
  id: string;
}

export interface NovelContent {
  title: string;
  chapterTitle: string;
  content: string[];
  img: string[];
  nextChapter: string;
  prevChapter: string;
}

