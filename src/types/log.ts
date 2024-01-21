import { Types } from "mongoose";

export type ILog = {
  _id: Types.ObjectId;
  message: string;
  document_data: any;
  event: "CREATE" | "UPDATE" | "DELETE";
};
