import { Schema, Document } from "mongoose";
import { ICategory } from "./categories";

export interface IProduct extends Document {
  _id: Schema.Types.ObjectId;
  category: string;
  category_details?: ICategory;
  details: string;
  features: { [key: string]: string | number };
  is_deleted: boolean;
  is_dev: boolean;
  images: string[];
  name: string;
  price: number;
  quantity: number;
}
