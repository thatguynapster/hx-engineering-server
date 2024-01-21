import { Types } from "mongoose";

export type IProduct = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  details: string;
  images: string[];
  features: { [key: string]: string | number };
  category: string;
  quantity: number;
  is_deleted: boolean;
  is_dev: boolean;
};
