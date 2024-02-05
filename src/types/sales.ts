import { Types } from "mongoose";
import { IProduct } from "./products";
import { IDiscount } from "./discounts";

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
  discount_details?: IDiscount;
};
