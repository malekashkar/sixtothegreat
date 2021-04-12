import { MessageReaction, User } from "discord.js";
import Event, { EventNameType } from ".";
import { ConfigModel } from "../models/config";

export default class AddReactionRoles extends Event {
  eventName: EventNameType = "messageReactionAdd";

  async handle(reaction: MessageReaction, user: User) {
    if (user.bot) return;
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    const configData = await ConfigModel.findOne({
      guildId: message.guild.id,
    });
    if (configData?.reactionRoles?.length) {
      const roleInfo = configData.reactionRoles.find(
        (roleInfo) => roleInfo.reaction === reaction.emoji.name
      );
      if (roleInfo) {
        const member = message.guild.members.resolve(user);
        if (!member?.roles.cache.has(roleInfo.roleId))
          await member.roles.add(roleInfo.roleId);
      }
    }
  }
}
