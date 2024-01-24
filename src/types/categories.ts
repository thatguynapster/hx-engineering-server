import { Types } from "mongoose";

export type ICategory = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  is_deleted: boolean;
  is_dev: boolean;
};
