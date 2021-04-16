import { DocumentType } from "@typegoose/typegoose";
import { TextChannel, User } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import { Giveaway, GiveawayModel } from "../models/giveaway";
import embeds from "../utils/embeds";

export default class Giveaways extends Event {
  eventName: EventNameType = "ready";

  async handle() {
    setInterval(async () => {
      const endedGiveaways = GiveawayModel.find({
        endTime: { $lte: Date.now() },
      }).cursor();
      endedGiveaways.on(
        "data",
        async (endedGiveaway: DocumentType<Giveaway>) => {
          const guild = await this.client.guilds.fetch(endedGiveaway.guildId);
          if (guild) {
            const giveawayChannel = guild.channels.resolve(
              endedGiveaway.channelId
            ) as TextChannel;
            if (giveawayChannel) {
              const giveawayMessage = await giveawayChannel.messages.fetch(
                endedGiveaway.messageId
              );
              if (giveawayMessage) {
                const reactors = giveawayMessage.reactions.cache
                  .get(config.giveawayReactionEmoji)
                  ?.users.cache.filter((user) => !user.bot)
                  .array();

                let winners: User[] = [];
                for (let i = 0; i < endedGiveaway.winners; i++) {
                  const winner =
                    reactors[Math.floor(Math.random() * reactors.length)];
                  if (!winners.includes(winner)) {
                    winners.push(winner);
                  }
                }

                await giveawayMessage.delete();
                await giveawayChannel.send(
                  embeds.normal(
                    `The winner(s) of the ${endedGiveaway.prize} giveaway are...`,
                    `${winners.join(
                      ", "
                    )}! Congrats :tada:\n\nAll winners will recive a DM from a server admin soon.`
                  )
                );

                await endedGiveaway.deleteOne();
              }
            }
          }
        }
      );
    }, 15e3);

    setInterval(async () => {
      const continuousGiveaways = GiveawayModel.find({
        endTime: { $gt: Date.now() },
      }).cursor();
      continuousGiveaways.on(
        "data",
        async (continuousGiveaway: DocumentType<Giveaway>) => {
          const guild = await this.client.guilds.fetch(continuousGiveaway.guildId);
          if (guild) {
            const giveawayChannel = guild.channels.resolve(
              continuousGiveaway.channelId
            ) as TextChannel;
            if (giveawayChannel) {
              const giveawayMessage = await giveawayChannel.messages.fetch(
                continuousGiveaway.messageId
              );
              if (giveawayMessage) {
                const distance = remainingTime(
                  continuousGiveaway.endTime - Date.now()
                );
                await giveawayMessage.edit({
                  embed: {
                    title: `${continuousGiveaway.prize} Giveaway`,
                    description: `Time Remaining: ${distance}\n**${continuousGiveaway.winners} winner(s) will be chosen to win this giveaway!**\nReact with ${config.giveawayReactionEmoji} to join!`,
                    footer: {
                      text: "Official SixtoTheGreat Discord Bot",
                      icon_url: this.client.user.avatarURL(),
                    },
                  },
                });
              }
            }
          }
        }
      );
    }, 10e3);
  }
}

function remainingTime(num: number) {
  const days = Math.floor(
    (num % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
  );
  const hours = Math.floor((num % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((num % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((num % (1000 * 60)) / 1000);
  let remaining = "";
  if (days !== 0) {
    remaining += days + "d ";
  }
  if (hours !== 0) {
    remaining += hours + "h ";
  }
  if (minutes !== 0) {
    remaining += minutes + "m ";
  }
  if (seconds !== 0) {
    remaining += seconds + "s";
  }
  return remaining;
}
