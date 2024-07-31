import chalk from "chalk";
import { ExtendedClient } from "../../types/ExtendedClient";

export default {
  name: "ready",
  once: true,
  execute(client: ExtendedClient) {
    console.log(chalk.bgGreen(`${client.user?.tag} 登入成功`));

    client.user?.setPresence({
      activities: [{ name: `大戰宿儺......` }],
      status: "online",
    });

    console.log(chalk.blue(`啟動更新檢查......`));

    setTimeout(async () => {
      if (client.checkUpdateManhuagui && client.hanime1A) {
        await client.checkUpdateManhuagui(client).catch(console.error);
        await client.hanime1A(client).catch(console.error);
        console.log(chalk.yellow(`[kunkun bot]${client.user?.tag}: 檢查完成`));
      } else {
        console.error(chalk.red("checkUpdateManguagui function is not defined."));
      }
    }, 3_000);

    setInterval(async () => {
      console.log(chalk.green(`開始定時檢查更新.....`));
      await client.checkUpdateManhuagui!(client).catch(console.error);
      await client.hanime1A!(client).catch(console.error);
      console.log(chalk.blue(`檢查完成!`));
    }, 3600000);
  },
};