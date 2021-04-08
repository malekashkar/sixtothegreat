import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export class WhichUserCommand extends Command {
  cmdName = "witchuser";
  description = "Select the users that will be detected when going live.";

  async run(message: Message, args: string[], ConfigDoc: DocumentType<Config>) {
    const user = args[0];
    if (!user)
      return message.channel.send(
        embeds.error(`Please provide the name of the twitch channel.`)
      );

    ConfigDoc.streamers.push(user);
    await ConfigDoc.save();

    await message.channel.send(
      embeds.normal(
        `Twitch User Added`,
        `The user ${user} has been added to the list of streamers.`
      )
    );
  }
}
