import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  AttachmentBuilder,
} from "discord.js";

import { R7Command } from "@/class/commands";

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`get_json`)
    .setNameLocalization("zh-TW", "取得server資料")
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
    .addStringOption(
      new SlashCommandStringOption()
        .setName("password")
        .setDescription("防止誤用")
        .setRequired(true)
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const dataName = interaction.options.getString("data", true);
    const password = interaction.options.getString("password", true);

    const checkword = process.env["DEV_PASSWORD"];
    if (password != checkword) {
      await interaction.editReply({
        content: `本功能用於幫助開發者開發，非開發人員請勿使用以免使用後導致伺服器資料毀損`,
      });
      return;
    }
    const filePath = `./resource/${dataName}/${interaction.guildId}.json`;
    const file = new AttachmentBuilder(filePath);

    await interaction.editReply({
      content: "回傳資料如下:",
      files: [file],
    });
  },
});
