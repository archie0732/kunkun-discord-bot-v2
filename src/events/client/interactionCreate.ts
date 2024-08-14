import { Events } from "discord.js";
import chalk from "chalk";

import type { Event } from "@/events";

const name = Events.InteractionCreate;

export default {
  name,
  async on(interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) return;

    try {
      console.log(`${interaction.user.tag} using command -- ${interaction.commandName}`);
      await command.execute(interaction, this);
    } catch (error) {
      console.error(chalk.red(error));
      if (typeof error === "string") {
        await interaction.reply({
          content: error,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "somethhing wrong while execute this command...",
          ephemeral: true,
        });
      }

    }
  },
} as Event<typeof name>;
