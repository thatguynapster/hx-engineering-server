import { Client, Storage, ID, InputFile } from "node-appwrite";

export const upload_file = async (
  file: Express.Multer.File,
  bucket: string
) => {
  const client = new Client()
    .setEndpoint(String(process.env.APPWRITE_ENDPOINT))
    .setProject(String(process.env.APPWRITE_PROJECT_ID))
    .setKey(String(process.env.APPWRITE_API_KEY));

  const storage = new Storage(client);

  return new Promise(async (resolve, reject) => {
    const key = `${file.originalname.split(".")[0]}_${new Date().getTime()}.${
      file.originalname.split(".")[1]
    }`;

    // rename file
    file.originalname = key;

    const upload = storage.createFile(
      bucket,
      ID.unique(),
      InputFile.fromBuffer(file.buffer, key)
    );

    try {
      upload
        .then((response) => {
          resolve(
            `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${String(
              process.env.APPWRITE_PRODUCTS_BUCKET_ID
            )}/files/${response.$id}/preview?project=${String(
              process.env.APPWRITE_PROJECT_ID
            )}`
          );
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};
