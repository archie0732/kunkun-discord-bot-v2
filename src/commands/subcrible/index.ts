import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import { R7Command } from '@/class/commands';

import logger from '@/class/logger';
import nhentai from '@/func/api/nhentai';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('subscribe')
    .setNameLocalization('zh-TW', '訂閱')
    .setDescription('目前支援nhentai, 漫畫櫃, hanime1')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('website')
        .setDescription('網站')
        .addChoices(
          {
            name: 'nhentai',
            value: 'nhentai',
          },
          {
            name: '看漫畫',
            value: 'mahuagui',
          },
          {
            name: 'hanime1',
            value: 'hanime1',
          },
        )
        .setRequired(true),
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('id')
        .setDescription('作品或作者的id或名稱')
        .setRequired(true),
    ),

  defer: true,
  ephemeral: true,

  async execute(interaction) {
    const website = interaction.options.getString('website', true);

    const id = interaction.options.getString('id', true);

    switch (website) {
      case 'nhentai':
        try {
          const doujin = await nhentai.getLastTagAPI(id);
          await interaction.editReply({
            content: doujin.title.japanese,
          });
        }
        catch (error) {
          logger.error(`Error happen when add ${id} in database`, error);
        }
        break;
      case 'manhuagui':

        break;
      case 'hanime1':

        break;
      default:
        logger.error('bot cannot support this website');
        interaction.editReply({
          content: '😢 bot cannot support this website',
        });
        break;
    }
  },
});
