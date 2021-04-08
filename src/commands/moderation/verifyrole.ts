import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class VerifyRoleCommand extends Command {
  cmdName = "verifyrole";
  description = "Set the role given when being verified";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    configDoc: DocumentType<Config>
  ) {
    const verificationRole = message.mentions.roles.first();
    if (!verificationRole)
      return message.channel.send(
        embeds.error(
          `Please provide the role you would like to be given upon verification.`
        )
      );

    if (configDoc.roles) {
      configDoc.roles = {
        verificationRole: verificationRole.id,
      };
    } else {
      configDoc.roles.verificationRole = verificationRole.id;
    }
    await configDoc.save();

    await message.channel.send(
      embeds.normal(
        `Verification Role Updated`,
        `The verification role has been updated to ${verificationRole.toString()}.`
      )
    );
  }
}
