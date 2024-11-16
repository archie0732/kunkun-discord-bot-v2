export interface ManhuaguiCache {
  guild: string;
  channel: string;
  sub: {
    name: string;
    cacheId: string;
    status: string;
    commonURL: string;
    latestChapter: string;
    ChapterURL: string;
  }[];
}
