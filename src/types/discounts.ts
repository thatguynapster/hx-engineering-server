import { Types } from "mongoose";

export type IDiscount = {
  _id: Types.ObjectId;
  name: string;
  code: string;
  is_dev: boolean;
};
