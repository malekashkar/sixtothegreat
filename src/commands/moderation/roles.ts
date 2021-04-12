import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class RolesCommand extends Command {
  cmdName = "roles";
  description = "Send the roles message in a channel.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    configDoc: DocumentType<Config>
  ) {
    const rolesChannel = message.mentions.channels.first();
    if (!rolesChannel)
      return message.channel.send(
        embeds.error(`Please mention a channel to send the roles message to.`)
      );

    if (configDoc.reactionRoles?.length) {
      const formattedRoles = configDoc.reactionRoles
        .map(
          (roleInfo) =>
            `${roleInfo.reaction} <@&${roleInfo.roleId}> ~ ${roleInfo.roleDescription}`
        )
        .join("\n\n");
      await rolesChannel.send(embeds.empty().setImage(config.images.roles));
      const rolesMessage = await rolesChannel.send(
        embeds.normal(`React to get a role!`, formattedRoles)
      );
      for (const reaction of configDoc.reactionRoles.map((x) => x.reaction)) {
        await rolesMessage.react(reaction);
      }

      configDoc.channels.roles = rolesChannel.id;
      configDoc.messageIds.roles = rolesMessage.id;
      await configDoc.save();
    } else {
      return message.channel.send(
        embeds.error(`Please setup reaction roles before running this command!`)
      );
    }
  }
}
