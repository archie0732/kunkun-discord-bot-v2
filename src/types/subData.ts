export type local_subscribe = {
  guild: string;
  channel: string;
  sub: {
    name: string;
    id: string;
    last_up: string;
    other: string;
  }[];
};
