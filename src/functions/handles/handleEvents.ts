import * as fs from "fs";
import { ExtendedClient } from "../../types/ExtendedClient";
import { join } from "path";

interface Event {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void;
}

const handleEvents = (client: ExtendedClient): void => {
  client.handleEvents = async () => {
    const eventFolder = fs.readdirSync(join(__dirname, `../../events`));
    for (const folder of eventFolder) {
      const eventFiles = fs
        //`./src/events/${folder}`
        .readdirSync(join(__dirname, `../../events/${folder}`))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js")); // 確保加载.ts 和 .js 文件
      switch (folder) {
        case "client":
          for (const file of eventFiles) {
            const filePath = `../../events/${folder}/${file}`;
            const eventModule = await import(filePath);
            const event: Event = eventModule.default;
            if (event.once) {
              client.once(event.name, (...args) => event.execute(...args, client));
            } else {
              client.on(event.name, (...args) => event.execute(...args, client));
            }
          }
          break;

        default:
          break;
      }
    }
  };
};

export default handleEvents;
