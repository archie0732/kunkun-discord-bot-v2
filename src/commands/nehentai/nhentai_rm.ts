import { ExtendedClient } from "@/types/ExtendedClient";
import type { local_subscribe } from "@/types/subData";
import chalk from "chalk";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("rm_nhentai")
    .setNameLocalization("zh-TW", "取消訂閱nehnati")
    .setDescription("取消訂閱nhentai上的作者")
    .addStringOption(new SlashCommandStringOption().setName("artist").setDescription("作者名稱").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    try {
      const artist = interaction.options.getString("artist", true);
      const filePath = `./resource/nhentai/${interaction.guildId}.json`;

      if (!existsSync(filePath)) {
        await interaction.reply({
          content: "該伺服器未訂閱任何作者",
          ephemeral: true,
        });
        console.warn(chalk.red(`[nhentai]${interaction.user.displayName}伺服器未找到資料 - ${artist}`));
        return;
      }

      const localData: local_subscribe = JSON.parse(readFileSync(filePath, "utf-8"));
      const originalLength = localData.sub.length;

      localData.sub = localData.sub.filter((val) => val.name !== artist);

      if (originalLength === localData.sub.length) {
        await interaction.reply({
          content: "該伺服器未訂閱此作者",
          ephemeral: true,
        });
        console.warn(chalk.red(`[nhentai]${interaction.user.displayName} 伺服器未找到作者 - ${artist}`));
        return;
      }

      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      await interaction.reply({
        content: `你已成功取消訂閱${artist}`,
        ephemeral: true,
      });
    } catch (error) {
      throw "[nehntai]" + error;
    }
  },
};
