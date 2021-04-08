import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class BlockWordsCommand extends Command {
  cmdName = "blockwords";
  description = "Add/remove/list blocked words from the discord.";

  async run(message: Message, args: string[], ConfigDoc: DocumentType<Config>) {
    if (!args.length) {
      const blockedWords = ConfigDoc.blockedWords
        .map((word, i) => `${i + 1}. ${word}`)
        .join("\n");
      await message.channel.send(
        embeds.normal(`Blocked Words List`, blockedWords)
      );
    } else {
      if (!args.length)
        return message.channel.send(
          embeds.error(
            `Please provide words (seperate by space) to filter from chats.`
          )
        );

      const removeWords = args
        .map((x) => x.toLowerCase())
        .filter((word) => ConfigDoc.blockedWords.includes(word));
      const addWords = args
        .map((x) => x.toLowerCase())
        .filter((word) => !ConfigDoc.blockedWords.includes(word));

      ConfigDoc.blockedWords = ConfigDoc.blockedWords
        .map((x) => x.toLowerCase())
        .filter((word) => !removeWords.includes(word))
        .concat(addWords);
      await ConfigDoc.save();

      await message.channel.send(
        embeds.normal(
          `Blocked Words Edited`,
          `Added Words: \`${addWords.length ? addWords.join(", ") : `None`}\`
          Removed Words: \`${
            removeWords.length ? addWords.join(", ") : `None`
          }\``
        )
      );
    }
  }
}
