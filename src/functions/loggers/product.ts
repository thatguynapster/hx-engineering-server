import { LogsCollection } from "../../models";

export const log_product_entry = async (
  document_data: any,
  event: "CREATE" | "UPDATE" | "DELETE"
) => {
  return new Promise(async (resolve, reject) => {
    let message = "";
    switch (event) {
      case "CREATE":
        message = "Product created.";
        break;
      case "UPDATE":
        message = `Product updated`;
        break;
      case "DELETE":
        message = `Product deleted.`;
        break;
    }

    try {
      let log = new LogsCollection({
        message,
        document_data,
        event,
      });
      log = (await log.save()).toObject();
      resolve("Entry logged.");
    } catch (error) {
      reject(error);
    }
  });
};
