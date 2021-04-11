import { DocumentType } from "@typegoose/typegoose";
import { Message, TextChannel } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import { SuggestionModel } from "../../models/suggestion";
import embeds from "../../utils/embeds";

export default class SuggestCommand extends Command {
  cmdName = "suggest";
  description = "Submit a suggestion to the discord.";

  async run(message: Message, args: string[], configDoc: DocumentType<Config>) {
    const suggestion = args.join(" ");
    if (!suggestion)
      return message.channel.send(
        embeds.error(`Error: \`${config.prefix}suggest (suggestion)\``)
      );

    if (configDoc.channels?.suggestions) {
      const suggestionChannel = message.guild.channels.resolve(
        configDoc.channels.suggestions
      ) as TextChannel;
      if (suggestionChannel) {
        const suggestionData = await SuggestionModel.create({
          suggestion,
        });

        await message.channel.send(
          embeds
            .empty()
            .setDescription(
              `Your suggestion has been submitted in ${suggestionChannel.toString()}!`
            )
        );

        const suggestionMessage = await suggestionChannel.send(
          embeds.normal(`Suggestion #${suggestionData.id}`, suggestion)
        );
        await suggestionMessage.react("⬆️");
        await suggestionMessage.react("⬇️");

        suggestionData.messageId = suggestionMessage.id;
        await suggestionData.save();
      }
    } else {
      await message.channel.send(
        embeds.error(
          `Contact administration and let them know that no suggestion channel is set!`
        )
      );
    }
  }
}
