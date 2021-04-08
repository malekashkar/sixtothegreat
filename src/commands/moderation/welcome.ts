import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class WelcomeCommand extends Command {
  cmdName = "welcome";
  description = "Send the welcome message in a channel.";

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
      await welcomeChannel.send(
        embeds
          .empty()
          .setImage(
            "https://cdn.discordapp.com/attachments/781691602045239326/784250794258071572/NoxDiscBanner1.png"
          )
      );
      await welcomeChannel.send(
        embeds.normal(`Welcome`, configDoc.messageTemplate.welcome)
      );
    } else {
      return message.channel.send(
        embeds.error(
          `Please setup a welcome message template before running this command!`
        )
      );
    }
  }
}
