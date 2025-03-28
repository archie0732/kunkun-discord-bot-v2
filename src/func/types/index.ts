export interface ManhuaguiCache {
    guild: string;
    channel: string;
    sub:
    {
        name: string;
        id: string;
        status: string;
        new_chapter: string;
        ChapterURL: string;
    }[];
}


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
    url: string;
    status: string;
  }