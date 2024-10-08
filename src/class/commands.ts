import type {
  AnySelectMenuInteraction,
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import type { ModalBuilder, SharedSlashCommand } from "@discordjs/builders";
import type { R7Client } from "./client";

export interface R7CommandOptions {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: R7Client,
    interaction: ChatInputCommandInteraction<"cached">
  ) => void | Promise<void>;
  onAutocomplete?: (
    this: R7Client,
    interaction: AutocompleteInteraction<"cached">
  ) =>
    | readonly ApplicationCommandOptionChoiceData[]
    | Promise<readonly ApplicationCommandOptionChoiceData[]>;
  onButton?: (
    this: R7Client,
    interaction: ButtonInteraction<"cached">,
    buttonId: string
  ) => void | Promise<void>;
  onModalSubmit?: (
    this: R7Client,
    interaction: ModalSubmitInteraction<"cached">,
    modalId: string
  ) => void | Promise<void>;
  onSelectMenu?: (
    this: R7Client,
    interaction: AnySelectMenuInteraction<"cached">,
    menuId: string
  ) => void | Promise<void>;
}

export class R7Command {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: R7Client,
    interaction: ChatInputCommandInteraction<"cached">
  ) => void | Promise<void>;
  onAutocomplete?: (
    this: R7Client,
    interaction: AutocompleteInteraction<"cached">
  ) =>
    | readonly ApplicationCommandOptionChoiceData[]
    | Promise<readonly ApplicationCommandOptionChoiceData[]>;
  onButton?: (
    this: R7Client,
    interaction: ButtonInteraction<"cached">,
    buttonId: string
  ) => void | Promise<void>;
  onModalSubmit?: (
    this: R7Client,
    interaction: ModalSubmitInteraction<"cached">,
    modalId: string
  ) => void | Promise<void>;
  onSelectMenu?: (
    this: R7Client,
    interaction: AnySelectMenuInteraction<"cached">,
    menuId: string
  ) => void | Promise<void>;

  constructor(options: R7CommandOptions) {
    this.builder = options.builder;
    this.defer = options.defer;
    this.ephemeral = options.ephemeral;
    this.modals = options.modals;
    this.execute = options.execute;
    this.onAutocomplete = options.onAutocomplete;
    this.onButton = options.onButton;
    this.onModalSubmit = options.onModalSubmit;
    this.onSelectMenu = options.onSelectMenu;
  }
}
