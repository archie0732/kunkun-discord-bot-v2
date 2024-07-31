import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../../types/ExtendedClient";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { local_subscribe } from "../../types/subData";
import chalk from "chalk";

export default {
  data: new SlashCommandBuilder()
    .setName("sub_hanime1")
    .setNameLocalization("zh-TW", "訂閱hanime1")
    .setDescription("訂閱在hanime1的作者或作品標籤，當有更新時通知")
    .addStringOption((option) => option.setName("tag").setDescription("作者名或標籤名").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const tag = interaction.options.getString("tag")?.replace(/ /g, "%20");

    try {
      await interaction.deferReply({ ephemeral: true });

      const hanime1 = await client.hanime1_fetch!(tag!);
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
        last_up: hanime1.title,
        other: "",
      });

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      console.log(chalk.blue(`[hanime1]${interaction.guildId}.json - 檔案寫入完成`));
      await interaction.editReply({
        content: `[hanime1]${tag?.replace(/%20/g, " ")} - 訂閱成功!`,
      });
    } catch (error) {
      console.error(`[hanime1]錯誤:`, error);
      await interaction.editReply({
        content: "訂閱過程中發生錯誤，請稍後再試。",
      });
    }
  },
};
