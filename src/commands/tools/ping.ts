import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "@/types/ExtendedClient";

import logger from "@/utils/logger";

export default {
  data: new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`檢測機器人延遲`),

  async execute(
    interaction: ChatInputCommandInteraction,
    client: ExtendedClient
  ) {
    try {
      await interaction.deferReply({ fetchReply: true });
      const message = await interaction.fetchReply();

      const sendMessage = `🔍 API Latency: ${
        client.ws.ping
      }ms\n🛜 Client Ping: ${
        message.createdTimestamp - interaction.createdTimestamp
      }ms`;

      await interaction.editReply({
        content: sendMessage,
      });
    } catch (error) {
      logger.error(`[kunkun]ping error`, error);
    }
  },
};
