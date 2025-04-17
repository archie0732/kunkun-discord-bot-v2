import { ActivityType, Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';

import logger from '@/class/logger';

export default new R7EventHandler({
  event: Events.ClientReady,
  async on(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    await this.updateCommands();

    this.user?.setPresence({
      activities:[
         {
          name:'初華爬行●▛▙',
          type:ActivityType.Watching,
         }
      ],
      status:'online'
    })
  },
});
