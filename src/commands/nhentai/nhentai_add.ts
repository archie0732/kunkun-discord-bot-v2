import nhentai from "@/api/nhentai";
import chalk from "chalk";

import { ExtendedClient } from "@/types/ExtendedClient";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

import type { local_subscribe } from "@/types/subData";


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
    .setDescription(`訂閱nhentai作者，當有新作時發出通知`)
    .addStringOption(new SlashCommandStringOption().setName("artist").setDescription("作者名稱").setRequired(true))
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
    ),

  async execute(interaction: ChatInputCommandInteraction, _: ExtendedClient) {
    if (!interaction.guildId) throw `cannot use this command in there`;

    const artist = interaction.options.getString("artist", true).replaceAll(" ", "-");
    const filePath = `./resource/nhentai/${interaction.guildId}.json`;
    const language = interaction.options.getString("language") || "chinese";

    let localData: local_subscribe;
    if (!existsSync(filePath)) {
      localData = {
        guild: interaction.guildId!,
        channel: interaction.channelId,
        sub: [],
      };
    } else {
      localData = JSON.parse(readFileSync(filePath, "utf-8"));
    }
    try {
      if (localData.sub.some((val) => val.name === artist)) {
        await interaction.reply({
          content: `你已經訂閱過${artist}`,
          ephemeral: true,
        });
        console.warn(chalk.red(`[nhentai]${interaction.user.displayName} 重複訂閱${artist}`));
        return;
      }
      const cachePath = `./resource/cache/nhentai/${artist}.json`;
      let tagID;
      if (!existsSync(cachePath)) {
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
        writeFileSync(cachePath, JSON.stringify(archiecache, null, 2), "utf-8");
      } else {
        const doujinList: archieCache = JSON.parse(readFileSync(cachePath, "utf-8"));
        tagID = doujinList.id;
      }
      const doujin = await nhentai.getLastTagAPI(tagID);

      localData.sub.push({
        name: artist,
        id: tagID,
        status: language,
        last_up: doujin.title.pretty,
        other: "https://nhentai.net/g/" + doujin.id.toString(),
      });
      writeFileSync(filePath, JSON.stringify(localData, null, 2), "utf-8");
      await interaction.reply({
        content: `已經將${artist}加入訂閱列表`,
        ephemeral: true,
      });
      console.log(chalk.green(`[nhentai]${interaction.guildId} sub ${artist}`));
    } catch (error) {
      throw `[nhnetai]${error}`;
    }
  },
};
