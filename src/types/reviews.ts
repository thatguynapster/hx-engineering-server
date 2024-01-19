import { Types } from "mongoose";
import { Product } from "./products";

export type Review = {
  _id: Types.ObjectId;
  text: string;
  product: Product["_id"];
  rating: number;
  is_dev: boolean;
};
