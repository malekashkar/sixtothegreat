import { MessageReaction, User } from "discord.js";
import Event, { EventNameType } from ".";
import { ConfigModel } from "../models/config";

export default class Verification extends Event {
  eventName: EventNameType = "messageReactionAdd";

  async handle(reaction: MessageReaction, user: User) {
    if (user.bot) return;
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    const configDoc = await ConfigModel.findOne({
      guildId: message.guild.id,
    });
    if (configDoc) {
      if (
        configDoc.roles?.verificationRole &&
        configDoc.messageIds?.verification
      ) {
        if (configDoc.messageIds.verification === message.id) {
          const member = message.guild.members.resolve(user);
          if (!member?.roles.cache.has(configDoc.roles.verificationRole))
            await member.roles.add(configDoc.roles.verificationRole);
        }
      }
    }
  }
}
