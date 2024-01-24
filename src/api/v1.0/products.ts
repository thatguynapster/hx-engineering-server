import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import multer from "multer";

import { log_entry, upload_file } from "../../functions";
import { createProductSchema, updateProductSchema } from "../../validators";
import { ProductCollection } from "../../models";

const app: Express = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

// create product
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_body = await createProductSchema(req.body);

    // check if product exists
    const product_exists = await ProductCollection.findOne({
      name: product_body.name,
      $or: [
        {
          is_deleted: false,
        },
        {
          is_deleted: {
            $exists: false,
          },
        },
      ],
    }).lean();

    if (product_exists) {
      const e = new Error("Product with same name already exists");
      e.name = "AlreadyExists";
      throw e;
    }
    // END check if product exists

    let product = new ProductCollection({
      ...product_body,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    });

    product = (await product.save()).toObject();

    // log product entry
    await log_entry("product", product_body, "CREATE");
    // END log product entry

    res.status(200).json({
      success: true,
      message: "Done",
      code: 200,
      response: product,
    });
  } catch (err) {
    next(err);
  }
});

// get products
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as unknown as {
      limit: number;
      page: number;
    };

    const product_doc = await ProductCollection.paginate(
      { is_deleted: false, is_dev: process.env.NODE_ENV === "dev" },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!product_doc) {
      return res.status(204).json({
        success: false,
        message: "No products found",
        code: 204,
        response: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products found",
      code: 200,
      response: product_doc,
    });
  } catch (error) {
    next(error);
  }
});

//get single product
app.get(
  "/:product_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params as unknown as {
        product_id: string;
      };

      const product_doc = await ProductCollection.findOne({
        _id: product_id,
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!product_doc) {
        return res.status(204).json({
          success: false,
          message: "No products found",
          code: 204,
          response: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Products found",
        code: 200,
        response: product_doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

// update product
app.put(
  "/:product_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params;

      const product = await ProductCollection.findById(product_id).lean();

      if (!product) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      const product_body = await updateProductSchema(req.body);

      const product_doc = await ProductCollection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(String(product_id)) },
        product_body,
        { new: true }
      );

      if (!product_doc) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      // log product entry
      await log_entry("product", product_body, "UPDATE");
      // END log product entry

      return res.status(200).json({
        success: true,
        message: "Product updated",
        code: 200,
        response: product_doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

// delete product
app.delete(
  "/:product_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params;

      const product = await ProductCollection.findById(product_id).lean();

      if (!product) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      // check if product is already deleted
      const product_deleted = await ProductCollection.findOne({
        _id: new mongoose.Types.ObjectId(product_id),
        is_deleted: true,
      });
      if (product_deleted) {
        const error = new Error("Product already deleted");
        error.name = "AlreadyDeleted";
        throw error;
      }
      // END check if product is already deleted

      const product_doc = await ProductCollection.findOneAndUpdate(
        {
          _id: product_id,
        },
        {
          is_deleted: true,
        },
        { new: true }
      );

      if (!product_doc) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      // log product entry
      await log_entry("product", { _id: product_id }, "DELETE");
      // END log product entry

      return res.status(200).json({
        success: true,
        message: "Product deleted",
        code: 200,
        response: null,
      });
    } catch (error) {
      next(error);
    }
  }
);

// upload product image
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
