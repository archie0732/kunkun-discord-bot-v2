import type { R7Client } from '@/class/client';
import { checkManhuaguiUpdate } from '@/api/manhuagui/manhuaguiAPI';
import { checkNhnentai } from '@/api/nhentai/checkUpdate';

export const upadteCheck = async (client: R7Client) => {
  await checkManhuaguiUpdate(client);
  await checkNhnentai(client);
};
