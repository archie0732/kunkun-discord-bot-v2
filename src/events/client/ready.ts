import { Events } from "discord.js";
import { hanime1A } from "@/api/hanime1/hanime1_a";

import Manhuagui from "@/api/manhuagui";
import nhentai from "@/notification/nhentai";
import chalk from "chalk";
import utils from "@/utils";

import type { Event } from "@/events";

const name = Events.ClientReady;

export default {
  name,
  async once(client) {
    console.log(chalk.bgGreen(`${client.user?.tag} 登入成功`));

    client.user.setPresence({
      activities: [{ name: `大戰宿儺......` }],
      status: "online",
    });

    await this.registerGCommands();

    const update = () => {
      console.log(chalk.blue(`${utils.getNowTime()} 開始定時檢查更新.....`));

      Promise.all([
        Manhuagui.checkUpdateManhuagui(this).catch(console.error),
        hanime1A(this).catch(console.error),
        nhentai.checkup(this).catch(console.error),
      ]).then(() => {
        console.log(chalk.bgBlue(`[kunkun bot]${client.user?.tag}: 檢查完成`));
      });
    };

    update();
    setInterval(() => void update(), 1200_000);
  },
} as Event<typeof name>;
