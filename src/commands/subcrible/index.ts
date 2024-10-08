import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { R7Command } from "@/class/commands";
import logger from "@/class/logger";

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName("subscribe")
    .setNameLocalization("zh-TW", "訂閱")
    .setDescription("目前支援nhentai, 漫畫櫃, hanime1")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("webside")
        .setDescription("網站")
        .addChoices(
          {
            name: "nhentai",
            value: "nhentai",
          },
          {
            name: "看漫畫",
            value: "mahuagui",
          },
          {
            name: "hanime1",
            value: "hanime1",
          }
        )
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("id")
        .setDescription("作品或作者的id或名稱")
        .setRequired(true)
    ),
  defer: true,
  ephemeral: true,

  async execute(interaction) {
    const webside = interaction.options.getString("webside", true);
  },
});
