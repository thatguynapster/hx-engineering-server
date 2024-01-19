import { Schema, SchemaOptions, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { Product } from "../types";

const productSchema = new Schema<Product>(
  {
    category: { type: String },
    details: { type: String },
    features: { type: Map, of: Schema.Types.Mixed },
    images: { type: [String], required: true },
    is_dev: { type: Boolean, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

module.exports = model<Product>("Products", productSchema);
