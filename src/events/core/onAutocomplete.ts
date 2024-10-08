import { Events } from "discord.js";
import { R7EventHandler } from "@/class/events";

export default new R7EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isAutocomplete()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) return;
    if (!command.onAutocomplete) return;

    const options = await command.onAutocomplete.call(this, interaction);

    await interaction.respond(options);
  },
});
