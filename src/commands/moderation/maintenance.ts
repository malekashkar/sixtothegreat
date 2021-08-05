import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Command from "..";
import config from "../../config";
import { Config } from "../../models/config";
import embeds from "../../utils/embeds";

export default class MaintenanceCommand extends Command {
  cmdName = "maintenance";
  description = "Turn maintenance mode on or off.";
  adminPermissions = true;

  async run(message: Message, args: string[], configDoc: DocumentType<Config>) {
    const dreamersRole = message.guild.roles.cache.get(config.roles.dreamers);
    message.guild.channels.cache.forEach(async(channel) => {
      await channel.createOverwrite(dreamersRole, {
        SEND_MESSAGES: !configDoc.maintenance
      });
    });

    configDoc.maintenance = !configDoc.maintenance;
    await configDoc.save();

    message.channel.send(
      embeds.normal("Maintenance Toggled", `Maintenance mode has been turned **${!configDoc.maintenance ? "on" : "off"}**.`)
    );
  }
}
