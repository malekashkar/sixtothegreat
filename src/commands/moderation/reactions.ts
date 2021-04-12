import { DocumentType } from "@typegoose/typegoose";
import { stripIndents } from "common-tags";
import { Message, MessageReaction, TextChannel, User } from "discord.js";
import Command from "..";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class ReactionsCommand extends Command {
  cmdName = "reactions";
  description = "Add/remove/list reaction roles to the roles message.";
  adminPermissions = true;

  async run(
    message: Message,
    _args: string[],
    ConfigDoc: DocumentType<Config>
  ) {
    const pickQuestionMessage = await message.channel.send(
      embeds.question(
        `Would you like to add (🟢), remove (🔴), or list (🟡) the reaction roles?`
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
        collectInformation(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "ADD"
        );
      } else if (emoji === "🔴") {
        collectInformation(
          message.channel as TextChannel,
          message.author,
          ConfigDoc,
          "REMOVE"
        );
      } else {
        const roles = ConfigDoc.reactionRoles.map(
          (roleInfo) => `${roleInfo.reaction} ~ <@&${roleInfo.roleId}>`
        );
        if (!roles.length) {
          message.channel.send(
            embeds.error(`There are no reaction roles on the list currently.`)
          );
        } else {
          await message.channel.send(
            embeds.normal(`Reaction Roles List`, roles.join("\n\n"))
          );
        }
      }
    });
  }
}

async function collectInformation(
  channel: TextChannel,
  user: User,
  configDoc: DocumentType<Config>,
  type: "ADD" | "REMOVE"
) {
  const grabInformation = await channel.send(
    embeds
      .question(
        `Please provied the role information that you would like to ${
          type === "ADD" ? `add to` : `remove from`
        } the list.`
      )
      .setDescription(
        `**Adding A Role** :smile: @role This is the description of the reaction role.\n**Removing Roles** @role1 @role2 @role3`
      )
  );
  const collector = channel.createMessageCollector(
    (message: Message) =>
      message.author.id === user.id && message.mentions.roles.size >= 1,
    {
      max: 1,
      time: 5 * 60e3,
    }
  );

  collector.on("end", async (collected) => {
    if (grabInformation.deletable) await grabInformation.delete();
    const information = collected?.first();
    if (information) {
      await continueProcess(configDoc, information, type, channel);
    }
  });
}

async function continueProcess(
  configDoc: DocumentType<Config>,
  information: Message,
  type: "ADD" | "REMOVE",
  channel: TextChannel
) {
  if (type === "ADD") {
    const splitContent = information?.content?.split(" ");
    const reaction = splitContent.shift();
    const roleId = information.mentions.roles.first().id;
    splitContent.shift();
    const roleDescription = splitContent.join(" ");

    configDoc.reactionRoles.push({
      reaction,
      roleId,
      roleDescription,
    });
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Reaction Roles Edited`,
        `Added Role: ${information.mentions.roles.first()}`
      )
    );
  } else {
    const roles = information.mentions.roles.map((x) => x.id);
    configDoc.reactionRoles = configDoc.reactionRoles.filter(
      (reactionRole) => !roles.includes(reactionRole.roleId)
    );
    await configDoc.save();

    await channel.send(
      embeds.normal(
        `Reaction Roles Edited`,
        `Removed Role(s): ${roles.join(", ")}`
      )
    );
  }

  if (configDoc.channels?.roles && configDoc.messageIds?.roles) {
    const formattedRoles = configDoc.reactionRoles
      .map(
        (roleInfo) =>
          `${roleInfo.reaction} <@&${roleInfo.roleId}> ~ ${roleInfo.roleDescription}`
      )
      .join("\n\n");
    const reactionRolesChannel = channel.guild.channels.resolve(
      configDoc.channels.roles
    ) as TextChannel;
    if (reactionRolesChannel) {
      const msg = await reactionRolesChannel.messages.fetch(
        configDoc.messageIds.roles
      );
      if (msg) {
        await msg.edit(embeds.normal(`React to get a role!`, formattedRoles));
      } else {
        await reactionRolesChannel.send(
          embeds.normal(`React to get a role!`, formattedRoles)
        );
      }
    }
  }
}
