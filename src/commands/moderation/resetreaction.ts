import { DocumentType } from "@typegoose/typegoose";
import { stripIndents } from "common-tags";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";
import { updateReactionRoles } from "../../utils/reactions";

export default class ReactionsCommand extends Command {
  cmdName = "resetreactions";
  description =
    "Update the reaction roles message to be in sync with all roles.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    updateReactionRoles(ConfigDoc, message.guild);
  }
}
