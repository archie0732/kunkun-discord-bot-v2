import type { NovelChapter, NovelContent, NovelDetail } from '@/api/linovelib/interface';
import { novelChapter, novelDetail } from '@/api/linovelib/novelDetail';
import { novelView } from '@/api/linovelib/novelView';
import { novelSearch } from '@/api/linovelib/search';
import { R7Command } from '@/class/commands';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';

let content: NovelContent;
let currentNovelId: string | null = null;
let novel: NovelDetail | null = null;
let chapterList: NovelChapter[] = [];

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
      .setRequired(true).setAutocomplete(true),
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

    if (id === '-1' || Number.isNaN(Number(id)) || id === '-2') {
      await interaction.deferReply({ flags: 1 << 6 });
      await interaction.editReply({
        content: '請等待autocomplete結果，再點擊選項',
        files: [{
          attachment: 'data/img/001.png',
          name: '001.png',
        }],
      });
      return;
    }

    try {
      await interaction.deferReply();
      chapterList = await novelChapter(id);
      novel = await novelDetail(id);
      const chapter = chapterList[chapterIndex];
      content = await novelView(chapter.vol[volIndex].url);

      const { curContent, row } = linovelBuilder(content, 0, novel.id, novel.title ?? 'null', content.prevChapter.includes('catalog'));

      await interaction.editReply({
        content: curContent,
        components: [row],

      });
    }
    catch (error) {
      await interaction.editReply({
        content: `發生錯誤，請稍後再試\n${error}`,
        flags: 1 << 6,
      });
    };
  },

  async onAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const keyword = interaction.options.getString('keyword');
    const chapter = interaction.options.getString('chapter');

    try {
      if (focusedOption.name === 'keyword') {
        const results = await novelSearch(focusedOption.value === '' ? '艾莉' : focusedOption.value, 1);

        if (results.length === 0) {
          return [{
            name: '找不到任何結果',
            value: '-1',
          }];
        }

        return results.slice(0, 25).map((result) => ({
          name: result.title,
          value: result.id,
        }));
      }
      else if (focusedOption.name === 'chapter') {
        if (!keyword || keyword === '-1' || keyword === '-2') {
          return [{
            name: '請先選擇小說',
            value: '-1',
          }];
        }

        if (currentNovelId !== keyword) {
          chapterList = await novelChapter(keyword);
          currentNovelId = keyword;
        }

        return chapterList.slice(0, 25).map((chapter, index) => ({
          name: `${index + 1}. ${chapter.chapterTitle}`,
          value: index.toString(),
        }));
      }
      else if (focusedOption.name === 'vol') {
        if (!keyword || !chapter || keyword === '-1' || keyword === '-2' || chapter === '-1' || chapter === '-2') {
          return [{
            name: '請先選擇小說和卷數',
            value: '-1',
          }];
        }

        if (currentNovelId !== keyword) {
          chapterList = await novelChapter(keyword);
          currentNovelId = keyword;
        }

        const chapterIndex = parseInt(chapter);
        if (isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapterList.length) {
          return [{
            name: '無效的卷數',
            value: '-1',
          }];
        }

        return chapterList[chapterIndex].vol.slice(0, 25).map((vol, index) => ({
          name: `${index + 1}. ${vol.title}`,
          value: index.toString(),
        }));
      }
    }
    catch (error) {
      console.error('Autocomplete error:', error);
      if (error instanceof Error && 'code' in error && error.code === 10062) {
        return [];
      }
      return [{
        name: '發生錯誤，請稍後再試',
        value: '-2',
      }];
    }

    return [];
  },

  async onButton(interaction, buttonId) {
    try {
      await interaction.deferUpdate();

      if (content === undefined) {
        await interaction.followUp({
          content: '操作逾時，請重新使用指令',
          flags: 1 << 6,
        });
        return;
      }

      if (buttonId.includes('prev_page')) {
        let index = parseInt(buttonId.split('-')[1]);
        try {
          if (index === 0) {
            content = await novelView(content.prevChapter);
            index = 1;
          }

          const { curContent, row } = linovelBuilder(content, index - 1, novel?.id ?? 'null', novel?.title ?? 'null', index === 1 && content.prevChapter.includes('catalog'));

          await interaction.editReply({
            content: curContent,
            components: [row],
          });
        }
        catch (error) {
          await interaction.followUp({
            content: '無法載入上一頁內容，請稍後再試',
            flags: 1 << 6,
          });
        }
      }
      else if (buttonId.includes('next_page')) {
        let index = parseInt(buttonId.split('-')[1]);
        try {
          if (index === content.content.length - 1) {
            content = await novelView(content.nextChapter);
            index = -1;
          }
          const { curContent, row } = linovelBuilder(content, index + 1, novel?.id ?? 'null', novel?.title ?? 'null');

          await interaction.editReply({
            content: curContent,
            components: [row],
          });
        }
        catch (error) {
          await interaction.followUp({
            content: '無法載入下一頁內容，請稍後再試',
            flags: 1 << 6,
          });
        }
      }
      else if (buttonId === 'view_image') {
        return;
      }
    }
    catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '10062') {
        return;
      }
      await interaction.followUp({
        content: `發生錯誤，請稍後再試\n${error}`,
        flags: 1 << 6,
      });
    }
  },
});

export const linovelBuilder = (content: NovelContent, index: number, id: string, title: string, prevChapterDisable = false, nextChapterDisable = false) => {
  const prevButton = new ButtonBuilder()
    .setCustomId(`linovelib_view:prev_page-${index}`)
    .setLabel('上一頁')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(prevChapterDisable);

  const nextButton = new ButtonBuilder()
    .setCustomId(`linovelib_view:next_page-${index}`)
    .setLabel('下一頁')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(nextChapterDisable);

  const imageButton = new ButtonBuilder()
    .setCustomId('linovelib_view:view_image')
    .setLabel('查看圖片')
    .setStyle(ButtonStyle.Secondary).setDisabled(content.img.length === 0);

  const sourceButton = new ButtonBuilder()
    .setLabel('source')
    .setStyle(ButtonStyle.Link)
    .setURL(`https://tw.linovelib.com/novel/${id}`);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(prevButton, nextButton, imageButton, sourceButton);

  return { curContent: `# ${content.title}\n ## ${content.chapterTitle}\n\n${content.content[index]}\n\n-# 此小說為網路搬運，若有侵權請聯繫archie0310刪除。[${title}](https://tw.linovelib.com/novel/${id})`, row };
};
