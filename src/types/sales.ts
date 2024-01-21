import { Types } from "mongoose";
import { IProduct } from "./products";

export type ISales = {
  _id: Types.ObjectId;
  products: IProduct["_id"][];
  discount: Types.ObjectId;
  is_dev: boolean;
};
