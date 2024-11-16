import type { R7Client } from '@/class/client';
import { checkUpdateManhuagui } from '@/api/manhuagui/checkUpdate';
import { checkNhnentai } from '@/api/nhentai/checkUpdate';

export const upadteCheck = async (client: R7Client) => {
  await checkUpdateManhuagui(client);
  await checkNhnentai(client);
};
