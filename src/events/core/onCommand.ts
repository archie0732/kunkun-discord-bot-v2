import { Events, MessageFlags } from 'discord.js';
import { R7EventHandler } from '@/class/events';

export default new R7EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) return;

    if (command.defer && !command.modals) {
      await interaction.deferReply(command.ephemeral
        ? { flags: [MessageFlags.Ephemeral] }
        : {},
      );
    }

    await command.execute.call(this, interaction);
  },
});
