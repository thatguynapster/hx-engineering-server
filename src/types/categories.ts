import { Types } from "mongoose";

export type Category = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  is_dev: boolean;
};
