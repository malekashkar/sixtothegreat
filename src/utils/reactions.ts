import { DocumentType } from "@typegoose/typegoose";
import { Guild, TextChannel } from "discord.js";
import { Config } from "../models/config";
import embeds from "./embeds";

export async function updateReactionRoles(
  configDocument: DocumentType<Config>,
  guild: Guild
) {
  if (configDocument.channels?.roles && configDocument.messageIds?.roles) {
    const formattedRoles = configDocument.reactionRoles
      .map((roleInfo) => {
        const role = guild.roles.resolve(roleInfo.roleId);
        if (role) {
          return `${roleInfo.reaction} <@&${roleInfo.roleId}> ~ ${roleInfo.roleDescription}`;
        } else {
          configDocument.reactionRoles = configDocument.reactionRoles.filter(
            (x) => x.roleId != roleInfo.roleId
          );
        }
      })
      .filter((x) => !!x)
      .join("\n\n");
    await configDocument.save();

    const reactionRolesChannel = guild.channels.resolve(
      configDocument.channels.roles
    ) as TextChannel;
    if (reactionRolesChannel) {
      let msg = await reactionRolesChannel.messages.fetch(
        configDocument.messageIds.roles
      );
      if (msg) {
        await msg.edit(embeds.normal(`React to get a role!`, formattedRoles));
      } else {
        msg = await reactionRolesChannel.send(
          embeds.normal(`React to get a role!`, formattedRoles)
        );
      }
      for (const reaction of configDocument.reactionRoles.map(
        (x) => x.reaction
      )) {
        await msg.react(reaction);
      }
    }
  }
}
