import { getModelForClass, prop } from "@typegoose/typegoose";

export class Reaction {
  @prop()
  reaction: string;

  @prop()
  roleId: string;

  @prop()
  roleDescription: string;
}

export class ReactionRole {
  @prop()
  messageId: string;

  @prop({ type: Reaction })
  roles: Reaction[];
}

export const ReactionRoleModel = getModelForClass(ReactionRole);
