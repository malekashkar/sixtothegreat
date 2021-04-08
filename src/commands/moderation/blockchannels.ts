import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class BlockChannelsCommand extends Command {
  cmdName = "blockchannels";
  description = "Add/remove/list blocked words from the discord.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    if (!message.mentions.channels.size) {
      const blockedWords = ConfigDoc.blockedChannels
        .map((channelId, i) => `${i + 1}. <#${channelId}>`)
        .join("\n");
      await message.channel.send(
        embeds.normal(`Blocked Channels List`, blockedWords)
      );
    } else {
      const channels = message.mentions.channels.array();
      if (!channels.length)
        return message.channel.send(
          embeds.error(
            `Please tag channels where blocked words should be filtered.`
          )
        );

      const removeChannels = channels
        .filter((channel) => ConfigDoc.blockedChannels.includes(channel.id))
        .map((x) => x.id);

      const addChannels = channels
        .filter((channel) => !ConfigDoc.blockedChannels.includes(channel.id))
        .map((x) => x.id);

      ConfigDoc.blockedWords = ConfigDoc.blockedChannels
        .filter((channelId) => !removeChannels.includes(channelId))
        .concat(addChannels);
      await ConfigDoc.save();

      await message.channel.send(
        embeds.normal(
          `Blocked Channels Edited`,
          `Added Words: \`${
            addChannels.length
              ? addChannels.map((x) => `<#${x}>`).join(", ")
              : `None`
          }\`
          Removed Words: \`${
            removeChannels.length
              ? removeChannels.map((x) => `<#${x}>`).join(", ")
              : `None`
          }\``
        )
      );
    }
  }
}
