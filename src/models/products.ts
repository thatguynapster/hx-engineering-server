import {
  InferSchemaType,
  Model,
  PaginateOptions,
  PaginateResult,
  Schema,
  model,
} from "mongoose"; // prettier-ignore
import mongoosePaginate from "mongoose-paginate-v2";

export type IProduct = InferSchemaType<typeof productSchema>;

export interface IProductDocument extends Model<IProduct> {
  paginate: (
    query?: unknown,
    options?: PaginateOptions,
    callback?: (err: unknown, result: PaginateResult<IProduct>) => void
  ) => Promise<PaginateResult<IProduct>>;
}

const productSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    category: { type: String },
    details: { type: String },
    features: { type: Schema.Types.Mixed },
    images: { type: [String], required: true },
    is_deleted: { type: Boolean, default: false },
    is_dev: { type: Boolean, default: false, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

export const Product = model<IProduct, IProductDocument>(
  "Products",
  productSchema,
  "Products"
);
