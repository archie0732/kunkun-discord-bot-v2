import { Events } from "discord.js";
import { hanime1A } from "@/api/hanime1/hanime1_a";

import Manhuagui from "@/api/manhuagui";
import chalk from "chalk";

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

    console.log(chalk.blue(`啟動更新檢查......`));

    await this.registerCommands();

    const update = () => {
      console.log(chalk.green(`開始定時檢查更新.....`));

      Promise.all([
        Manhuagui.checkUpdateManhuagui(this).catch(console.error),
        hanime1A(this).catch(console.error),
      ]).then(() => {
        console.log(chalk.yellow(`[kunkun bot]${client.user?.tag}: 檢查完成`));
      });
    };

    update();
    setInterval(() => void update(), 3_600_000);
  },
} as Event<typeof name>;
