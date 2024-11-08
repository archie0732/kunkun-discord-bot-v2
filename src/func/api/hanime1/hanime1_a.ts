import { EmbedBuilder } from 'discord.js';
import { R7Client } from '@/class/client';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { hanime1_fetch } from './hanime1_fetch';
import { join } from 'path';

import chalk from 'chalk';

import type { Channel } from 'discord.js';
import type { Hanime1 } from './hanime1_fetch';
import type { local_subscribe } from '@/func/types/subData';
import logger from '@/class/logger';

export async function hanime1A(client: R7Client) {
  const folderPath = `./resource/hanime1`;
  const folder = readdirSync(folderPath);
  for (const file of folder) {
    const filePath = join(folderPath, file);

    const localData: local_subscribe = JSON.parse(
      readFileSync(filePath, 'utf-8'),
    );
    const channel = await client.channels.fetch(localData.channel);
    let flag: boolean = false;
    for (const entry of localData.sub) {
      try {
        const hanime1 = await hanime1_fetch(entry.name!);
        if (hanime1.id !== entry.id) {
          console.log(
            chalk.blue(`[hanime1]${hanime1.tag} new upload - ${hanime1.title}`),
          );
          await sendMessage(client, channel!, hanime1);
          entry.last_up = hanime1.title;
          entry.id = hanime1.id;
          flag = true;
        }
      }
      catch (error) {
        console.error(chalk.red(`[hanime1]${error}`));
      }
    }
    if (flag) {
      writeFileSync(filePath, JSON.stringify(localData, null, 2), 'utf-8');
      console.log(chalk.blue(`[hanime1]${file} - 檔案寫入成功`));
    }
  }
}

async function sendMessage(
  client: R7Client,
  channel: Channel,
  hanime1: Hanime1,
) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${client.user?.tag} - 被乙骨操作的機器人`,
      iconURL: client.user?.displayAvatarURL(),
    })
    .setTitle(`[${hanime1.tag}]${hanime1.title}`)
    .setURL(hanime1.video_url)
    .setDescription(
      `- 使用 </sub_hanime1:1268195537287381024> 訂閱更多作者或標籤\n- 或是用 </rm_hanime1:1268195537287381023> 來取消訂閱`,
    )
    .setThumbnail(`https://www.iconsdb.com/icons/preview/red/letter-h-xxl.png`)
    .addFields(
      {
        name: `🛜 原網站`,
        value: `[hanime](https://hanime1.me/)`,
        inline: true,
      },
      {
        name: `🔍 作者 / 發行商`,
        value: `${hanime1.artist}`,
        inline: true,
      },
      {
        name: `🆔 作品id`,
        value: `${hanime1.id}`,
        inline: true,
      },
    )
    .setImage(hanime1.cover_url)
    .setTimestamp(Date.now())
    .setFooter({
      text: `archie0732's kunkun-bot v2 with TypeScript`,
    });

  try {
    if (channel && channel.isSendable()) {
      await channel.send({
        content: `您在 [hanime1] 訂閱的 [${
          hanime1.tag
        }](https://hanime1.me/search?query=${hanime1.tag.replace(
          / /g,
          '%20',
        )}) 更新了 [${hanime1.title}](${hanime1.video_url})`,
        embeds: [embed],
      });
    }
    else {
      throw `[hanime1]找不到channel`;
    }
  }
  catch (error) {
    logger.error('hanime1 fetch error', error);
  }
}
