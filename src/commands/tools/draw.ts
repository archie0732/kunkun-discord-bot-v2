import {
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
} from "discord.js";

import type { Command } from "..";

export default {
  data: new SlashCommandBuilder()
    .setName(`draw2486`)
    .setNameLocalization(`zh-TW`, "抽取2486")
    .setDescription(`抽在群組的一人(不包含機器人)`)
    .setNameLocalization(`zh-CN`, "抽取-2486")
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName("tag")
        .setDescription("是否要標記被抽中的人，預設為false")
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    if (!interaction.inCachedGuild()) return;

    const shouldMentionMember = interaction.options.getBoolean("tag");

    const member = await interaction.guild.members.fetch();
    const nonBotMembers = member.filter((member) => !member.user.bot);

    if (!nonBotMembers.size) {
      await interaction.reply({
        content: `伺服器沒有人`,
        ephemeral: true,
      });
      return;
    }

    const randomMember = nonBotMembers.random()!;

    const drawCommandId = interaction.client.application.commands.cache.findKey(
      (command) => command.name == "draw2486"
    )!;

    const drawMention = `</draw2486:${drawCommandId}>`;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.user?.displayName} - 被乙骨操作的機器人: 抽籤! 啟動`,
        iconURL: client.user?.displayAvatarURL(),
      })
      .setTitle(`${randomMember?.user.displayName}! 羅傑說你是阿斯芭樂`)
      .setURL(`https://youtu.be/dQw4w9WgXcQ?si=aZ1j3MepifHFAfKY`)
      .setDescription(`- 使用 ${drawMention} 來抽取下一位阿斯芭樂吧!`)
      .setImage(`https://numeroscop.net/img/numbers/numerology/angel/2486.png`)
      .setThumbnail(
        randomMember.user.displayAvatarURL() ||
          "https://memeprod.sgp1.digitaloceanspaces.com/user-template/48af98fc5cf6e34cf90c46adeb6e0ce5.png"
      )
      .setFooter({
        text: `archie0732's kunkun-bot v2 with ts`,
      });

    await interaction.reply({
      content: `${randomMember} 你被抽中了!`,
      embeds: [embed],
      options: {
        allowedMentions: {
          parse: [],
          users: shouldMentionMember ? [randomMember.id] : [],
        },
      },
    });
  },
} as Command;
