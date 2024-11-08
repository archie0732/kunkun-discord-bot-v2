import { readFileSync } from 'fs';
import { resolve } from 'path';
import { scheduleJob } from 'node-schedule';
import { Colors, EmbedBuilder, Events } from 'discord.js';
import { R7EventHandler } from '@/class/events';

export default new R7EventHandler({
  event: Events.ClientReady,
  async on(client) {
    const Data: Schedule[] = JSON.parse(readFileSync(resolve('resource', 'cache', 'schedule.json'), 'utf-8'));
    Data.forEach((plan) => {
      scheduleJob(`${plan.time.min} ${plan.time.hr} * * ${plan.repeatDate}`, async () => {
        const channel = client.channels.cache.get(plan.detail.channel);
        if (!channel?.isSendable()) return;
        await channel.send({ embeds: [Embed(plan.detail)] });
      });
    });
  },
});

const Embed = (options: Schedule['detail']) =>
  new EmbedBuilder().setTitle(options.title)
    .setDescription(`- 創建者: ${options.owner}\n${options.description}`)
    .setTimestamp()
    .setColor(Colors.Blue)
    .setURL(options.imageURL);

interface Schedule {
  time: {
    hr: string;
    min: string;
  };
  repeatDate: string;
  detail: {
    owner: string;
    title: string;
    description: string;
    imageURL: string;
    guild: string;
    channel: string;
  };
}
