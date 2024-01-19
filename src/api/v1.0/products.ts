import express, { Express, NextFunction, Request, Response } from "express";
import multer from "multer";

import { upload_file } from "../../functions/upload-file";

const app: Express = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post(
  "/upload-product-image",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req as { file: Express.Multer.File };

      const upload_path = await upload_file(
        file,
        String(process.env.APPWRITE_PRODUCTS_BUCKET_ID)
      );

      res.json({
        success: true,
        message: "File Uploaded",
        code: 200,
        response: upload_path,
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default app;
