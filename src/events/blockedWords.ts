import { Message } from "discord.js";
import Event, { EventNameType } from ".";
import config from "../config";
import { ConfigModel } from "../models/config";

export default class BlockedWords extends Event {
  eventName: EventNameType = "message";

  async handle(message: Message) {
    const ConfigDocument = await ConfigModel.findOne({
      guildId: config.mainGuildId,
    });
    if (
      ConfigDocument?.blockedWords?.length &&
      ConfigDocument?.blockedChannels?.length &&
      ConfigDocument?.blockedChannels?.includes(message.channel.id)
    ) {
      let str = message.content.toLowerCase();
      for (const blockedWord of ConfigDocument.blockedWords) {
        if (str.includes(blockedWord.toLowerCase())) {
          str = str
            .split(blockedWord.toLowerCase())
            .join(" " + "*".repeat(blockedWord.length) + " ");
        }
      }
      if (str !== message.content.toLowerCase()) {
        await message.delete();
        await message.channel.send(message.author.tag + ": " + str);
      }
    }
  }
}
