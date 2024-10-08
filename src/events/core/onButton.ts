import { Events } from "discord.js";
import { R7EventHandler } from "@/class/events";

export default new R7EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isButton()) return;

    const [commandName, buttonId] = interaction.customId.split(":");
    const command = this.commands.get(commandName);

    if (!command) return;
    if (!command.onButton) return;

    if (command.defer) {
      await interaction.deferUpdate();
    }

    await command.onButton.call(this, interaction, buttonId);
  },
});
