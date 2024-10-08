import type { ClientEvents } from "discord.js";
import type { R7Client } from "./client";

type Events = keyof ClientEvents;

export interface R7EventHandlerOptions<Event extends Events = Events> {
  event: Event;
  on?: (this: R7Client, ...args: ClientEvents[Event]) => void | Promise<void>;
  once?: (this: R7Client, ...args: ClientEvents[Event]) => void | Promise<void>;
}

export class R7EventHandler<Event extends Events = Events> {
  event: Event;
  on?: (this: R7Client, ...args: ClientEvents[Event]) => void | Promise<void>;
  once?: (this: R7Client, ...args: ClientEvents[Event]) => void | Promise<void>;
  constructor(options: R7EventHandlerOptions<Event>) {
    this.event = options.event;
    this.on = options.on;
    this.once = options.once;
  }
}
