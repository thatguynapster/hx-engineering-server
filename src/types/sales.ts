import { Types } from "mongoose";
import { IProduct } from "./products";

export type ISales = {
  _id: Types.ObjectId;
  discount: string;
  is_dev: boolean;
  products: string[];
  price: number;
};
