import { Message } from "discord.js";
import Command from "..";
import { ReactionRoleModel } from "../../models/reactionRole";
import embeds from "../../utils/embeds";

export default class AddRoleCommand extends Command {
  cmdName = "addrole";
  description = "Edit a message in the channel to a reaction message.";

  async run(message: Message, args: string[]) {
    const messageId = args[0] ? args.shift() : null;
    if (!messageId)
      return message.channel.send(embeds.error(`Please provide a message ID`));
    const reaction = args[0] ? args.shift() : null;

    const role = message.mentions.roles.first();
    if (!role)
      return message.channel.send(
        embeds.error(`Please tag the role you would like to setup.`)
      );
    args.shift();

    const description = args.join(" ");
    if (!description)
      return message.channel.send(
        embeds.error(`Please provide a description for the role.`)
      );

    let reactionRoleDocument = await ReactionRoleModel.findOne({
      messageId,
    });
    if (reactionRoleDocument) {
      reactionRoleDocument.roles.push({
        reaction,
        roleId: role.id,
        roleDescription: description,
      });
      await reactionRoleDocument.save();
    } else {
      reactionRoleDocument = await ReactionRoleModel.create({
        messageId,
        roles: [
          {
            reaction,
            roleId: role.id,
            roleDescription: description,
          },
        ],
      });
    }

    const formatRoles = reactionRoleDocument.roles
      .map(
        (roleInfo) =>
          `${roleInfo.reaction} <@&${roleInfo.roleId}> ~ ${roleInfo.roleDescription}`
      )
      .join("\n");
    const reactionMessage = await message.channel.messages.fetch(messageId);
    await reactionMessage.edit(embeds.normal(`Reaction Roles`, formatRoles));
    await reactionMessage.react(reaction);
  }
}
