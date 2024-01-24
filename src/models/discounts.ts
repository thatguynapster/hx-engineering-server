import {
  Model,
  PaginateOptions,
  PaginateResult,
  Schema,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IDiscount } from "types";

export interface IDiscountDocument extends Model<IDiscount> {
  paginate: (
    query?: unknown,
    options?: PaginateOptions,
    callback?: (err: unknown, result: PaginateResult<IDiscount>) => void
  ) => Promise<PaginateResult<IDiscount>>;
}

const discountSchema = new Schema<IDiscount>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    is_dev: { type: Boolean, default: false },
  },
  { timestamps: true }
);

discountSchema.plugin(mongoosePaginate);

export const Discount = model<IDiscount, IDiscountDocument>(
  "Discount",
  discountSchema,
  "Discount"
);
