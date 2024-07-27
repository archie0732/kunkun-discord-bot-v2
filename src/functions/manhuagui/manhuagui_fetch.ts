import axios from "axios";
import { load } from "cheerio";
import { ExtendedClient } from "../../types/ExtendedClient";

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
    lastest_up: string;
    lastest_chapter: string;
  };
};

async function fetchManhuagui(id: string): Promise<Manhuagui> {
  const url = "https://tw.manhuagui.com/comic/" + id;

  try {
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
      .map((i, el) => $(el).text())
      .get()
      .join(", ");
    const author = $(".detail-list").find("span").eq(4).find("a").text();
    const status = $("li.status").find("span.red").eq(0).text();
    const lastest_up = $("li.status").find("span.red").eq(1).text();
    const lastest_chapter = $(".chapter-list").find("ul").eq(2).find("a.status0").attr("title");

    const result: Manhuagui = {
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
        lastest_up,
        lastest_chapter: lastest_chapter || "",
      },
    };

    return result;
  } catch (error) {
    throw `fetch manhuagui error: ${error}`;
  }
}

export default (client: ExtendedClient) => {
  client.fetchMangaugui = fetchManhuagui;
};
