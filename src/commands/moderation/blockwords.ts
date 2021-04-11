import { DocumentType } from "@typegoose/typegoose";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class BlockWordsCommand extends Command {
  cmdName = "blockwords";
  description = "Add/remove/list blocked words from the discord.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    const pickQuestionMessage = await message.channel.send(
      embeds.question(
        `Would you like to add (🟢), remove (🔴), or list (🟡) the blocked words?`
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
        grabWords(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "ADD"
        );
      } else if (emoji === "🔴") {
        grabWords(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "REMOVE"
        );
      } else {
        const blockedWords = ConfigDoc.blockedWords.map(
          (word, i) => `${i + 1}. ${word}`
        );
        if (!blockedWords.length) {
          message.channel.send(
            embeds.error(`There are no blocked words on the list currently.`)
          );
        } else {
          await message.channel.send(
            embeds.normal(`Blocked Words List`, blockedWords.join("\n"))
          );
        }
      }
    });
  }
}

async function grabWords(
  channel: TextChannel,
  user: User,
  configDoc: DocumentType<Config>,
  type: "ADD" | "REMOVE"
) {
  const grabWordsMessage = await channel.send(
    embeds.question(
      `Please enter the words seperated by a space to ${
        type === "ADD" ? `add to` : `remove from`
      } the list.`
    )
  );
  const collector = channel.createMessageCollector(
    (message: Message) => message.author.id === user.id,
    {
      max: 1,
      time: 5 * 60e3,
    }
  );

  collector.on("end", async (collected) => {
    if (grabWordsMessage.deletable) await grabWordsMessage.delete();
    if (collected?.first().content) {
      const seperatedWords = collected?.first().content.split(" ");
      await continueProcess(configDoc, seperatedWords, type, channel);
    }
  });
}

async function continueProcess(
  configDoc: DocumentType<Config>,
  words: string[],
  type: "ADD" | "REMOVE",
  channel: TextChannel
) {
  if (type === "ADD") {
    configDoc.blockedWords = configDoc.blockedWords.concat(words);
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Blocked Words Edited`,
        `Added Word(s): \`${words.join(", ")}\``
      )
    );
  } else {
    configDoc.blockedWords = configDoc.blockedWords.filter(
      (word) => !words.includes(word)
    );
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Blocked Words Edited`,
        `Removed Word(s): \`${words.join(", ")}\``
      )
    );
  }
}
