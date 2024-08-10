import type { ExtendedClient } from "@/types/ExtendedClient";
import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";

interface Player {
  choice: "paper" | "scissors" | "rock";
  id: string;
}

async function game(playCount: number, players: Player[], channelID: string) {
  // Initialize the Map with empty arrays for each choice
  const result = new Map<"paper" | "scissors" | "rock", string[]>();
  result.set("paper", []);
  result.set("scissors", []);
  result.set("rock", []);

  // Populate the result map based on player choices
  for (const player of players) {
    result.get(player.choice)?.push(player.id);
  }

  // Determine winner
  const winner: string[] = [];

  if (
    result.get("paper")!.length === playCount ||
    result.get("scissors")!.length === playCount ||
    result.get("rock")!.length === playCount
  ) {
    // All players chose the same option, so it's a tie or a single winner
    // No one wins in this scenario
  } else if (result.get("paper")!.length === 0) {
    // Rock beats Scissors
    winner.push(...result.get("rock")!);
  } else if (result.get("rock")!.length === 0) {
    // Scissors beat Paper
    winner.push(...result.get("scissors")!);
  } else if (result.get("scissors")!.length === 0) {
    // Paper beats Rock
    winner.push(...result.get("paper")!);
  } else {
  }

  // Display the result
  if (winner.length > 0) {
    console.log(`The winner(s) are: ${winner.join(", ")}`);
  } else {
    console.log("It's a tie!");
  }
}

async function drawMessage(channelID: string, client: ExtendedClient) {
  const embed = new EmbedBuilder().setTitle("本次比賽結果").setDescription("");
  return -1;
}
