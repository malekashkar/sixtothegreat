import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export class WhichChannelCommand extends Command {
  cmdName = "witchchannel";
  description = "Select the channel the stream updates should be sent in.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    const channel = message.mentions.channels.first();
    if (!channel)
      return message.channel.send(
        embeds.error(
          `Please tag the channel you would like to set the notifications to go to.`
        )
      );

    ConfigDoc.channels.twitchNotifications = channel.id;
    await ConfigDoc.save();

    await message.channel.send(
      embeds.normal(
        `Notifications Channel Set`,
        `The channel ${channel} will receive notifications when a streamer goes live.`
      )
    );
  }
}
