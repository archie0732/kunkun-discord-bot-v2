import { NhentaiError } from './error';
import type { Doujin, SearchDojin } from './nehntai.interface';

export class SearchDoujinTagResult {
  list: Doujin[] = [];
  tag: string;

  constructor(data: SearchDojin, tag: string) {
    this.list = data.result;
    this.tag = tag;
  }

  filter() {
    for (const doujin of this.list) {
      for (const tag of doujin.tags) {
        if (tag && tag.type == 'artist' && (tag.name == this.tag || tag.name.replace('%20', ' ') == this.tag)) {
          return doujin;
        }
      }
    }
    throw new NhentaiError(`cannot find the ${this.tag} in list`);
  }
}

export const search = async (tagName: string) => {
  const url = `https://nhentai.net/api/galleries/search?query=${tagName}`;

  const resp = await fetch(url);
  if (resp.status != 200) {
    throw new NhentaiError(`search tag ${tagName} fail`, resp.status);
  }

  const list = await resp.json() as SearchDojin;
  if (!list.result) {
    throw new NhentaiError('Empty search result');
  }

  return new SearchDoujinTagResult(list, tagName);
};

export const findTheLatestDojin = async (tagId: string) => {
  const url = `https://nhentai.net/api/galleries/tagged?tag_id=${tagId}`;
  console.log(url);
  const res = await fetch(url);
  if (res.status !== 200) throw new NhentaiError('fetch nhentai web fail', res.status);

  const data = await res.json() as Doujin[];

  return data[0];
};
