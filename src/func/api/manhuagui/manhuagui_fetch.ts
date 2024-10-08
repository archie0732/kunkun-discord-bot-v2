import { load } from "cheerio";

import axios from "axios";
import { ManhuaguiError } from "./error";

export type Manhuagui = {
  title: {
    Ch: string;
    Jp: string;
    id: string;
  };
  introduce: {
    author: string;
    y_publish: string;
    local_publish: string;
    categories: string[];
  };
  cover: string;
  status: {
    now: string;
    date: string;
    lastest_chapter: string;
    chapter_url: string;
  };
};

export async function fetchManhuagui(id: string): Promise<Manhuagui> {
  try {
    const url = "https://tw.manhuagui.com/comic/" + id;

    const response = await axios.get(url);
    const $ = load(response.data);

    const titleCh = $(".book-title").find("h1").text();
    const titleJp = $(".book-title").find("h2").text();
    const cover = `http:` + $(".book-cover").find("img").attr("src");
    const y_publish = $(".detail-list").find("a").eq(0).text();
    const local_publish = $(".detail-list").find("a").eq(1).text();
    const categories = $(".detail-list")
      .find("span")
      .eq(3)
      .find("a")
      .map((_, el) => $(el).text())
      .get()
      .join(", ");
    const author = $(".detail-list").find("span").eq(4).find("a").text();
    const status = $("li.status").find("span.red").eq(0).text();
    const date = $("li.status").find("span.red").eq(1).text();
    const chapter_url =
      "https://tw.manhuagui.com/" +
      $("#chapter-list-1")
        .find("ul[style=display:block]")
        .find("a.status0")
        .attr("href");
    const lastest_chapter = $("#chapter-list-1")
      .find("ul[style=display:block]")
      .find("a.status0")
      .attr("title");

    return {
      title: {
        Ch: titleCh,
        Jp: titleJp,
        id,
      },
      introduce: {
        author,
        y_publish,
        local_publish,
        categories: categories.split(", "),
      },
      cover,
      status: {
        now: status,
        date,
        lastest_chapter: lastest_chapter || "",
        chapter_url: chapter_url || "",
      },
    };
  } catch (error) {
    throw new ManhuaguiError("Fetch error", id);
  }
}
