import { getModelForClass, index, plugin, prop } from "@typegoose/typegoose";
import { AutoIncrementID } from "@typegoose/auto-increment";

@plugin(AutoIncrementID, { field: "id", startAt: 1 })
@index({ id: 1 })
export class Suggestion {
  @prop()
  id: number;

  @prop()
  suggestion: string;

  @prop()
  messageId?: string;
}

export const SuggestionModel = getModelForClass(Suggestion);
