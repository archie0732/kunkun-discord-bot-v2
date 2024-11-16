import logger from '@/class/logger';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const template = (guildId: string, channelID: string) => {
  return {
    guild: guildId,
    channel: channelID,
    sub: [],
  };
};

export const manhuaguiPath = (guildId: string, channelID: string) => {
  const deskPath = resolve('.cache', 'manhuagui');
  if (!existsSync(deskPath)) {
    mkdirSync(deskPath, { recursive: true });
    logger.info(`以建立資料夾 ${deskPath}`);
  }
  const filePath = join(deskPath, guildId + '.json');

  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(template(guildId, channelID), null, 2));
    logger.info(`未發現檔案，創建 ${filePath}`);
  }
  return filePath;
};

export const nhentaiPath = (guildId: string, channelID: string) => {
  const deskFile = resolve('.cache', 'nehentai');

  if (existsSync(deskFile)) {
    mkdirSync(deskFile, { recursive: true });
    logger.info(`以創建資料夾 ${deskFile}`);
  }

  const filePath = join(deskFile, guildId + '.json');
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(template(guildId, channelID), null, 2));
    logger.info(`未發現檔案, 創建 ${filePath}`);
  }
  return filePath;
};
