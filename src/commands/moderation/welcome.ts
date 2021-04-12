import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class WelcomeCommand extends Command {
  cmdName = "welcome";
  description = "Send the welcome message in a channel.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    configDoc: DocumentType<Config>
  ) {
    const welcomeChannel = message.mentions.channels.first();
    if (!welcomeChannel)
      return message.channel.send(
        embeds.error(`Please mention a channel to send the welcome message to.`)
      );

    if (configDoc.messageTemplate?.welcome) {
      await welcomeChannel.send(embeds.empty().setImage(config.images.welcome));
      const welcomeMessage = await welcomeChannel.send(
        embeds.normal(`Welcome`, configDoc.messageTemplate.welcome)
      );

      configDoc.channels.welcome = welcomeChannel.id;
      configDoc.messageIds.welcome = welcomeMessage.id;
      await configDoc.save();
    } else {
      return message.channel.send(
        embeds.error(
          `Please setup a welcome message template before running this command!`
        )
      );
    }
  }
}
