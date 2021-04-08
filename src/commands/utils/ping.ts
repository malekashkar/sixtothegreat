import { Message } from "discord.js";
import Command from "..";

export default class PingCommand extends Command {
  cmdName = "ping";
  description = "Check the ping of the discord bot to discord.";

  async run(message: Message) {
    const m = await message.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${
        m.createdTimestamp - message.createdTimestamp
      }ms. API Latency is ${Math.round(this.client.ws.ping)}ms`
    );
  }
}
