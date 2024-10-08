import { Client, Collection } from "discord.js";
import { existsSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { safeWriteFileSync } from "@/utils/fs";
import { resolve } from "path";

import commands from "../commands";
import events from "../events";
import logger from "@/class/logger";

import type { ClientOptions } from "discord.js";
import type { R7Command } from "./commands";

export class R7Client extends Client {
  commands = new Collection<string, R7Command>();
  cacheFolderPath = resolve(process.env["CACHE_FOLDER"] ?? ".cache");

  constructor(options: ClientOptions) {
    super(options);
    for (const command of commands) {
      this.commands.set(command.builder.name, command);
    }
    logger.debug(`Loaded ${this.commands.size} commands`);
    for (const event of events) {
      const on = event.on;
      if (on) {
        this.on(event.event, (...args) => void on.apply(this, args));
      }
      const once = event.once;
      if (once) {
        this.once(event.event, (...args) => void once.apply(this, args));
      }
    }
    logger.debug(`Loaded ${events.length} event handlers`);
  }

  async updateCommands(force = false) {
    if (!this.isReady()) {
      logger.error("Client isn't ready for command updates yet");
      return;
    }

    try {
      const data = this.commands.map((v) => v.builder.toJSON());
      const hash = createHash("md5").update(JSON.stringify(data)).digest("hex");

      const filePath = resolve(this.cacheFolderPath, "commands.cache");

      if (existsSync(filePath)) {
        if (!force && readFileSync(filePath, { encoding: "utf8" }) == hash)
          return;
      }

      if (process.env.NODE_ENV == "development") {
        const devGuildId = process.env["DEV_GUILD_ID"];
        if (!devGuildId) return;

        const guild = this.guilds.cache.get(devGuildId);
        if (!guild) return;

        await guild.commands.set(data);
        return;
      }

      await this.application.commands.set(data);

      safeWriteFileSync(filePath, hash, { encoding: "utf8" });

      logger.info("Command updated successfully");
    } catch (error) {
      logger.error("Error while updating commands", error);
    }
  }
}
