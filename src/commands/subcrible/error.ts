import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';

import logger from '@/class/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const addFileError = async (interaction: ChatInputCommandInteraction, message: string, ...args: any[]) => {
  const embed = new EmbedBuilder()
    .setTitle(message)
    .setDescription(JSON.stringify(args, null, 2))
    .setFooter({ text: 'kun-kun-bot with ts' });

  await interaction.editReply({
    embeds: [embed],
  });

  logger.error(message, args);
};
