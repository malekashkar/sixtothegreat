import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class VerifyCommand extends Command {
  cmdName = "verify";
  description = "Send the verification message in a channel.";

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
        embeds
          .empty()
          .setImage(
            "https://cdn.discordapp.com/attachments/781691602045239326/786331440526000158/NoxDiscBanner.png"
          )
      );
      const verificationMessage = await verifycationChannel.send(
        embeds.normal(`Verification`, configDoc.messageTemplate.verification)
      );
      await verificationMessage.react("✅");

      if (configDoc.messageIds) {
        configDoc.messageIds.verificationMessageId = verificationMessage.id;
      } else {
        configDoc.messageIds = {
          verificationMessageId: verificationMessage.id,
        };
      }
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
