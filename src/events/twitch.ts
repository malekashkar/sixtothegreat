import { DocumentType } from "@typegoose/typegoose";
import { TextChannel } from "discord.js";
import Event, { EventNameType } from ".";
import { Config, ConfigModel } from "../models/config";
import { StreamModel } from "../models/streams";
import embeds from "../utils/embeds";

export default class twitch extends Event {
  eventName: EventNameType = "ready";

  async handle() {
    setInterval(async () => {
      const ConfigCursor = ConfigModel.find().cursor();

      ConfigCursor.on("data", async (configDocument: DocumentType<Config>) => {
        if (configDocument.streamers?.length) {
          const result = await this.client.twitch.getStreams({
            channels: configDocument.streamers,
          });
          if (result?.data?.length) {
            const guild = await this.client.guilds.fetch(
              configDocument.guildId
            );
            if (guild) {
              const channelNotifications = guild.channels.resolve(
                configDocument?.channels?.twitchNotifications
              ) as TextChannel;
              if (channelNotifications) {
                const role = configDocument.roles?.notificationRole
                  ? `<@&${configDocument.roles.notificationRole}> `
                  : ``;
                for (const streamData of result.data) {
                  const StreamDocument = await StreamModel.findOne({
                    streamId: streamData.id,
                  });
                  if (!StreamDocument) {
                    /*
                    const channelInformation = await this.client.twitch.getChannelInformation(
                      { broadcaster_id: streamData.user_id }
                    );
                    const gameName = channelInformation.data[0].game_name;
                    channelNotifications.send(
                      `${role}**${streamData.user_name}** went live playing **${gameName}**!`,
                      embeds
                        .normal(streamData.title, "Playing " + gameName)
                        .setURL("https://twitch.tv/" + streamData.user_name)
                        .setImage(streamData.getThumbnailUrl())
                    );
                    await StreamModel.create({
                      streamId: streamData.id,
                    });
                    */
                  }
                }
              }
            }
          }
        }
      });
    }, 15e3);
  }
}
