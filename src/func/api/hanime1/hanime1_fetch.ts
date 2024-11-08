import { load } from 'cheerio';
import fetch from 'node-fetch';

export type Hanime1 = {
  title: string;
  id: string;
  tag: string;
  artist: string;
  video_url: string;
  cover_url: string;
};

export async function hanime1_fetch(tag: string): Promise<Hanime1> {
  const url = 'https://hanime1.me/search?query=' + tag;

  const res = await fetch(url);
  const html = await res.text();

  const $ = load(html);

  const video_url = $('a.overlay').attr('href');
  const cover_url = $('.card-mobile-panel').find('img').eq(1).attr('src');
  const title = $('.card-mobile-title').eq(0).text();
  const artist = $('.card-mobile-user').eq(0).text();
  const match = video_url ? video_url.match(/v=(\d+)/) : null;
  const id = match ? match[1] : null;
  if (!title || !id || !artist || !video_url || !cover_url) {
    throw `網站發生問題`;
  }
  return {
    title: title,
    id: id,
    tag,
    artist: artist,
    video_url: video_url,
    cover_url: cover_url,
  };
}
