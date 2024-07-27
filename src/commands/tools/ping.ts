import { ExtendedClient } from "../../types/ExtendedClient";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName(`ping`).setDescription(`檢測機器人延遲`),

    async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {

        try {
            await interaction.deferReply({ fetchReply: true })
            const message = await interaction.fetchReply()

            const sendMessage = `🔍 API Latency: ${client.ws.ping}ms\n🛜 Client Ping: ${message.createdTimestamp - interaction.createdTimestamp}ms`;

            await interaction.editReply({
                content: sendMessage,
            })
        } catch (error) {
            console.error(error)
            await interaction.editReply({
                content: `ping have some promble`
            })
        }
    }
}

