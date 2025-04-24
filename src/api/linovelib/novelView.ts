import type { NovelContent } from "./interface";
import { load } from 'cheerio';

export const novelView = async (url: string): Promise<NovelContent> => {
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'referer': 'https://www.linovelib.com',
      'cookie': 'night=1'
    }
  });

  const html = await res.text();
  const $ = load(html);

  const chapterTitle = $('h1#atitle').text().trim();

  const title = $('h3').text().trim();

  const contentElement = $('#acontent');

  // 移除廣告相關元素
  contentElement.find('.google-auto-placed, .adsbygoogle, iframe[name="googlefcPresent"], .ads, .advertisement, .ad, .ad-container, .ad-wrapper, .ad-content, .ad-text, .ad-title, .ad-description').remove();

  // 移除廣告腳本
  contentElement.find('script').each((_, el) => {
    const script = $(el);
    const text = script.text();
    if (text.includes('adsbygoogle') ||
      text.includes('googlefcPresent') ||
      text.includes('advertisement') ||
      text.includes('zation();') ||
      text.includes('ad') ||
      text.includes('google')) {
      script.remove();
    }
  });

  // 移除廣告相關的 div
  contentElement.find('div').each((_, el) => {
    const div = $(el);
    const text = div.text();
    if (text.includes('zation();') ||
      text.includes('廣告') ||
      text.includes('advertisement') ||
      text.includes('google')) {
      div.remove();
    }
  });

  // 獲取純文本內容並清理
  let text = contentElement.text().trim();

  // 移除特定的廣告文本
  text = text.replace(/zation\(\);?/g, '');
  text = text.replace(/廣告/g, '');
  text = text.replace(/advertisement/g, '');
  text = text.replace(/google/g, '');

  // 移除多餘的空行
  text = text.replace(/\n\s*\n/g, '\n');

  // 獲取圖片
  const images: string[] = [];
  $('img.imagecontent').each((_, el) => {
    const img = $(el);
    if (img.closest('#hidden-images').length === 0) {
      let imgSrc = img.attr('data-src');
      if (!imgSrc) {
        imgSrc = img.attr('src');
      }
      if (imgSrc && !imgSrc.includes('/images/sloading.svg')) {
        images.push(imgSrc);
      }
    }
  });

  const contentArray: string[] = [];
  let currentChunk = '';

  for (const char of text) {
    currentChunk += char;
    if (currentChunk.length >= 500) {
      contentArray.push(currentChunk);
      currentChunk = '';
    }
  }

  if (currentChunk.length > 0) {
    contentArray.push(currentChunk);
  }

  // 提取章節導航 URL
  const script = $('body#aread').find('script').text();
  const readParamsMatch = script.match(/ReadParams\s*=\s*({[^}]*})/s);
  let prevChapter = '';
  let nextChapter = '';

  if (readParamsMatch && readParamsMatch[1]) {
    try {
      const jsonStr = readParamsMatch[1]
        .replace(/'/g, '"')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\s+/g, ' ')
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ':"$1"')
        .replace(/:\s*([0-9]+)/g, ':$1');

      const readParams = JSON.parse(jsonStr);
      prevChapter = readParams.url_previous ? `https://tw.linovelib.com${readParams.url_previous}` : '';
      nextChapter = readParams.url_next ? `https://tw.linovelib.com${readParams.url_next}` : '';
    } catch (e) {
      console.error('Failed to parse ReadParams:', e);
      console.error('Raw ReadParams:', readParamsMatch[1]);
    }
  }

  return {
    title,
    chapterTitle,
    content: contentArray,
    img: images,
    prevChapter,
    nextChapter
  };
}

//novelView('https://tw.linovelib.com/novel/2499/100299.html').then(console.log)


