import { Types } from "mongoose";
import { IProduct } from "./products";

export type IReview = {
  _id: Types.ObjectId;
  text: string;
  product: string;
  rating: number;
  is_dev: boolean;
};
