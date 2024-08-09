import axios from "axios";
import { load } from "cheerio";
import chalk from "chalk";

export type DoujinArtist = {
  artist: string;
  book: {
    name: string;
    id: string;
    url: string;
    cover: string;
  };
};

export async function getArtist(name: string): Promise<DoujinArtist> {
  const url = `https://nhentai.net/artist/${name}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  };
  try {
    const response = await axios.get(url, { headers: headers });
    const $ = load(response.data);

    const book = $(".gallery").first();

    if (!book) {
      throw `[nhentai]cannot find the book when try to find ${name}'s last book`;
    }
    const bookName = book.find(".caption").text();
    const bookHref = book.find("a").attr("href");
    const bookID = bookHref?.split("/")[2] || null;
    const cover = book.find("img").attr("data-src") || book.find("img").attr("src");

    return {
      artist: name,
      book: {
        name: bookName,
        id: bookID || "",
        url: bookHref || "",
        cover: cover || "",
      },
    };
  } catch (error) {
    console.log(chalk.red(`[nhentai] fetch error`));
    throw error;
  }
}
