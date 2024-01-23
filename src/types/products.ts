import { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  _id: Schema.Types.ObjectId;
  category: string;
  details: string;
  features: { [key: string]: string | number };
  is_deleted: boolean;
  is_dev: boolean;
  images: string[];
  name: string;
  price: number;
  quantity: number;
}
