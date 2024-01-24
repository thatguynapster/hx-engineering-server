import {
  Model,
  PaginateOptions,
  PaginateResult,
  Schema,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ICategory } from "types";

export interface ICategoryDocument extends Model<ICategory> {
  paginate: (
    query?: unknown,
    options?: PaginateOptions,
    callback?: (err: unknown, result: PaginateResult<ICategory>) => void
  ) => Promise<PaginateResult<ICategory>>;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    is_dev: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.plugin(mongoosePaginate);

export const Category = model<ICategory, ICategoryDocument>(
  "Categories",
  categorySchema,
  "Categories"
);
