import { Message } from "discord.js";
import Command from "..";

export default class SayCommand extends Command {
  cmdName = "say";
  description = "Send a message from the bot into a channel.";
  adminPermissions = true;

  async run(message: Message, args: string[]) {
    if (args.length) await message.channel.send(args.join(" "));
  }
}
