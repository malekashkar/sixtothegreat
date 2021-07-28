import { MessageReaction, Role, TextChannel, User } from "discord.js";
import Event, { EventNameType } from ".";
import { ConfigModel } from "../models/config";
import embeds from "../utils/embeds";
import { updateReactionRoles } from "../utils/reactions";

export default class AddReactionRoles extends Event {
  eventName: EventNameType = "roleDelete";

  async handle(role: Role) {
    const configData = await ConfigModel.findOne({
      guildId: role.guild.id,
    });
    if (configData?.reactionRoles?.some(x => x.roleId == role.id)) {
        configData.reactionRoles = configData.reactionRoles.filter(x => x.roleId != role.id)
        await configData.save()

        updateReactionRoles(configData, role.guild);
    }
  }
}
