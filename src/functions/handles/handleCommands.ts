import * as fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { ExtendedClient } from "../../types/ExtendedClient";
import { join } from 'path';
import * as dotenv from "dotenv";

dotenv.config();

interface Command {
  data: {
    name: string;
    toJSON: () => object;
  };
}

const handleCommands = (client: ExtendedClient): void => {
  client.handleCommands = async () => {
    // 读取 TypeScript 文件夹
    const commandFolders = fs.readdirSync(join(__dirname, "../../commands"));
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(join(__dirname, `../../commands/${folder}`))
        .filter((file) => file.endsWith(".ts"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const commandPath = join(__dirname, `../../commands/${folder}/${file}`);
        try {
          // 加载 TypeScript 文件
          const commandModule = await import(commandPath);
          const command: Command = commandModule.default || commandModule;
          commands!.set(command.data.name, command);
          commandArray!.push(command.data.toJSON());
          console.log(`✅ Command: ${command.data.name} has been registered`);
        } catch (error) {
          console.error(`Failed to load command from ${commandPath}`, error);
        }
      }
    }

    const clientId = process.env.CLIENT_ID!;
    const guildId = process.env.GUILD_ID!;
    const rest = new REST({ version: "10" }).setToken(process.env.DEV_TOKEN!);

    try {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      });

      console.log(`✅ Successfully reloaded all application (/) commands!`);
    } catch (error) {
      console.error(error);
    }
  };
};

export default handleCommands;
