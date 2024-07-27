import { Client, Collection, GuildBasedChannel } from "discord.js";
import { Manhuagui } from "../functions/manhuagui/manhuagui_fetch";

export interface ExtendedClient extends Client {
  commands: Collection<any, any>;
  color: string;
  commandArray: any[];
  Channel: GuildBasedChannel;
  handleCommands?: () => void;
  handleEvents?: () => void;
  fetchMangaugui?: (id: string) => Promise<Manhuagui>;
  checkUpdateManguagui?: (client: ExtendedClient) => Promise<void>;
}
