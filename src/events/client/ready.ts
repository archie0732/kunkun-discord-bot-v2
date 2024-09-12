import { Events } from "discord.js";
import { hanime1A } from "@/api/hanime1/hanime1_a";

import Manhuagui from "@/api/manhuagui";
import logger from "@/utils/logger";
import nhentai from "@/notification/nhentai";
import utils from "@/utils";

import type { Event } from "@/events";

const name = Events.ClientReady;

export default {
  name,
  async once(client) {
    logger.info(`${client.user?.tag} 登入成功`);

    client.user.setPresence({
      activities: [{ name: `大戰宿儺......` }],
      status: "online",
    });

    await this.registerGuildCommands();

    const update = () => {
      logger.info(`${utils.getNowTime()} 開始定時檢查更新.....`);

      Promise.all([
        Manhuagui.checkUpdateManhuagui(this).catch(logger.error),
        hanime1A(this).catch(logger.error),
        nhentai.checkup(this).catch(logger.error),
      ]).then(() => {
        logger.info(`[kunkun bot] ${client.user?.tag}: 檢查完成`);
      });
    };

    update();
    setInterval(() => void update(), 1200_000);
  },
} as Event<typeof name>;
