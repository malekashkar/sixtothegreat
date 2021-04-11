import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class RulesCommand extends Command {
  cmdName = "rules";
  description = "Send the rules message in a channel.";
  adminPermissions = true;

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
      await rulesChannel.send(embeds.empty().setImage(config.images.rules));
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
