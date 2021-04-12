import { DocumentType } from "@typegoose/typegoose";
import { Message, TextChannel } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class ConfigCommand extends Command {
  cmdName = "config";
  description = "Configurate some of the options included in the bot.";

  async run(message: Message, args: string[], configDoc: DocumentType<Config>) {
    const configOptions = [
      "suggestion_channel",
      "verification_role",
      "verification_message",
      "welcome_message",
      "rules_message",
      "twitch_notification_channel",
      "twitch_notification_role",
    ];
    const chosenOption = configOptions.includes(args[0]?.toLowerCase())
      ? args.shift().toLowerCase()
      : null;

    if (chosenOption === "suggestion_channel") {
      const channel = message.mentions.channels.first();
      if (!channel)
        return message.channel.send(
          embeds.error(`Please tag a channel for suggestions.`)
        );

      if (configDoc.channels) {
        configDoc.channels.suggestions = channel.id;
      } else {
        configDoc.channels = {
          suggestions: channel.id,
        };
      }
      await configDoc.save();

      await message.channel.send(
        embeds.normal(
          `Suggestion Channel Configuration Set`,
          `The suggestion channel has been set to ${channel}.`
        )
      );
    } else if (chosenOption === "verification_role") {
      const role = message.mentions.roles.first();
      if (!role)
        return message.channel.send(
          embeds.error(
            `Please provide the role you would like to be given upon verification.`
          )
        );

      if (configDoc.roles) {
        configDoc.roles.verificationRole = role.id;
      } else {
        configDoc.roles = {
          verificationRole: role.id,
        };
      }
      await configDoc.save();

      await message.channel.send(
        embeds.normal(
          `Verification Role Updated`,
          `The verification role has been updated to ${role}.`
        )
      );
    } else if (chosenOption === "verification_message") {
      const templateMessage = args.join(" ");
      if (!templateMessage)
        return message.channel.send(
          embeds.error(`Please provide the template message for verification!`)
        );

      if (configDoc.messageTemplate) {
        configDoc.messageTemplate.verification = templateMessage;
      } else {
        configDoc.messageTemplate = {
          verification: templateMessage,
        };
      }
      await configDoc.save();

      if (
        configDoc.channels?.verification &&
        configDoc.messageIds?.verification
      ) {
        const channel = message.guild.channels.resolve(
          configDoc.channels.verification
        ) as TextChannel;
        if (channel) {
          const msg = await channel.messages.fetch(
            configDoc.messageIds.verification
          );
          if (msg) {
            await msg.edit(
              embeds.normal(
                `Verification`,
                configDoc.messageTemplate.verification
              )
            );
          } else {
            await channel.send(
              embeds.normal(
                `Verification`,
                configDoc.messageTemplate.verification
              )
            );
          }
        }
      }

      await message.channel.send(
        embeds.normal(
          `Verification Message Set`,
          `The verification message has been set to:\n\`\`\`\n${templateMessage}\`\`\``
        )
      );
    } else if (chosenOption === "welcome_message") {
      const templateMessage = args.join(" ");
      if (!templateMessage)
        return message.channel.send(
          embeds.error(`Please provide the template message for welcoming!`)
        );

      if (configDoc.messageTemplate) {
        configDoc.messageTemplate.welcome = templateMessage;
      } else {
        configDoc.messageTemplate = {
          welcome: templateMessage,
        };
      }
      await configDoc.save();

      if (configDoc.channels?.welcome && configDoc.messageIds?.welcome) {
        const channel = message.guild.channels.resolve(
          configDoc.channels.welcome
        ) as TextChannel;
        if (channel) {
          const msg = await channel.messages.fetch(
            configDoc.messageIds.welcome
          );
          if (msg) {
            await msg.edit(
              embeds.normal(`Welcome`, configDoc.messageTemplate.welcome)
            );
          } else {
            await channel.send(
              embeds.normal(`Welcome`, configDoc.messageTemplate.welcome)
            );
          }
        }
      }

      await message.channel.send(
        embeds.normal(
          `Welcome Message Set`,
          `The welcome message has been set to:\n\`\`\`\n${templateMessage}\`\`\``
        )
      );
    } else if (chosenOption === "rules_message") {
      const templateMessage = args.join(" ");
      if (!templateMessage)
        return message.channel.send(
          embeds.error(`Please provide the template message for the rules!`)
        );

      if (configDoc.messageTemplate) {
        configDoc.messageTemplate.rules = templateMessage;
      } else {
        configDoc.messageTemplate = {
          rules: templateMessage,
        };
      }
      await configDoc.save();

      if (configDoc.channels?.rules && configDoc.messageIds?.rules) {
        const channel = message.guild.channels.resolve(
          configDoc.channels.rules
        ) as TextChannel;
        if (channel) {
          const msg = await channel.messages.fetch(configDoc.messageIds.rules);
          if (msg) {
            await msg.edit(
              embeds.normal(`Rules`, configDoc.messageTemplate.rules)
            );
          } else {
            await channel.send(
              embeds.normal(`Rules`, configDoc.messageTemplate.rules)
            );
          }
        }
      }

      await message.channel.send(
        embeds.normal(
          `Rules Message Set`,
          `The rules message has been set to:\n\`\`\`\n${templateMessage}\`\`\``
        )
      );
    } else if (chosenOption === "twitch_notification_channel") {
      const channel = message.mentions.channels.first();
      if (!channel)
        return message.channel.send(
          embeds.error(
            `Please tag the channel you would like to set the notifications to go to.`
          )
        );

      if (configDoc.channels) {
        configDoc.channels.twitchNotifications = channel.id;
      } else {
        configDoc.channels = {
          twitchNotifications: channel.id,
        };
      }
      await configDoc.save();

      await message.channel.send(
        embeds.normal(
          `Notifications Channel Set`,
          `The channel ${channel} will receive notifications when a streamer goes live.`
        )
      );
    } else if (chosenOption === "twitch_notification_role") {
      const role = message.mentions.roles.first();
      if (!role)
        return message.channel.send(
          embeds.error(
            `Please tag the role you would like to set the notifications to ping.`
          )
        );

      if (configDoc.roles) {
        configDoc.roles.notificationRole = role.id;
      } else {
        configDoc.roles = {
          notificationRole: role.id,
        };
      }
      await configDoc.save();

      await message.channel.send(
        embeds.normal(
          `Notifications Role Set`,
          `The role ${role} will be pinged when streamers go live.`
        )
      );
    } else {
      await message.channel.send(
        embeds.error(
          `Please provide one of the following options to config: \`${configOptions.join(
            ", "
          )}\``
        )
      );
    }
  }
}
