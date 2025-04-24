import type { NovelChapter, NovelContent } from "@/api/linovelib/interface";
import { novelChapter } from "@/api/linovelib/novelDetail";
import { novelView } from "@/api/linovelib/novelView";
import { novelSearch } from "@/api/linovelib/search";
import { R7Command } from "@/class/commands";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, SlashCommandStringOption, StringSelectMenuBuilder, TextChannel } from "discord.js";

let chapterList: NovelChapter[] = [];
let content: NovelContent;
let currentNovelId: string | null = null;

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('linovelib_view')
    .setNameLocalization('zh-TW', '小說觀看')
    .setDescription('View a novel on linovelib')
    .setDescriptionLocalization('zh-TW', '在 discord 上觀看輕小說')
    .addStringOption(new SlashCommandStringOption()
      .setName('keyword')
      .setNameLocalization('zh-TW', '小說名稱')
      .setDescription('The keyword to search for')
      .setDescriptionLocalization('zh-TW', '要觀看的小說名稱, 請稍微等待一下搜尋結果')
      .setRequired(true).setAutocomplete(true)
    ).addStringOption(new SlashCommandStringOption()
      .setName('chapter')
      .setNameLocalization('zh-TW', '卷數')
      .setDescription('The chapter to search for')
      .setDescriptionLocalization('zh-TW', '要觀看的卷數, 請稍微等待一下搜尋結果')
      .setRequired(true).setAutocomplete(true))
    .addStringOption(new SlashCommandStringOption()
      .setName('vol')
      .setNameLocalization('zh-TW', '章節名稱')
      .setDescription('The vol to search for')
      .setDescriptionLocalization('zh-TW', '要觀看的章節名稱, 請稍微等待一下搜尋結果')
      .setRequired(true).setAutocomplete(true)),
  defer: false,
  ephemeral: false,

  async execute(interaction) {
    const id = interaction.options.getString('keyword', true);
    const chapterIndex = parseInt(interaction.options.getString('chapter', true));
    const volIndex = parseInt(interaction.options.getString('vol', true));

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
      chapterList = await novelChapter(id);
      const chapter = chapterList[chapterIndex];
      content = await novelView(chapter.vol[volIndex].url);

      const { curContent, row } = linovelBuilder(content, 0);

      await interaction.editReply({
        content: curContent,
        components: [row]
      });

    } catch (error) {
      await interaction.editReply({
        content: "發生錯誤，請稍後再試"
      })
    }
  },

  async onAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const keyword = interaction.options.getString('keyword');
    const chapter = interaction.options.getString('chapter');

    if (focusedOption.name === 'keyword') {
      // 處理小說名稱的 autocomplete
      if (focusedOption.value === "") {
        return [{
          name: "請輸入小說名稱",
          value: "-1"
        }]
      }

      try {
        const results = await novelSearch(focusedOption.value, 1);
        if (results.length === 0) {
          return [{
            name: "找不到任何結果",
            value: "-1"
          }]
        }

        return results.slice(0, 25).map(result => ({
          name: result.title,
          value: result.id
        }))
      } catch (error) {
        return [{
          name: "發生錯誤",
          value: "-2"
        }]
      }
    } else if (focusedOption.name === 'chapter') {
      // 處理卷數的 autocomplete
      if (!keyword || keyword === "-1" || keyword === "-2") {
        return [{
          name: "請先選擇小說",
          value: "-1"
        }]
      }

      try {
        if (!chapterList || chapterList.length === 0 || currentNovelId !== keyword) {
          chapterList = await novelChapter(keyword);
          currentNovelId = keyword;
        }

        return chapterList.slice(0, 25).map((chapter, index) => ({
          name: `${index + 1}. ${chapter.chapterTitle}`,
          value: index.toString()
        }));
      } catch (error) {
        return [{
          name: "發生錯誤",
          value: "-2"
        }]
      }
    } else if (focusedOption.name === 'vol') {
      // 處理章節名稱的 autocomplete
      if (!keyword || !chapter || keyword === "-1" || keyword === "-2" || chapter === "-1" || chapter === "-2") {
        return [{
          name: "請先選擇小說和卷數",
          value: "-1"
        }]
      }

      try {
        if (!chapterList || chapterList.length === 0 || currentNovelId !== keyword) {
          chapterList = await novelChapter(keyword);
          currentNovelId = keyword;
        }

        const chapterIndex = parseInt(chapter);
        if (isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapterList.length) {
          return [{
            name: "無效的卷數",
            value: "-1"
          }]
        }

        return chapterList[chapterIndex].vol.slice(0, 25).map((vol, index) => ({
          name: `${index + 1}. ${vol.title}`,
          value: index.toString()
        }));
      } catch (error) {
        return [{
          name: "發生錯誤",
          value: "-2"
        }]
      }
    }

    return [];
  },

  async onButton(interaction, buttonId) {
    try {
      // 立即回應交互，防止超時
      await interaction.deferUpdate()

      if (content === undefined) {
        await interaction.followUp({
          content: '操作逾時，請重新使用指令',
          flags: 1 << 6
        });
        return;
      }


      if (buttonId.includes('prev_page')) {
        // 上一頁按鈕
        const index = parseInt(buttonId.split('-')[1]);

        if (index > 0) {
          const { curContent, row } = linovelBuilder(content, index - 1);

          await interaction.editReply({
            content: curContent,
            components: [row]
          });
        }
        else {
          content = await novelView(content.prevChapter);
          const { curContent, row } = linovelBuilder(content, 0);

          await interaction.editReply({
            content: curContent,
            components: [row]
          });
        }

      } else if (buttonId.includes('next_page')) {
        // 下一頁按鈕
        const index = parseInt(buttonId.split('-')[1]);

        if (index < content.content.length - 1) {
          const { curContent, row } = linovelBuilder(content, index + 1);

          await interaction.editReply({
            content: curContent,
            components: [row]
          });
        }
        else {
          content = await novelView(content.nextChapter);
          const { curContent, row } = linovelBuilder(content, 0);

          await interaction.editReply({
            content: curContent,
            components: [row]
          });
        }

      } else if (buttonId === 'view_image') {
        // 查看圖片按鈕
        return;
      }
    } catch (error) {
      console.error('Button interaction error:', error);
      try {
        await interaction.followUp({
          content: '發生錯誤，請稍後再試',
          flags: 1 << 6
        });
      } catch (e) {
        console.error('Failed to send error message:', e);
      }
    }
  },
})






export const linovelBuilder = (content: NovelContent, index: number) => {
  const prevButton = new ButtonBuilder()
    .setCustomId(`linovelib_view:prev_page-${index}`)
    .setLabel('上一頁')
    .setStyle(ButtonStyle.Primary)

  const nextButton = new ButtonBuilder()
    .setCustomId(`linovelib_view:next_page-${index}`)
    .setLabel('下一頁')
    .setStyle(ButtonStyle.Primary);

  const imageButton = new ButtonBuilder()
    .setCustomId('linovelib_view:view_image')
    .setLabel('查看圖片')
    .setStyle(ButtonStyle.Secondary).setDisabled(content.img.length === 0);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(prevButton, nextButton, imageButton);

  return { curContent: `# ${content.title}\n ## ${content.chapterTitle}\n\n${content.content[index]}\n\n-# 此小說為網路搬運，若有侵權請聯繫我們刪除。[來源](https://tw.linovelib.com/)`, row }
}
