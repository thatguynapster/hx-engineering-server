import express, { Express, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";

import { createProductSchema, updateProductSchema } from "../../validators";
import { CategoryCollection, ProductCollection } from "../../models";
import { logEntry, upload_file } from "../../functions";
import { ICategory, IProduct } from "types";

const app: Express = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Create product
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productBody = await createProductSchema(req.body);

    const existingProduct = await ProductCollection.findOne({
      name: productBody.name,
      is_deleted: { $ne: true },
    });

    if (existingProduct) {
      const error = new Error("Product with the same name already exists");
      error.name = "AlreadyExists";
      throw error;
    }

    const product = await new ProductCollection({
      ...productBody,
      _id: new mongoose.Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    }).save();

    await logEntry("product", productBody, "CREATE");

    res.status(200).json({
      success: true,
      message: "Product created",
      response: product.toObject(),
    });
  } catch (error) {
    next(error);
  }
});

// Get products
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      limit = 10,
      page = 1,
      category_details = false,
    } = req.query as {
      category_details?: boolean;
      limit?: number;
      page?: number;
    };

    const products = await ProductCollection.paginate(
      { is_deleted: false, is_dev: process.env.NODE_ENV === "dev" },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    // get category details for each product
    if (category_details) {
      products.docs = await Promise.all(
        products.docs.map(async (product: IProduct) => {
          try {
            const categoryDetails = (await CategoryCollection.findOne({
              _id: product.category,
            }).lean()) as ICategory;
            product.category_details = categoryDetails;
            return product;
          } catch (error) {
            console.error("Error fetching category details:", error);
            return product;
          }
        })
      );
    }

    if (!products) {
      return res.status(204).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products found",
      response: products,
    });
  } catch (error) {
    next(error);
  }
});

// Get single product
app.get(
  "/:product_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params;
      const { category_details = false } = req.query as {
        category_details?: boolean;
      };

      const product = await ProductCollection.findOne({
        _id: product_id,
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      }).lean();

      if (!product) {
        return res.status(204).json({
          success: false,
          message: "Product not found",
        });
      }

      // get category details
      if (category_details) {
        const categoryDetails = (await CategoryCollection.findOne({
          _id: product.category,
        }).lean()) as ICategory;
        product.category_details = categoryDetails;
      }

      res.status(200).json({
        success: true,
        message: "Product found",
        response: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update product
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

      const productBody = await updateProductSchema(req.body);

      const updatedProduct = await ProductCollection.findOneAndUpdate(
        { _id: product_id },
        productBody,
        { new: true }
      );

      if (!updatedProduct) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      await logEntry("product", productBody, "UPDATE");

      res.status(200).json({
        success: true,
        message: "Product updated",
        response: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product
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

      const deletedProduct = await ProductCollection.findOneAndUpdate(
        { _id: product_id },
        { is_deleted: true },
        { new: true }
      );

      if (!deletedProduct) {
        const error = new Error("Product not found");
        error.name = "NotFound";
        throw error;
      }

      await logEntry("product", { _id: product_id }, "DELETE");

      res.status(200).json({
        success: true,
        message: "Product deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload product image
app.post(
  "/upload-product-image",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req as { file: Express.Multer.File };

      const uploadPath = await upload_file(
        file,
        String(process.env.APPWRITE_PRODUCTS_BUCKET_ID)
      );

      res.json({
        success: true,
        message: "File uploaded",
        response: uploadPath,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
