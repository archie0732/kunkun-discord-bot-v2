import "dotenv/config";

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import type { ExtendedClient } from "@/types/ExtendedClient";
import type { local_subscribe } from "@/types/subData";
import { readFileSync } from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName(`get_json`)
    .setNameLocalization("zh-TW", "取得serve資料")
    .setDescription("此功能僅限開發者使用，請不要誤用此功能")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("data")
        .setDescription("要看的文件")
        .addChoices(
          { name: "n", value: "nhentai" },
          { name: "h1", value: "hanime1" },
          { name: "mhg", value: "manhuagui" }
        )
        .setRequired(true)
    )
    .addStringOption(new SlashCommandStringOption().setName("password").setDescription("防止誤用").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    const dataName = interaction.options.getString("data", true);
    const password = interaction.options.getString("password", true);

    const checkword = process.env["DEV_PASSWORD"];
    if (password != checkword) {
      await interaction.reply({
        content: `本功能用於幫助開發者開發，非開發人員請勿使用以免使用後導致伺服器資料毀損`,
        ephemeral: true,
      });
      return;
    }
    const filePath = `./resource/${dataName}/${interaction.guildId}.json`;
    const localData: local_subscribe = JSON.parse(readFileSync(filePath, "utf-8"));

    const content = "```json\n" + JSON.stringify(localData, null, 2) + "\n```";
    await interaction.reply({
      content: content,
      ephemeral: true,
    });
  },
};