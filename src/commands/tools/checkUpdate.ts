import { hanime1A } from "@/api/hanime1/hanime1_a";
import nhentai from "@/notification/nhentai";
import type { ExtendedClient } from "@/types/ExtendedClient";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import manhuagui from "@/api/manhuagui";

export default {
  data: new SlashCommandBuilder()
    .setName("check_update")
    .setNameLocalization("zh-TW", "檢查訂閱更新")
    .setDescription("除錯用 - 檢查您訂閱的內伺服器訂閱內容是否有更新"),

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    try {
      // Step 1: Check hanime1A updates
      await interaction.reply({ content: "正在檢查 hanime1A 更新...", ephemeral: true });
      try {
        await hanime1A(client);
      } catch (error) {
        console.error(`[hanime1A update error] - ${error}`);
        await interaction.followUp({ content: "檢查 hanime1A 更新時發現錯誤", ephemeral: true });
      }

      // Step 2: Check nhentai updates
      await interaction.followUp({ content: "正在檢查 nhentai 更新...", ephemeral: true });
      try {
        await nhentai.checkup(client);
      } catch (error) {
        console.error(`[nhentai update error] - ${error}`);
        await interaction.followUp({ content: "檢查 nhentai 更新時發現錯誤", ephemeral: true });
      }

      // Step 3: Check manhuagui updates
      await interaction.followUp({ content: "正在檢查 manhuagui 更新...", ephemeral: true });
      try {
        await manhuagui.checkUpdateManhuagui(client);
      } catch (error) {
        console.error(`[manhuagui update error] - ${error}`);
        await interaction.followUp({ content: "檢查 manhuagui 更新時發現錯誤", ephemeral: true });
      }

      // Final success message
      await interaction.followUp({ content: "所有訂閱更新檢查完畢，未發現錯誤。", ephemeral: true });
    } catch (generalError) {
      console.error(`[check update error] - ${generalError}`);
      await interaction.reply({
        content: "檢查更新時發現錯誤",
        ephemeral: true,
      });
    }
  },
};
