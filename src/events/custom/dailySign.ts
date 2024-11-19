import { Colors, EmbedBuilder, Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';

import { join, resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { getNowDate } from '@/utils/getNowTime';

export default new R7EventHandler({
  event: Events.MessageCreate,
  async on(message) {
    if (message.author.bot) return;

    const deskPath = resolve('.cache', 'guild');
    const desk = readdirSync(deskPath);

    if (!desk.includes(message.channelId + '.json')) {
      return;
    }
    // logger.debug(message.content);

    const data = JSON.parse(readFileSync(join(deskPath, message.channelId + '.json'), 'utf-8')) as DailySign;
    const todayDate = getNowDate();
    let memberIndex = data.member.findIndex((a) => a.userId === message.author.id);

    if (memberIndex === -1) {
      data.member.push({
        userId: message.author.id.toString(),
        signDay: 1,
        lastSign: todayDate,
      });
      memberIndex = data.member.length - 1;
    }
    else {
      const member = data.member[memberIndex];
      if (member.lastSign === todayDate) {
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      if (member.lastSign === yesterdayDate) {
        member.signDay += 1;
      }
      else {
        member.signDay = 1;
      }

      member.lastSign = todayDate;
    }

    const day = data.member[memberIndex].signDay;
    writeFileSync(join(deskPath, message.channelId + '.json'), JSON.stringify(data, null, 2), 'utf-8');

    message.author.send({
      embeds: [new EmbedBuilder().setTitle('你完成了今天的簽到!')
        .setDescription(`- 活動: ${data.title}\n- 今天是你連續簽到的第 ${day} 天!`)
        .setImage(data.image).setColor(Colors.Blue)
        .setFooter({ text: 'archie0732 bot with typescript' }),
      ],
    });

    if (data.member[memberIndex].signDay % 5 === 0) {
      message.reply({
        embeds: [new EmbedBuilder().setTitle(`${message.member?.displayName} 連續簽到 ${day} 天!!!`)
          .setDescription(`**${message.author}** 恭喜你連續簽到 ${day} 天\n- 活動: ${data.title}\n- 哥布林一起強大!!!!!`)
          .setThumbnail(this.user!.displayAvatarURL())
          .setImage(data.image).setColor(Colors.Blue)
          .setFooter({ text: 'archie0732 bot with typescript' }),
        ],
      });
    }
  },
});

interface DailySign {
  guild: string;
  channel: string;
  title: string;
  image: string;
  member: {
    userId: string;
    signDay: number;
    lastSign: string;
  }[];
}
