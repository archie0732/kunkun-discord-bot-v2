import { R7Command } from '@/class/commands';
import logger from '@/class/logger';
import { discordBotURL, localSaveImage } from '@/utils/const';
import {
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName(`draw`)
    .setNameLocalization(`zh-TW`, '抽群組成員')
    .setDescription(`抽在群組的一人(不包含機器人)`)
    .addStringOption(
      new SlashCommandStringOption().setName('title').setNameLocalization('zh-TW', '標題')
        .setDescription('set title').setDescriptionLocalization('zh-TW', '設置標題'),
    )
    .addStringOption(
      new SlashCommandStringOption().setName('image').setNameLocalization('zh-TW', '圖片')
        .setDescription('the image type just for jpg or png').setDescriptionLocalization('zh-TW', '圖片檔只收 jpg 或 png'),
    )
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName('tag')
        .setDescription('是否要標記被抽中的人，預設為false'),
    ),
  defer: true,
  ephemeral: false,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      logger.error('nmsl');
      return;
    }

    try {
      const shouldMentionMember = interaction.options.getBoolean('tag') ?? false;
      const title = interaction.options.getString('title') ?? '被抽到怎麼不找找自己的問題';
      const image = interaction.options.getString('image') ?? localSaveImage.find_u_problem;

      const member = await interaction.guild.members.fetch();
      const nonBotMembers = member.filter((member) => !member.user.bot);

      if (!nonBotMembers.size) {
        await interaction.editReply({ content: `伺服器沒有人` });
        return;
      }

      const randomMember = nonBotMembers.random()!;
      const drawCommandId = interaction.client.application.commands.cache.findKey(
        (command) => command.name === 'draw2486',
      );

      const drawMention = drawCommandId ? `</draw2486:${drawCommandId}>` : '`draw2486`';

      const embed = new EmbedBuilder()
        .setTitle(`${randomMember.user.displayName}, ${title}`)
        .setURL(discordBotURL.rickroll)
        .setDescription(`- 使用 ${drawMention} 來抽取下一位成員`)
        .setImage(image)
        .setThumbnail(randomMember.user.displayAvatarURL())
        .setFooter({ text: discordBotURL.rickroll });

      await interaction.editReply({
        content: `${randomMember} 你被抽中了!`,
        embeds: [embed],
        allowedMentions: {
          parse: [],
          users: shouldMentionMember ? [randomMember.id] : [],
        },
      });
    }
    catch (err) {
      console.error(err);
      await interaction.editReply({ content: `⚠️ 出錯了：${err}` });
    }
  },

});
