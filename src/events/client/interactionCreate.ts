import { ChatInputCommandInteraction, Client } from "discord.js";
import { ExtendedClient } from '../../types/ExtendedClient';
import chalk from "chalk";

export default {
  name: "interactionCreate",
  /**
   * @param interaction - The interaction object from the Discord API.
   * @param client - The Discord client instance.
   * @returns {Promise<void>}
   */
  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    if (interaction.isCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands!.get(commandName);

      if (!command) return;

      try {
        console.log(`${interaction.user.tag} using command -- ${commandName}`);
        await command.execute(interaction, client);
        console.log(chalk.blue(`run command sucess!`));
      } catch (error) {
        console.error(chalk.red(error));
        await interaction.reply({
          content: `Something went wrong while executing this command...`,
          ephemeral: true,
        });
      }
    }
  },
};
