import {
  Model,
  PaginateOptions,
  PaginateResult,
  Schema,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ISales } from "types";

export interface ISalesDocument extends Model<ISales> {
  paginate: (
    query?: unknown,
    options?: PaginateOptions,
    callback?: (err: unknown, result: PaginateResult<ISales>) => void
  ) => Promise<PaginateResult<ISales>>;
}

const saleSchema = new Schema<ISales>(
  {
    discount: { type: String, default: null },
    is_dev: { type: Boolean, default: false },
    products: [
      {
        _id: { type: String, required: true },
        price: { type: Number },
        quantity: { type: Number },
      },
    ],
    price: { type: Number },
  },
  { timestamps: true }
);

saleSchema.plugin(mongoosePaginate);

export const Sale = model<ISales, ISalesDocument>("Sales", saleSchema, "Sales");
