import { getModelForClass, prop } from "@typegoose/typegoose";

export class Channels {
  @prop()
  twitchNotifications?: string;

  @prop()
  suggestions?: string;

  @prop()
  welcome?: string;

  @prop()
  rules?: string;

  @prop()
  roles?: string;

  @prop()
  verification?: string;
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
  verification?: string;

  @prop()
  suggestions?: string;

  @prop()
  welcome?: string;

  @prop()
  rules?: string;

  @prop()
  roles?: string;
}

export class Roles {
  @prop()
  verificationRole?: string;

  @prop()
  notificationRole?: string;
}

export class Reactions {
  @prop()
  reaction: string;

  @prop()
  roleId: string;

  @prop()
  roleDescription: string;
}

export class Config {
  @prop()
  guildId: string;

  /////////////////////////////

  @prop({ type: String, default: [] })
  blockedChannels?: string[];

  @prop({ type: String, default: [] })
  blockedWords?: string[];

  @prop({ type: String, default: [] })
  streamers?: string[];

  @prop({ type: Reactions, default: [] })
  reactionRoles?: Reactions[];

  /////////////////////////////

  @prop({ type: Channels, default: {} })
  channels?: Channels;

  @prop({ type: MessageTemplates, default: {} })
  messageTemplate?: MessageTemplates;

  @prop({ type: MessageIds, default: {} })
  messageIds?: MessageIds;

  @prop({ type: Roles, default: {} })
  roles?: Roles;
}

export const ConfigModel = getModelForClass(Config);
