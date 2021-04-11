import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class StreamersCommand extends Command {
  cmdName = "streamers";
  description = "List/add/remove streamers from the twitch notifications list.";

  async run(message: Message, args: string[], configDoc: DocumentType<Config>) {
    const streamer = args[0];
    if (streamer) {
      if (configDoc.streamers.includes(streamer.toLowerCase())) {
        configDoc.streamers = configDoc.streamers.filter(
          (x) => x.toLowerCase() !== streamer.toLowerCase()
        );
        await message.channel.send(
          embeds.normal(
            `Streamer Removed`,
            `The twitch username **${streamer}** has been **removed** from the notifications list.`
          )
        );
      } else {
        configDoc.streamers.push(streamer.toLowerCase());
        await message.channel.send(
          embeds.normal(
            `Streamer Added`,
            `The twitch username **${streamer}** has been **added** to the notifications list.`
          )
        );
      }
      await configDoc.save();
    } else {
      await message.channel.send(
        embeds.normal(
          `Streamers List`,
          configDoc.streamers
            .map((name, i) => `${i + 1}. ${name}`)
            .join("\n") ||
            `No streamers have been set yet! Provide a twitch username to add them to the list.`
        )
      );
    }
  }
}
