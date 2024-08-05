import { join } from "path";
import chalk from "chalk";
import fs from "fs";
import { ExtendedClient } from "../../types/ExtendedClient";
import { local_subscribe } from "../../types/subData";
import { EmbedBuilder } from "discord.js";
import { type Manhuagui } from "./manhuagui_fetch";
import { type Channel } from "discord.js";

async function checkUpdateManhuagui(client: ExtendedClient) {
  const folderPath = `./resource/manhuagui`;

  const folder = fs.readdirSync(folderPath);

  for (const files of folder) {
    const filePath = join(folderPath, files);
    const localData: local_subscribe = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const channel = await client.channels.fetch(localData.channel);
    if (!channel) {
      console.error(chalk.red(`[manhuagui]cannot find the channel`));
    }
    let flag: boolean = false;
    for (const entry of localData.sub) {
      try {
        const manhuagui = await client.fetchManhuagui!(entry.id);
        if (entry.last_up !== manhuagui.status.lastest_chapter) {
          entry.last_up = manhuagui.status.lastest_chapter;
          entry.other = manhuagui.status.chapter_url;
          console.log(`[manhuagui]${manhuagui.title.Ch}  -  更新了: ${manhuagui.status.lastest_chapter}`);
          await sendAnnouncement(client, manhuagui, channel!);
          flag = true;
        }
      } catch (error) {
        console.error(chalk.red("[manhuagui]fetch manhuagui error: " + error));
      }
    }
    if (flag) {
      fs.writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      console.log(chalk.blue(`[manhuagui]${files}  -  檔案寫入成功!`));
    }
  }
}

async function sendAnnouncement(client: ExtendedClient, manhuagui: Manhuagui, channel: Channel) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.username} - 被切斷的五條悟: manhuagui`,
      iconURL: client.user?.displayAvatarURL() || undefined,
    })
    .setTitle(`${manhuagui.title.Ch} 更新至 ${manhuagui.status.lastest_chapter}`)
    .setURL(`${manhuagui.status.chapter_url}`)
    .setImage(manhuagui.cover)
    .setThumbnail(`https://tw.manhuagui.com/favicon.ico`)
    .setDescription(
      `- 您可以使用 </sub_manhuagui:1268082123466739764> 來訂閱\n- 或者使用 </rm_manhuagui:1268082123466739765> 來取消訂閱`
    )
    .setTimestamp(Date.now())
    .addFields(
      { name: `🛜 原網站`, value: `[manhuagui](https://tw.manhuagui.com/)`, inline: true },
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
        name: `🗺️ 漫畫類型`,
        value: `${manhuagui.introduce.local_publish}`,
        inline: true,
      },
      {
        name: `🔍 目前狀態`,
        value: `${manhuagui.status.now}，${manhuagui.status.date}更新到: ${manhuagui.status.lastest_chapter}`,
      },
      {
        name: `🏷️ 標籤`,
        value: `${manhuagui.introduce.categories.join(", ")}`,
      }
    )
    .setFooter({ text: `archie0732's kunkun-bot v2 with TypeScripe` });

  try {
    if (channel && channel.isTextBased()) {
      await channel.send({
        content: `您在[mahuagui](https://tw.manhuagui.com)訂閱的 [${manhuagui.title.Ch}](https://tw.manhuagui.com/comic/${manhuagui.title.id}) 更新了 [${manhuagui.status.lastest_chapter}](${manhuagui.status.chapter_url})`,
        embeds: [embed],
      });
    } else {
      throw `[manguagui]Invalid channel`;
    }
  } catch (error) {
    console.error(chalk.red(`Failed to send announcement: ${error}`));
    throw `[manhuagui] sendAnnouncenent happen error`;
  }
}

export default (client: ExtendedClient) => {
  client.checkUpdateManhuagui = checkUpdateManhuagui;
};
