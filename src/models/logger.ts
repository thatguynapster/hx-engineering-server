import mongoosePaginate from "mongoose-paginate-v2";
import { Schema, model } from "mongoose";
import { ILog } from "types";

const logSchema = new Schema<ILog>(
  {
    message: { type: String },
    document_data: { type: Schema.Types.Mixed },
    event: { type: String },
  },
  { timestamps: true }
);

logSchema.plugin(mongoosePaginate);

export const Log = model<ILog>("Logs", logSchema, "Logs");
