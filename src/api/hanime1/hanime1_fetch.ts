import { load } from "cheerio";
import puppeteer from "puppeteer";

export type Hanime1 = {
  title: string;
  id: string;
  tag: string;
  artist: string;
  video_url: string;
  cover_url: string;
};

export async function hanime1_fetch(tag: string): Promise<Hanime1> {
  try {
    const url = "https://hanime1.me/search?query=" + tag;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });
    const html = await page.content();
    await browser.close();
    const $ = load(html);

    const video_url = $("a.overlay").attr("href");
    const cover_url = $(".card-mobile-panel").find("img").eq(1).attr("src");
    const title = $(".card-mobile-title").eq(0).text();
    const artist = $(".card-mobile-user").eq(0).text();
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
  } catch (error) {
    throw error;
  }
}
