import { EmbedBuilder, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption } from '@discordjs/builders';
import { Colors } from 'discord.js';
import { R7Command } from '@/class/commands';
import { resolve } from 'path';
import { existsSync, writeFileSync } from 'fs';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('daily_sign').setNameLocalization('zh-TW', '設置每日簽到')
    .setDescription('設置伺服器簽到').addStringOption(
      new SlashCommandStringOption().setName('title').setDescription('簽到主題').setRequired(true))
    .addChannelOption(
      new SlashCommandChannelOption().setName('channel').setDescription('channel').setRequired(true)),
  defer: false,
  ephemeral: true,
  async execute(interaction) {
    const title = await interaction.options.getString('title', true);
    const channel = await interaction.options.getChannel('channel');

    if (!channel || !channel.isSendable()) {
      interaction.reply('選擇發送頻道錯誤');
    }

    const filePath = resolve('.cache', 'guild', `${interaction.channelId}.json`);

    if (existsSync(filePath)) {
      interaction.reply('這個頻道已經有設置簽到活動了');
    }

    const builder = {
      guild: interaction.guildId,
      channel: channel!.id,
      title: title,
      member: [],
    };

    writeFileSync(filePath, JSON.stringify(builder, null, 2), 'utf-8');

    interaction.reply({
      embeds: [new EmbedBuilder().setTitle(`已經成功設置每日簽到!`).setDescription(title).setColor(Colors.Blue)],
    });
  },
});
