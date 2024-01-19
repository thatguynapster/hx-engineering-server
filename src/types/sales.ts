import { Types } from "mongoose";
import { Product } from "./products";

export type Sales = {
  _id: Types.ObjectId;
  products: Product["_id"][];
  discount: Types.ObjectId;
  is_dev: boolean;
};
