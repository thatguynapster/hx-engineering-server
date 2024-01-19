import { Types } from "mongoose";

export type Discount = {
  _id: Types.ObjectId;
  name: string;
  code: string;
  is_dev: boolean;
};
