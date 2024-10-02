import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import nhentai from "@/api/nhentai";

import type { local_subscribe } from "@/types/subData";
import type { Command } from "..";
import logger from "@/utils/logger";

interface archieCache {
  id: string;
  type: string;
  name: string;
  url: string;
  count: number;
}

export default {
  data: new SlashCommandBuilder()
    .setName(`sub_nhentai`)
    .setNameLocalization("zh-TW", "訂閱nhentai")
    .setDescription(`訂閱 nhentai 作者，當有新作時發出通知`)
    .addStringOption(
      new SlashCommandStringOption()
        .setName("artist")
        .setDescription("作者名稱")
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("language")
        .setDescription("避免重複通知相同本子")
        .setChoices(
          { name: "中文", value: "chinese" },
          { name: "英文", value: "english" },
          { name: "日文", value: "japanese" }
        )
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, _) {
    if (!interaction.inCachedGuild()) return;

    const artist = interaction.options
      .getString("artist", true)
      .replaceAll(" ", "-");
    const language = interaction.options.getString("language", true);

    const filePath = `./resource/nhentai/${interaction.guild.id}.json`;

    let localData: local_subscribe;

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      localData = {
        guild: interaction.guild.id,
        channel: interaction.channelId,
        sub: [],
      };
    } else {
      localData = await file.json();
    }

    try {
      if (localData.sub.some((val) => val.name === artist)) {
        await interaction.reply({
          content: `你已經訂閱過 ${artist}`,
          ephemeral: true,
        });
        logger.warn(
          `[nhentai] ${interaction.user.displayName} 重複訂閱 ${artist}`
        );
        return;
      }

      const cachePath = `./resource/cache/nhentai/${artist}.json`;
      const cacheFile = Bun.file(cachePath);
      let tagID;

      if (!(await cacheFile.exists())) {
        const doujinList = await nhentai.fetchSearch(artist);
        tagID = doujinList.fetchTagID().id.toString();
        const doujin = doujinList.fetchTagID();
        const archiecache = {
          id: doujin.id.toString(),
          name: doujin.name,
          type: doujin.type,
          url: doujin.url,
          count: doujin.count,
        };

        await Bun.write(cacheFile, JSON.stringify(archiecache, null, 2));
      } else {
        const doujinList: archieCache = await cacheFile.json();
        tagID = doujinList.id;
      }

      const doujin = await nhentai.getLastTagAPI(tagID);

      localData.sub.push({
        name: artist,
        id: tagID,
        status: language,
        last_up: doujin.title.pretty,
        other: `https://nhentai.net/g/${doujin.id}`,
      });

      await Bun.write(file, JSON.stringify(localData, null, 2));

      await interaction.reply({
        content: `已經將 ${artist} 加入訂閱列表`,
        ephemeral: true,
      });
      logger.info(`[nhentai] ${interaction.guildId} sub ${artist}`);
    } catch (error) {
      throw `[nhnetai]${error}`;
    }
  },
} as Command;
