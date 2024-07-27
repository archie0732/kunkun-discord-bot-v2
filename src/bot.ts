import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { join } from 'path'
import { ExtendedClient } from "./types/ExtendedClient";
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as ExtendedClient;

client.commands = new Collection();
client.color = "";
client.commandArray = [];

// Load functions dynamically
const loadFunctions = async () => {
    const functionFolders = fs.readdirSync(join(__dirname, `/functions`));
    for (const folder of functionFolders) {
        const functionFiles = fs
            .readdirSync(`${__dirname}/functions/${folder}`)
            .filter((file) => file.endsWith(".ts"));

        for (const file of functionFiles) {
            const filePath = `${__dirname}/functions/${folder}/${file}`;
            try {
                const functionModule = (await import(filePath)).default;
                console.log(`✅ Requiring file: ${filePath} ---> succeeded!`);
                functionModule(client);
            } catch (error) {
                console.error(`Failed to load function from ${filePath}`, error);
            }
        }
    }
};

async function start() {
    await loadFunctions();

    if (typeof client.handleCommands === 'function') {
        await client.handleCommands()
    } else {
        console.error('client.handleEvents is not a function or is undefined');
    }

    if (typeof client.handleEvents === 'function') {
        await client.handleEvents()
    } else {
        console.error('client.handleCommands is not a function or is undefined');
    }
    await client.login(process.env.DEV_TOKEN)
};

start();
