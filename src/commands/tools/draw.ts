import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { ExtendedClient } from "@/types/ExtendedClient";

import chalk from "chalk";

export default {
  data: new SlashCommandBuilder()
    .setName(`draw2486`)
    .setNameLocalization(`zh-TW`, "抽取2486")
    .setDescription(`抽在群組的一人(不包含機器人)`)
    .setNameLocalization(`zh-CN`, "抽取-2486"),

  async execute(
    interaction: ChatInputCommandInteraction,
    client: ExtendedClient
  ) {
    const member = await interaction.guild?.members.fetch();

    if (!member) {
      await interaction.reply({
        content: `抓取錯誤`,
        ephemeral: true,
      });
      console.log(chalk.red(`${interaction.user.displayName} - 抓取資料`));
      return;
    }

    const nonBotMembers = member.filter((member) => !member.user.bot);

    if (nonBotMembers.size === 0) {
      await interaction.reply({
        content: `伺服器沒有人`,
        ephemeral: true,
      });
      console.log(
        chalk.red(`[kunkun-bot v2]${interaction.user.displayName} - 伺服器沒人`)
      );
      return;
    }

    const randonMember = member.random();

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.user?.displayName} - 被乙骨操作的機器人: 抽籤! 啟動`,
        iconURL: client.user?.displayAvatarURL(),
      })
      .setTitle(`${randonMember?.user.displayName}! 羅傑說你是阿斯芭樂`)
      .setURL(`https://youtu.be/dQw4w9WgXcQ?si=aZ1j3MepifHFAfKY`)
      .setDescription(
        `- 使用</draw2486:1268093679214657587> 來抽取下一位阿斯芭樂吧!`
      )
      .setImage(`https://numeroscop.net/img/numbers/numerology/angel/2486.png`)
      .setThumbnail(
        randonMember?.user.displayAvatarURL() ||
          "https://memeprod.sgp1.digitaloceanspaces.com/user-template/48af98fc5cf6e34cf90c46adeb6e0ce5.png"
      )
      .setFooter({
        text: `archie0732's kunkun-bot v2 with TypeScript`,
      });

    await interaction.reply({
      content: `<@${randonMember?.user.id}> 你被抽中了!`,
      embeds: [embed],
    });
  },
};
