import { DocumentType } from "@typegoose/typegoose";
import { Message, TextChannel } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import { SuggestionModel } from "../../models/suggestion";
import embeds from "../../utils/embeds";

export default class ApproveCommand extends Command {
  cmdName = "approve";
  description = "Approve one of the suggestions by their message ID.";
  adminPermissions = true;

  async run(message: Message, args: string[], configDoc: DocumentType<Config>) {
    const suggestionId = !isNaN(parseInt(args[0]))
      ? parseInt(args.shift())
      : null;
    if (!suggestionId)
      return message.channel.send(
        embeds.error(`Please provide the ID of the suggestion!`)
      );

    const reason = args.join(" ");
    if (!reason)
      return message.channel.send(
        embeds.error(`Please provide a reason for accepting this suggestion.`)
      );

    const suggestionData = await SuggestionModel.findOne({
      id: suggestionId,
    });
    if (!suggestionData)
      return message.channel.send(
        embeds.error(
          `There was no suggestion found with the ID \`${suggestionId}\`.`
        )
      );

    if (configDoc.channels?.suggestions) {
      const suggestionChannel = message.guild.channels.resolve(
        configDoc.channels.suggestions
      ) as TextChannel;
      if (suggestionChannel) {
        const suggestionMessage = await suggestionChannel.messages.fetch(
          suggestionData.messageId
        );
        const embed = embeds
          .normal(
            `Suggestion #${suggestionData.id} | Approved`,
            suggestionData.suggestion
          )
          .setColor("GREEN");
        if (suggestionMessage) {
          await suggestionMessage.edit(embed);
        } else {
          await suggestionChannel.send(embed);
        }

        await message.channel.send(
          embeds.normal(
            `Suggestion Approved`,
            `The suggestion \`#${suggestionId}\` has been approved.`
          )
        );
      }
    }
  }
}
