import { ExtendedClient } from "../../types/ExtendedClient";

export default {
  name: "ready",
  once: true,
  execute(client: ExtendedClient) {
    console.log(`${client.user?.tag} 登入成功`);

    setTimeout(() => {
      if (client.checkUpdateManguagui) {
        client.checkUpdateManguagui(client).catch(console.error);
      } else {
        console.error("checkUpdateManguagui function is not defined.");
      }
    }, 3_000);
  },
};
