import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class VerifyCommand extends Command {
  cmdName = "verify";
  description = "Send the verification message in a channel.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    configDoc: DocumentType<Config>
  ) {
    const verifycationChannel = message.mentions.channels.first();
    if (!verifycationChannel)
      return message.channel.send(
        embeds.error(
          `Please mention a channel to send the verification message to.`
        )
      );

    if (
      configDoc.messageTemplate?.verification &&
      configDoc.roles?.verificationRole
    ) {
      await verifycationChannel.send(
        embeds.empty().setImage(config.images.verification)
      );
      const verificationMessage = await verifycationChannel.send(
        embeds.normal(`Verification`, configDoc.messageTemplate.verification)
      );
      await verificationMessage.react("✅");

      configDoc.channels.verification = verifycationChannel.id;
      configDoc.messageIds.verification = verificationMessage.id;
      await configDoc.save();
    } else {
      return message.channel.send(
        embeds.error(
          `Please setup a verification message template and/or role before running this command!`
        )
      );
    }
  }
}
