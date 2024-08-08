import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient";

import hanime1_add from "./hanime1/hanime1_add";
import hanime1_rm from "./hanime1/hanime1_rm";

import manhuagui_add from "./manhuagui/manhuagui_add";
import manhuagui_rm from "./manhuagui/manhuagui_rm";

import nhentai_add from "./nehentai/nhentai_add";
import nhentai_rm from "./nehentai/nhentai_rm";

import draw from "./tools/draw";
import ping from "./tools/ping";
import setChannel from "./tools/setChannel";

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void>;
}

export default [
  hanime1_add,
  hanime1_rm,
  manhuagui_add,
  manhuagui_rm,
  nhentai_add,
  nhentai_rm,
  draw,
  ping,
  setChannel,
] as Command[];
