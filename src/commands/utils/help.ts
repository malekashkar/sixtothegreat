import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import embeds from "../../utils/embeds";

export default class HelpCommand extends Command {
  cmdName = "help";
  description = "Get a detailed list of all the available commands.";

  async run(message: Message) {
    const filteredRoles = this.client.commands.filter((commandObj) =>
      !commandObj.disabled && commandObj.adminPermissions
        ? message.member.hasPermission("ADMINISTRATOR")
        : true
    );
    const description = filteredRoles
      .map(
        (commandObj) =>
          `**${config.prefix + commandObj.cmdName}** ~ ` +
          commandObj.description
      )
      .join("\n");

    await message.channel.send(embeds.normal(`Help Menu`, description));
  }
}
