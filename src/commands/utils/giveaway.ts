import { Message } from "discord.js";
import Command from "..";
import ms from "ms";
import embeds from "../../utils/embeds";
import config from "../../config";
import { GiveawayModel } from "../../models/giveaway";

export default class GiveawayCommand extends Command {
  cmdName = "giveaway";
  description = "Create a new automated giveaway.";
  adminPermissions = true;

  async run(message: Message, args: string[]) {
    const timeframe = args[0] ? ms(args.shift()) : null;
    if (!timeframe)
      return message.channel.send(
        embeds.error(`Please provide a timeframe for this giveaway.`)
      );

    const winners = !isNaN(parseInt(args[0])) ? parseInt(args.shift()) : null;
    if (!winners)
      return message.channel.send(
        embeds.error(`Please provide the amount of winners.`)
      );

    const prize = args.join(" ");
    if (!prize)
      return message.channel.send(
        embeds.error(`Please provide the name of the prize.`)
      );

    const giveawayMessage = await message.channel.send(
      embeds.normal(
        `${prize} | Giveaway`,
        `Time Remaining: **${ms(timeframe)}**\n**${winners} winner(s) will be chosen to win this giveaway!**\nReact with ${config.giveawayReactionEmoji} to join!`
      )
    );

    await giveawayMessage.react(config.giveawayReactionEmoji);
    await GiveawayModel.create({
      guildId: message.guild.id,
      channelId: message.channel.id,
      messageId: giveawayMessage.id,
      endTime: Date.now() + timeframe,
      winners,
      prize,
    });
  }
}
