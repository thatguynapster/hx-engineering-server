import { Schema, SchemaOptions, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { IProduct } from "../types";

const productSchema = new Schema<IProduct>(
  {
    category: { type: String },
    details: { type: String },
    features: { type: Map, of: Schema.Types.Mixed },
    images: { type: [String], required: true },
    is_deleted: { type: Boolean },
    is_dev: { type: Boolean, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

export const Product = model<IProduct>("Products", productSchema, "Products");
