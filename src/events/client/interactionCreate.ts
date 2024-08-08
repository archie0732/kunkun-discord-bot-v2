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
      await interaction.reply({
        content: `Something went wrong while executing this command...`,
        ephemeral: true,
      });
    }
  },
} as Event<typeof name>;
