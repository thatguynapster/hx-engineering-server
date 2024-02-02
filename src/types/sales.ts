import { Types } from "mongoose";
import { IProduct } from "./products";

export type ISales = {
  _id: Types.ObjectId;
  discount: string;
  is_dev: boolean;
  products: {
    _id: string;
    price: number;
    quantity: number;
    details?: IProduct;
  }[];
  price: number;
};
