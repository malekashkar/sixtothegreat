import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export class WhichRoleCommand extends Command {
  cmdName = "witchrole";
  description = "Select the role to be tagged when a streamer goes online.";
  adminPermissions = true;

  async run(message: Message, _args: string[], ConfigDoc: DocumentType<Config>) {
    const role = message.mentions.roles.first();
    if (!role)
      return message.channel.send(
        embeds.error(
          `Please tag the role you would like to set the notifications to ping.`
        )
      );

    ConfigDoc.roles.notificationRole = role.id;
    await ConfigDoc.save();

    await message.channel.send(
      embeds.normal(
        `Notifications Role Set`,
        `The role ${role} will be pinged when streamers go live.`
      )
    );
  }
}
