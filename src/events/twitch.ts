import { TextChannel } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import { ConfigModel } from "../models/config";
import embeds from "../utils/embeds";

export default class Giveaways extends Event {
  eventName: EventNameType = "ready";

  async handle() {
    setInterval(async () => {
      const ConfigDocument = await ConfigModel.findOne({
        guildId: config.mainGuildId,
      });
      if (ConfigDocument.streamers?.length) {
        const result = await this.client.twitch.getStreams({
          channels: ConfigDocument.streamers,
        });
        if (result?.data?.length) {
          const guild = await this.client.guilds.fetch(config.mainGuildId);
          if (guild) {
            const channelNotifications = guild.channels.resolve(
              ConfigDocument?.channels?.twitchNotifications
            ) as TextChannel;
            if (channelNotifications) {
              const role = ConfigDocument.roles?.notificationRole
                ? `<@&${ConfigDocument.roles.notificationRole}> `
                : ``;
              for (var i = 0; i < result.data.length; i++) {
                channelNotifications.send(
                  `${role}${result.data[i].user_name} went live playing ${result.data[i].game_id}!`,
                  embeds
                    .normal(
                      result.data[i].title,
                      "Playing " + result.data[i].game_id
                    )
                    .setURL("https://twitch.tv/" + result.data[i].user_id)
                    .setImage(result.data[i].getThumbnailUrl())
                );
              }
            }
          }
        }
      }
    }, 15e3);
  }
}
