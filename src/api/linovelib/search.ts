import { load } from "cheerio";
import type { NovelSearch } from "./interface";
import puppeteer from 'puppeteer';

export const novelSearch = async (keyword: string, pageNum: number): Promise<NovelSearch[]> => {
  const url = `https://cse.google.com/cse?cx=649de34f5e63448cb#gsc.tab=0&gsc.q=${keyword}&gsc.sort=&gsc.page=${pageNum}`;

  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  await browser.close();

  const $ = load(html);

  const novels: NovelSearch[] = [];

  $('.gsc-expansionArea').find('.gsc-webResult.gsc-result').each((_, el) => {
    //console.log($(el).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-breadcrumb').html());
    if ($(el).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-breadcrumb').find('span').text() === 'tw.linovelib.com › novel') {
      const href = $(el).find('a').eq(0).attr('href');
      // Only match URLs in format https://tw.linovelib.com/novel/{id}.html
      if (href?.match(/^https:\/\/tw\.linovelib\.com\/novel\/\d+\.html$/)) {
        novels.push({
          title: $(el).find('a').eq(0).text().split('_')[0].replace('線上看', '').trim(),
          id: href.split('/').pop()?.replace('.html', '') ?? ''
        });
      }
    }
  })

  return novels;
}

//649de34f5e63448cb
//novelSearch('男女', 1).then(console.log)