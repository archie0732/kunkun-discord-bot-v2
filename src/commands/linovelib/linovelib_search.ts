import type { NovelDetail } from "@/api/linovelib/interface";
import { novelDetail } from "@/api/linovelib/novelDetail";
import { novelSearch } from "@/api/linovelib/search";
import { noveURL } from "@/api/linovelib/utils";
import { R7Command } from "@/class/commands";
import { discordDescription } from "@/utils/const";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('linovelib_search')
    .setNameLocalization('zh-TW', '小說搜尋')
    .setDescription('Search for a novel on linovelib')
    .setDescriptionLocalization('zh-TW', '在 bilili 輕小說 上搜尋小說')
    .addStringOption(new SlashCommandStringOption()
      .setName('keyword')
      .setNameLocalization('zh-TW', '關鍵字')
      .setDescription('The keyword to search for')
      .setDescriptionLocalization('zh-TW', '要搜尋的關鍵字, 請稍微等待一下搜尋結果')
      .setRequired(true).setAutocomplete(true)
    ),
  defer: false,
  ephemeral: false,

  async execute(interaction) {
    const id = interaction.options.getString('keyword', true);

    if (id === "-1" || Number.isNaN(Number(id)) || id === "-2") {
      await interaction.deferReply({ flags: 1 << 6 });
      await interaction.editReply({
        content: "請等待autocomplete結果，點擊選項",
        files: [{
          attachment: 'data/img/001.png',
          name: '001.png'
        }]
      })
      return;
    }

    await interaction.deferReply();
    try {
      const novel = await novelDetail(id);
      await interaction.editReply({
        content: `這是您搜尋的結果: [${novel.title}](${noveURL(novel.id)})`,
        embeds: [embedbuilder(novel)],
        components: [buttonbuilder(novel)]
      })

    } catch (error) {
      await interaction.editReply({
        content: "發生錯誤，請稍後再試"
      })
    }
  },

  async onAutocomplete(interaction) {
    let keyword = interaction.options.getString('keyword', true);

    if (keyword === "") {
      keyword = '鄰座'
    }

    try {

      const results = await novelSearch(keyword, 1);
      if (results.length === 0) {
        return [{
          name: "找不到任何結果",
          value: "-1"
        }]
      }

      return results.map(result => ({
        name: result.title,
        value: result.id
      }))
    } catch (error) {
      return [{
        name: "發生錯誤",
        value: "-2"
      }]
    }


  }

})



const embedbuilder = (novel: NovelDetail) => {
  return new EmbedBuilder()
    .setTitle(novel.title)
    .setDescription(novel.description)
    .setThumbnail(novel.cover)
    .setColor('Random')
    .setURL(noveURL(novel.id))
    .setTimestamp(Date.now())
    .addFields(
      {
        name: "✒️作者",
        value: novel.author,
        inline: true
      },
      {
        name: "🔍標籤",
        value: novel.tags.join(', '),
        inline: true
      },
      {
        name: "📚更新時間",
        value: `${novel.updateTime}, 更新至${novel.updateChapter}`,
      },
    ).setFooter({
      text: discordDescription.footer,
    })
}

const buttonbuilder = (novel: NovelDetail) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('在dicord觀看小說')
      .setCustomId(`linovelib_search:discord_read-${novel.id}`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel('前往網頁看小說')
      .setURL(noveURL(novel.id))
      .setStyle(ButtonStyle.Link)
  )
}
