import { DocumentType } from "@typegoose/typegoose";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class BlockChannelsCommand extends Command {
  cmdName = "blockchannels";
  description = "Add/remove/list blocked channels from the discord.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    const pickQuestionMessage = await message.channel.send(
      embeds.question(
        `Would you like to add (🟢), remove (🔴), or list (🟡) the blocked channels?`
      )
    );

    await pickQuestionMessage.react("🟢");
    await pickQuestionMessage.react("🔴");
    await pickQuestionMessage.react("🟡");

    const pickCollector = pickQuestionMessage.createReactionCollector(
      (reaction: MessageReaction, user: User) =>
        ["🟢", "🟡", "🔴"].includes(reaction.emoji.name) &&
        user.id === message.author.id,
      {
        max: 1,
        time: 5 * 60e3,
      }
    );

    pickCollector.on("end", async (collected) => {
      if (pickQuestionMessage.deletable) await pickQuestionMessage.delete();
      const emoji = collected?.first()?.emoji?.name;
      if (emoji === "🟢") {
        grabChannels(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "ADD"
        );
      } else if (emoji === "🔴") {
        grabChannels(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "REMOVE"
        );
      } else {
        const blockedChannels = ConfigDoc.blockedChannels.map(
          (channelId, i) => `${i + 1}. <#${channelId}>`
        );
        if (!blockedChannels.length) {
          message.channel.send(
            embeds.error(`There are no blocked channels on the list currently.`)
          );
        } else {
          await message.channel.send(
            embeds.normal(`Blocked Channels List`, blockedChannels.join("\n"))
          );
        }
      }
    });
  }
}

async function grabChannels(
  channel: TextChannel,
  user: User,
  configDoc: DocumentType<Config>,
  type: "ADD" | "REMOVE"
) {
  const grabChannelsMessage = await channel.send(
    embeds.question(
      `Please tag the channels you would like to ${
        type === "ADD" ? `add to` : `remove from`
      } the list.`
    )
  );
  const collector = channel.createMessageCollector(
    (message: Message) =>
      message.author.id === user.id && message.mentions.channels.size >= 1,
    {
      max: 1,
      time: 5 * 60e3,
    }
  );

  collector.on("end", async (collected) => {
    if (grabChannelsMessage.deletable) await grabChannelsMessage.delete();
    const channels = collected?.first().mentions?.channels?.array();
    if (channels?.length) {
      await continueProcess(configDoc, channels, type, channel);
    }
  });
}

async function continueProcess(
  configDoc: DocumentType<Config>,
  channels: TextChannel[],
  type: "ADD" | "REMOVE",
  channel: TextChannel
) {
  if (type === "ADD") {
    configDoc.blockedChannels = configDoc.blockedChannels.concat(
      channels.map((x) => x.id)
    );
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Blocked Channels Edited`,
        `Added Channel(s): ${channels.join(", ")}`
      )
    );
  } else {
    configDoc.blockedChannels = configDoc.blockedChannels.filter(
      (channelId) => !channels.map((x) => x.id).includes(channelId)
    );
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Blocked Channels Edited`,
        `Removed Channel(s): ${channels.join(", ")}`
      )
    );
  }
}
