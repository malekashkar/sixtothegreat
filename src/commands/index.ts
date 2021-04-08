import { DocumentType } from "@typegoose/typegoose";
import { Message } from "discord.js";
import Client from "..";
import { Config } from "../models/config";

export default abstract class Command {
  aliases?: string[] = [];
  disabled = false;
  usage = "";
  adminPermissions = false;

  client: Client;

  abstract cmdName: string;
  abstract description: string;

  constructor(client: Client) {
    this.client = client;
  }

  abstract run(
    _message: Message,
    _args: string[],
    _configDocument: DocumentType<Config>
  ): Promise<Message | void>;
}
