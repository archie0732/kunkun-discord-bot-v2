import { Events } from "discord.js";
import { R7EventHandler } from "@/class/events";

export default new R7EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isAnySelectMenu()) return;

    const [commandName, menuId] = interaction.customId.split(":");
    const command = this.commands.get(commandName);

    if (!command) return;
    if (!command.onSelectMenu) return;

    if (command.defer) {
      await interaction.deferUpdate();
    }

    await command.onSelectMenu.call(this, interaction, menuId);
  },
});
