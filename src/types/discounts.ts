import { Types } from "mongoose";

export type IDiscount = {
  _id: Types.ObjectId;
  name: string;
  code: string;
  is_deleted: boolean;
  is_dev: boolean;
};
