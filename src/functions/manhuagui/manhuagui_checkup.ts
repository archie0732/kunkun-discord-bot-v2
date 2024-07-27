import { join } from "path";
import chalk from "chalk";
import fs from "fs";
import { ExtendedClient } from "../../types/ExtendedClient";
import { local_subscribe } from "../../types/subData";
import { EmbedBuilder } from "discord.js";
import { type Manhuagui } from "./manhuagui_fetch";
import { type Channel } from "discord.js";

async function checkUpdateManguagui(client: ExtendedClient) {
  const folderPath = `./resource/manhuagui`;

  const folder = fs.readdirSync(folderPath);

  for (const files of folder) {
    const filePath = join(folderPath, files);
    const localData: local_subscribe = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const channel = await client.channels.fetch(localData.channel);
    if (!channel) {
      console.error(chalk.red(`cannot find the channel`));
    }
    for (const entry of localData.sub) {
      try {
        const manhuagui = await client.fetchMangaugui!(entry.id);
        if (entry.last_up !== manhuagui.status.lastest_chapter) {
          entry.last_up = manhuagui.status.lastest_chapter;
          console.log(`manguagui[${manhuagui.title.Ch}]  -  更新了: ${manhuagui.status.lastest_chapter}`);
          await sendAnnouncement(client, manhuagui, channel!);
          fs.writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
          console.log(`manguagui  -  檔案寫入成功!`);
        }
      } catch (error) {
        console.error(chalk.red(error));
      }
    }
  }
}

async function sendAnnouncement(client: ExtendedClient, manhuagui: Manhuagui, channel: Channel) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `🎉 ${client.user?.username}: manguagui - ${manhuagui.title.Ch}更新`,
      iconURL: client.user?.displayAvatarURL() || undefined,
    })
    .setTitle(`${manhuagui.title.Ch} 更新至 ${manhuagui.status.lastest_chapter}`)
    .setURL(`https://tw.manhuagui.com/comic/${manhuagui.title.id}/`)
    .setImage(manhuagui.cover)
    .setThumbnail(`https://tw.manhuagui.com/favicon.ico`)
    .setDescription(`- 您可以使用 /manguagui_sub 來訂閱\n- 或者使用 /manguagui_rm 來取消訂閱`)
    .setTimestamp(Date.now())
    .addFields(
      {
        name: `✒️ 作者`,
        value: `${manhuagui.introduce.author}`,
        inline: true,
      },
      {
        name: `🎈 出品年代`,
        value: `${manhuagui.introduce.y_publish}`,
        inline: true,
      },
      {
        name: `🗺️ 漫畫地區`,
        value: `${manhuagui.introduce.local_publish}`,
        inline: true,
      },
      {
        name: `🔍 目前:`,
        value: `${manhuagui.status.now}，目前更新到: ${manhuagui.status.lastest_chapter} | ${manhuagui.status.lastest_up}`,
      },
      {
        name: `🏷️ 標籤`,
        value: `${manhuagui.introduce.categories.join(", ")}`,
      }
    )
    .setFooter({ text: `kunkun-bot v2 with TypeScripe` });

  try {
    if (channel && channel.isTextBased()) {
      await channel.send({
        content: `您訂閱的${manhuagui.title.Ch}更新了${manhuagui.status.lastest_chapter}`,
        embeds: [embed],
      });
    } else {
      console.error(`Invalid channel`);
    }
  } catch (error) {
    console.error(chalk.red(`Failed to send announcement: ${error}`));
  }
}

export default (client: ExtendedClient) => {
  client.checkUpdateManguagui = checkUpdateManguagui;
};
