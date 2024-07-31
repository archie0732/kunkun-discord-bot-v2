import { Client, Collection, GuildBasedChannel } from "discord.js";
import { Manhuagui } from "../functions/manhuagui/manhuagui_fetch";
import { Hanime1 } from "../functions/hanime1/hanime1_fetch";

export interface ExtendedClient extends Client {
  commands: Collection<any, any>;
  color: string;
  commandArray: any[];
  Channel: GuildBasedChannel;
  handleCommands?: () => void;
  handleEvents?: () => void;
  fetchManhuagui?: (id: string) => Promise<Manhuagui>;
  checkUpdateManhuagui?: (client: ExtendedClient) => Promise<void>;
  isNumberic?: (input: string) => boolean;
  hanime1_fetch?: (tag: string) => Promise<Hanime1>;
  hanime1A?: (client: ExtendedClient) => Promise<void>;
}
