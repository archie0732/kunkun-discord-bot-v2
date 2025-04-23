import { load } from "cheerio";
import { novelChapterURL, noveURL } from "./utils"
import type { NovelChapter, NovelDetail } from "./interface";

export const novelDetail = async (novelId: string): Promise<NovelDetail> => {
  const url = noveURL(novelId);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`[linovelibAPI] Failed to fetch novel detail: ${res.statusText}`);
  }

  const html = await res.text();
  const $ = load(html);

  const title = $('h1.book-title').text();
  const cover = $('img.book-cover').attr('src') ?? '';
  const author = $('span.authorname').find('a').text();

  const tags: string[] = [];
  $('span.tag-small-group').find('em.tag-small.red').each((_, el) => {
    tags.push($(el).find('a').text().trim());
  });

  const description = $('section#bookSummary').find('content').text().trim().replaceAll('\n', '');

  const updateTime = $('.book-meta-l').eq(0).text()
  const updateChapter = $('.book-meta-r').find('p.gray.ell').text()

  const volchapters: { name: string, url: string, cover: string }[] = [];

  $('ol.module-slide-ol.volchapters').find('li').each((_, el) => {
    volchapters.push({
      name: $(el).find('figcaption.module-slide-caption').text().trim(),
      url: $(el).find('a.module-slide-a').attr('href') ?? '',
      cover: $(el).find('img.module-slide-img').attr('data-src') ?? ''
    })
  })


  return {
    title,
    cover,
    author,
    tags,
    description,
    updateTime,
    updateChapter,
    volchapters
  } as NovelDetail;
}

export const novelChapter = async (novelId: string, chapterIndex: number): Promise<NovelChapter[]> => {
  const chapter: NovelChapter[] = [];

  const url = novelChapterURL(novelId);

  console.log(url)

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`[linovelibAPI] Failed to fetch novel chapter: ${res.status}`);
  }

  const html = await res.text();
  const $ = load(html);

  const check = $('ul.volume-chapters').eq(chapterIndex - 1).text()

  if (check === '') {
    throw new Error(`[linovelibAPI] Failed to fetch novel chapter: ${chapterIndex}`);
  }

  $('ul.volume-chapters').eq(chapterIndex - 1).find('li.chapter-li.jsChapter').each((_, el) => {
    chapter.push({
      title: $(el).find('span.chapter-index').text().trim(),
      url: $(el).find('a.chapter-li-a').attr('href') ?? ''
    })
  })

  return chapter;
}

//novelDetail('4600').then(console.log)
novelChapter('4600', 3).then(console.log)