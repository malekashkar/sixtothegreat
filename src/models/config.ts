import { getModelForClass, prop } from "@typegoose/typegoose";

export class Channels {
  @prop()
  twitchNotifications?: string;

  @prop()
  suggestions?: string;
}

export class MessageTemplates {
  @prop()
  verification?: string;

  @prop()
  welcome?: string;

  @prop()
  rules?: string;
}

export class MessageIds {
  @prop()
  verificationMessageId?: string;
}

export class Roles {
  @prop()
  verificationRole?: string;

  @prop()
  notificationRole?: string;
}

export class Config {
  @prop()
  guildId: string;

  @prop({ type: String, default: [] })
  blockedChannels?: string[];

  @prop({ type: String, default: [] })
  blockedWords?: string[];

  @prop({ type: String, default: [] })
  streamers?: string[];

  @prop({ type: Channels })
  channels?: Channels;

  @prop({ type: MessageTemplates })
  messageTemplate?: MessageTemplates;

  @prop({ type: MessageIds })
  messageIds?: MessageIds;

  @prop({ type: Roles })
  roles?: Roles;
}

export const ConfigModel = getModelForClass(Config);
