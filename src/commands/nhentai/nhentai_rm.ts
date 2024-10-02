import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import logger from "@/utils/logger";

import type { Command } from "..";
import type { local_subscribe } from "@/types/subData";

export default {
  data: new SlashCommandBuilder()
    .setName("rm_nhentai")
    .setNameLocalization("zh-TW", "取消訂閱nehnati")
    .setDescription("取消訂閱 nhentai 上的作者")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("artist")
        .setDescription("作者名稱")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, _) {
    if (!interaction.inCachedGuild) return;

    try {
      const artist = interaction.options.getString("artist", true);

      const filePath = `./resource/nhentai/${interaction.guildId}.json`;
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        await interaction.reply({
          content: "該伺服器未訂閱任何作者",
          ephemeral: true,
        });
        logger.warn(
          `[nhentai] ${interaction.user.displayName} 伺服器未找到資料 - ${artist}`
        );
        return;
      }

      const localData = (await file.json()) as local_subscribe;
      const originalLength = localData.sub.length;

      localData.sub = localData.sub.filter((val) => val.name !== artist);

      if (originalLength === localData.sub.length) {
        await interaction.reply({
          content: "該伺服器未訂閱此作者",
          ephemeral: true,
        });
        logger.warn(
          `[nhentai] ${interaction.user.displayName} 伺服器未找到作者 - ${artist}`
        );
        return;
      }

      await Bun.write(file, JSON.stringify(localData, null, 2));

      await interaction.reply({
        content: `你已成功取消訂閱${artist}`,
        ephemeral: true,
      });

      logger.info(`[nhentai] ${interaction.guildId} 取消訂閱 ${artist}`);
    } catch (error) {
      throw "[nehntai]" + error;
    }
  },
} as Command;
