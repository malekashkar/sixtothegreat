import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class RulesCommand extends Command {
  cmdName = "rules";
  description = "Send the rules message in a channel.";

  async run(
    message: Message,
    _args: string[],
    configDoc: DocumentType<Config>
  ) {
    const rulesChannel = message.mentions.channels.first();
    if (!rulesChannel)
      return message.channel.send(
        embeds.error(`Please mention a channel to send the rules message to.`)
      );

    if (configDoc.messageTemplate?.rules) {
      await rulesChannel.send(
        embeds
          .empty()
          .setImage(
            "https://cdn.discordapp.com/attachments/781691602045239326/786331465130049546/NoxDiscBanner1_1.png"
          )
      );
      await rulesChannel.send(
        embeds.normal(`Rules`, configDoc.messageTemplate.rules)
      );
    } else {
      return message.channel.send(
        embeds.error(
          `Please setup a rules message template before running this command!`
        )
      );
    }
  }
}
