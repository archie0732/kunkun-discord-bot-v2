import { Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';
import { upadteCheck } from '@/utils/subHandle';
import logger from '@/class/logger';

export default new R7EventHandler({
  event: Events.ClientReady,
  async on() {
    await upadteCheck(this);
    setInterval(async () => {
      logger.info('check update...');
      await upadteCheck(this);
    }, 600000);
  },
});
