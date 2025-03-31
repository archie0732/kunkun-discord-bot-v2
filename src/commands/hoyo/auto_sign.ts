import { R7Command } from '@/class/commands';
import { discordDescription, disocrdPath } from '@/utils/const';
import { CreateUserData } from '@/utils/createUserData';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption, StringSelectMenuBuilder } from 'discord.js';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

import logger from '@/class/logger';

import type { CacheUser } from '@/types/cache';
import type { AnySelectMenuInteraction, ButtonInteraction } from 'discord.js';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('hoyolab-auto-sign')
    .setNameLocalization('zh-TW', 'hoyolab自動簽到')
    .setDescription('透過機器自動簽到hoyolab')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('ltoken_v2').setDescription('輸入你在hoyolab的 ltoken_v2').setAutocomplete(true)
        .setRequired(true),
    ).addStringOption(
      new SlashCommandStringOption()
        .setName('ltuid_v2').setDescription('輸入你在hoyolab的 ltuid_v2').setAutocomplete(true)
        .setRequired(true)),

  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const ltoken = interaction.options.getString('ltoken_v2', true);
    const ltuid = interaction.options.getString('ltuid_v2', true);

    if (ltoken === 'help' || ltuid === 'help') {
      // TO DO add helper to get token
      await interaction.editReply({
        content: '[discordbot]/hoyolab-auto-sign 尚未輸入token',
      });
      return;
    }

    const response = CreateUserData(interaction);

    if (response == -1) {
      logger.error('[discordbot]/hoyolab-auto-sign create user account error');
      await interaction.editReply({
        content: '用戶id創立時發生問題，請稍等作者修復問題',
      });
      return;
    }

    updateToken(interaction.user.id, ltoken, ltuid);

    const button = new ButtonBuilder().setCustomId('hoyolab-auto-sign:save-token').setLabel('不變更').setStyle(ButtonStyle.Primary);

    const selectmenu = new StringSelectMenuBuilder().setCustomId('hoyolab-auto-sign:game-select')
      .setMinValues(1).setMaxValues(4)
      .setOptions([{
        label: '原神',
        value: 'Genshin',
      },
      {
        label: '崩鐵',
        value: 'Star_Rail',
      },
      {
        label: '崩壞3',
        value: 'Honkai_3',
      },
      {
        label: '絕區零',
        value: 'Zenless_Zone_Zero',
      },
      ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectmenu);
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await interaction.editReply({
      content: '已經將token設定完成，如果有需要更改簽到遊戲請按下方按鈕。已經有設定過的可以忽略此訊息',
      components: [row, row2],
      flags: 1 << 6,
    });
  },

  async onButton(interaction, buttonId) {
    if (buttonId !== 'save-token') {
      return;
    }

    const data = JSON.parse(readFileSync(join(disocrdPath.user, `${interaction.user.id}.json`), 'utf-8')) as CacheUser;

    await interaction.editReply({
      content: `已經設定完成！自動簽到會於明日啟動！`,
      embeds: [embedbuilder(data, interaction)],
      components: [],
    });
  },

  async onSelectMenu(interaction, menuId) {
    logger.debug('get select', menuId);
    if (menuId !== 'game-select') return;

    const value = interaction.values;

    const data = JSON.parse(readFileSync(join(disocrdPath.user, `${interaction.user.id}.json`), 'utf-8')) as CacheUser;

    for (const option of value) {
      if (option === 'Genshin') {
        data.hoyoAutoSign.game.Genshin = true;
      }
      else if (option === 'Star_Rail') {
        data.hoyoAutoSign.game.Star_Rail = true;
      }
      else if (option === 'Honkai_3') {
        data.hoyoAutoSign.game.Honkai_3 = true;
      }
      else {
        data.hoyoAutoSign.game.Zenless_Zone_Zero = true;
      }
    }

    writeFileSync(join(disocrdPath.user, `${interaction.user.id}.json`), JSON.stringify(data, null, 2), 'utf-8');

    logger.info(`[discordbot]have update game options from ${interaction.user.id}.json`);

    await interaction.editReply({
      content: '已經設定完成！自動簽到會於明日啟動！',
      embeds: [embedbuilder(data, interaction)],
      components: [],
    });
  },

  onAutocomplete() {
    // const toekn = interaction.options.getFocused(true);

    return [
      {
        name: '我不知道怎麼取得token',
        value: 'help',
      },
    ];
  },
});

const updateToken = (userId: string, ltoken: string, ltuid_v2: string) => {
  const token = `ltoken_v2=${ltoken}; ltuid_v2=${ltuid_v2}`;

  const data = JSON.parse(readFileSync(join(disocrdPath.user, `${userId}.json`), 'utf-8')) as CacheUser;

  data.hoyoAutoSign.token = token;

  writeFileSync(join(disocrdPath.user, `${userId}.json`), JSON.stringify(data, null, 2), 'utf-8');

  logger.info(`[discordbot]have update token from ${userId}.json`);
};

const embedbuilder = (game: CacheUser, interaction: AnySelectMenuInteraction | ButtonInteraction) => {
  return new EmbedBuilder().setAuthor({
    name: interaction.user.displayName,
    iconURL: interaction.user.displayAvatarURL(),
  }).setTitle(`🥳 恭喜你已經完成自動簽到設定！`).setThumbnail(interaction.user.displayAvatarURL())
    .setDescription('🐔 自動簽到將會於明天開始執行～')
    .setFields([{
      name: '- Genshin',
      value: game.hoyoAutoSign.game.Genshin === true ? '✅ 設定完成' : '🙈 未設定',
      inline: true,
    },
    {
      name: '- Star Rail',
      value: game.hoyoAutoSign.game.Star_Rail === true ? '✅ 設定完成' : '🙈 未設定',
      inline: true,

    },
    {
      name: '- Honkai 3',
      value: game.hoyoAutoSign.game.Honkai_3 === true ? '✅ 設定完成' : '🙈 未設定',
      inline: true,

    },
    {
      name: '- Zenless Zone Zero',
      value: game.hoyoAutoSign.game.Zenless_Zone_Zero === true ? '✅ 設定完成' : ' 🙈 未設定',
      inline: true,
    },
    ]).setFooter({ text: discordDescription.footer });
};
