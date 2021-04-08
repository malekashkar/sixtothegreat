import { DMChannel, TextChannel, User, UserManager } from "discord.js";
import config from "../config";
import embeds from "./embeds";

export function mcNameValidation(name: string) {
  if (name.includes(" ")) return false;
  const re = new RegExp(/[\w\d]{2,17}/m);
  const regexTest = re.test(name);
  if (!regexTest) return false;
  return true;
}

export function toTitleCase(str: string) {
  return str
    .split(" ")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
    .join(" ");
}

export async function askQuestion(
  channel: TextChannel,
  user: User,
  question: string
) {
  const questionMessage = await channel.send(embeds.question(question));
  const collector = await channel.awaitMessages(
    (m) => m.author.id === user.id,
    { max: 1, time: config.questionTime, errors: ["time"] }
  );

  await questionMessage.delete();
  if (collector) {
    await collector.first().delete();
    return collector.first().content;
  }
}

export async function deleteChannelMessages(channel: TextChannel) {
  const channelMessages = await channel.messages.fetch();
  if (channelMessages.size) {
    channel.bulkDelete(channelMessages);
  }
}

export async function dmAskQuestion(
  user: User,
  question: string,
  errorChannel: TextChannel
) {
  try {
    const dmChannel = await user.createDM();
    const questionMessage = await dmChannel.send(embeds.question(question));
    const collector = await dmChannel.awaitMessages(
      (m) => m.author.id === user.id,
      { max: 1, time: config.questionTime, errors: ["time"] }
    );

    await questionMessage.delete();
    if (collector) {
      await collector.first().delete();
      return collector.first().content;
    }
  } catch (err) {
    await errorChannel.send(
      embeds.error(
        `${user} DM's are currently closed, please tell them to open their DM's.`
      )
    );
  }
}
