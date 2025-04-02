import { Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';
import { checkManhuaguiUpdate } from '@/api/manhuagui/manhuaguiAPI';

import logger from '@/class/logger';

export default new R7EventHandler({
  event: Events.ClientReady,
  async on() {
    setInterval(async () => {
      logger.info('check update...');
      await checkManhuaguiUpdate(this);
    }, 3000000);
  },
});
