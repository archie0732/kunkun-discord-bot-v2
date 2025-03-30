export interface SearchManhuaAPI {
  title: string;
  id: string;

  thumb: string;
  author: string;

  upadte: {
    time: string;
    status: string;
    chapter: string;
  };
}

export interface Update {
  time: string;
  chapter: string;
  chapterURL: string;
  status: string;
}

export interface ManhuaguiAPI {
  title: string;
  id: string;
  tags: string;
  thum: string;
  author: string;
  rank: string;
  description: string;
  update: Update;
};

export interface HomePageHotAPI {
  title: string;
  url: string;
  id: string;
  thum: string;
  update: string;
}
