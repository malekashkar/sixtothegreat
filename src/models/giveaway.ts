import { getModelForClass, prop } from "@typegoose/typegoose";

export class Giveaway {
  @prop()
  guildId: string;

  @prop()
  channelId: string;

  @prop()
  messageId: string;

  @prop()
  endTime: number;

  @prop()
  winners: number;

  @prop()
  prize: string;
}

export const GiveawayModel = getModelForClass(Giveaway);
