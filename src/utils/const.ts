import { resolve } from 'path';

export const localSaveImage = {
  find_u_problem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLgS6sYJwGbolmGbjW35_MBRSqhxA-lSl0rTF652IRRELMXRGNQkeC8_kmVkErcM3v9S0&usqp=CAU',
  error: '',
};

export const discordBotURL = {
  rickroll: 'https://youtu.be/dQw4w9WgXcQ',
  manhuaguiBase: 'https://tw.manhuagui.com',
};

export const discordDescription = {
  footer: `archie0732's iKun bot v4`,
};

export const baseManhuaguiURL = (id: string) => `https://tw.manhuagui.com/comic/${id}/`;

export const errorThumb
  = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSyK5l9ki_uEKerEUkzg8OlorqjR1xAapxRA&s';

export const disocrdPath = {
  mahuagui: resolve('.cache', 'manhuagui'),
  nhentai: resolve('.cache', 'nhentai'),
  hanime1: resolve('.cache', 'hanime1'),
  user: resolve('.cache', 'user'),
};
