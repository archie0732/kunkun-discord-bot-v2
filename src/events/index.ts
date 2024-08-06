import type { ClientEvents } from "discord.js";
import type { ExtendedClient } from "../types/ExtendedClient";
import ready from "./client/ready";
import interactionCreate from "./client/interactionCreate";

export interface Event<Event extends keyof ClientEvents> {
  name: Event;
  on?: (this: ExtendedClient, ...args: ClientEvents[Event]) => Promise<void>;
  once?: (this: ExtendedClient, ...args: ClientEvents[Event]) => Promise<void>;
}

export default [interactionCreate, ready] as Event<keyof ClientEvents>[];
