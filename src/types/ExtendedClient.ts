import { Client, Collection, GatewayIntentBits } from "discord.js";

import type { Command } from "@/commands";

import commands from "@/commands";
import events from "@/events";

import type { ClientOptions } from "discord.js";

export class ExtendedClient extends Client {
  commands = new Collection<string, Command>();

  constructor(options?: ClientOptions) {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
      ...options,
    });

    this.loadCommands();
    this.loadEvents();
  }

  private loadCommands() {
    for (const command of commands) {
      this.commands.set(command.data.name, command);
    }
  }

  private loadEvents() {
    for (const event of events) {
      if (event.on) {
        this.on(event.name, (...args) => event.on!.call(this, ...args));
      }

      if (event.once) {
        this.once(event.name, (...args) => event.once!.call(this, ...args));
      }
    }
  }

  async registerCommands() {
    const guildId = process.env["GUILD_ID"];
    if (!guildId) return;

    const guild = this.guilds.cache.get(guildId);
    if (!guild) return;

    await guild.commands.set(this.commands.map((c) => c.data.toJSON()));
  }
}
