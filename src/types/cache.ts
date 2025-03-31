import type { GameType } from './hoyo';

export interface ManhuaguiCache {
  guild: string;
  channel: string;
  sub:
  {
    name: string;
    id: string;
    status: string;
    new_chapter: string;
    ChapterURL: string;
  }[];
}

export interface CacheUser {
  userId: string;
  hoyoAutoSign: {
    token: string;
    game: GameType;
  };
}
