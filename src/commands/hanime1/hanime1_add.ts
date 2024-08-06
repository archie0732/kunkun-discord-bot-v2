import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { ExtendedClient } from "@/types/ExtendedClient";
import { hanime1_fetch } from "@/api/hanime1/hanime1_fetch";

import chalk from "chalk";

import type { local_subscribe } from "@/types/subData";

export default {
  data: new SlashCommandBuilder()
    .setName("sub_hanime1")
    .setNameLocalization("zh-TW", "訂閱hanime1")
    .setDescription("訂閱在hanime1的作者或作品標籤，當有更新時通知")
    .addStringOption((option) => option.setName("tag").setDescription("作者名或標籤名").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    const tag = interaction.options.getString("tag")?.replace(/ /g, "%20");

    try {
      await interaction.deferReply({ ephemeral: true });

      const hanime1 = await hanime1_fetch(tag!);
      const filePath = `./resource/hanime1/${interaction.guildId}.json`;

      if (!hanime1) {
        console.error(`[hanime1]${tag} - 抓取資料失敗`);
        await interaction.editReply({
          content: "抓取hanime1 資料時發生錯誤",
        });
        return;
      }

      let localData: local_subscribe;
      if (!existsSync(filePath)) {
        localData = {
          guild: interaction.guildId || "",
          channel: interaction.channelId,
          sub: [],
        };
      } else {
        localData = JSON.parse(readFileSync(filePath, "utf-8"));
      }

      if (localData.sub.some((value) => value.name.replace(/ /g, "%20") === tag)) {
        await interaction.editReply({
          content: "此標籤已在訂閱列表中",
        });
        console.log(chalk.red(`[hanime1]${interaction.user.username} - 重複訂閱: ${tag}`));
        return;
      }

      localData.sub.push({
        name: tag!.replace(/%20/g, " "),
        id: hanime1.id,
        status: "",
        last_up: hanime1.title,
        other: "",
      });

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      console.log(chalk.blue(`[hanime1]${interaction.guildId}.json - 檔案寫入完成`));
      await interaction.editReply({
        content: `[hanime1]${tag?.replace(/%20/g, " ")} - 訂閱成功!`,
      });
    } catch (error) {
      console.error(`[hanime1]add error:`);
      throw error;
    }
  },
};