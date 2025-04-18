import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Colors } from 'discord.js';
import { R7Command } from '@/class/commands';

export default new R7Command({
  builder: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll one or more dice')
    .addIntegerOption((option) =>
      option
        .setName('sides')
        .setDescription('Number of sides on the dice (default: 6)')
        .setMinValue(2)
        .setMaxValue(100),
    )
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setDescription('Number of dice to roll (default: 1)')
        .setMinValue(1)
        .setMaxValue(10),
    ),
  defer: false,
  ephemeral: false,
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const count = interaction.options.getInteger('count') ?? 1;

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle('🎲 Dice Roll')
      .addFields(
        {
          name: 'Rolls',
          value: rolls.map((roll) => `\`${roll}\``).join(' + '),
        },
        {
          name: 'Total',
          value: `\`${total}\``,
        },
      )
      .setFooter({ text: `${count}d${sides}` });

    await interaction.reply({ embeds: [embed] });
  },
});
