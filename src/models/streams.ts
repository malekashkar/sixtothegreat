import { getModelForClass, prop } from "@typegoose/typegoose";

export class Stream {
  @prop()
  streamId: string;
}

export const StreamModel = getModelForClass(Stream);
