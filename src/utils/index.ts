import type { R7Client } from '@/class/client';
import type { ManhuaguiCache } from '@/types/cache';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export const createManhuaguiCacheData = (guildid: string, channel: string) => {
  const path = join(resolve('.cache', 'manhuagui'), `${guildid}.json`);

  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf-8')) as ManhuaguiCache;
  }

  const ManhuaguiData = {
    guild: guildid,
    channel: channel,
    sub: [],
  } as ManhuaguiCache;

  writeFileSync(path, JSON.stringify(ManhuaguiData, null, 2), 'utf-8');

  return ManhuaguiData;
};

export const getCommandsLink = async (client: R7Client, name: string) => {
  const commands = await client.application?.commands.fetch();

  const command = commands?.find((e) => e.name === name);

  if (!command) {
    return '';
  }

  return `</${name}:${command.id}>`;
};
