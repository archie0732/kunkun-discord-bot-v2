import "dotenv/config";
import { ExtendedClient } from "./types/ExtendedClient";

const client = new ExtendedClient();

await client.login(process.env["DEV_TOKEN"]);
