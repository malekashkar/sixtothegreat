import { MessageReaction, User } from "discord.js";
import Event, { EventNameType } from ".";
import { ReactionRoleModel } from "../models/reactionRole";

export default class AddReactionRoles extends Event {
  eventName: EventNameType = "messageReactionRemove";

  async handle(reaction: MessageReaction, user: User) {
    if (user.bot) return;
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    const reactionData = await ReactionRoleModel.findOne({
      messageId: message.id,
    });
    if (reactionData) {
      const roleInfo = reactionData.roles.find(
        (roleInfo) => roleInfo.reaction === reaction.emoji.name
      );
      if (roleInfo) {
        const member = message.guild.members.resolve(user);
        if (member?.roles.cache.has(roleInfo.roleId))
          await member.roles.remove(roleInfo.roleId);
      }
    }
  }
}
