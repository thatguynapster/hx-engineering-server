import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { logEntry } from "../../functions";
import { createCategorySchema } from "../../validators";
import { CategoryCollection } from "../../models";

const app: Express = express();

// Create category
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryBody = await createCategorySchema(req.body);

    // Check if category exists
    const existingCategory = await CategoryCollection.findOne({
      name: categoryBody.name,
      is_deleted: { $ne: true },
    }).lean();

    if (existingCategory) {
      const error = new Error("Category with name already exists");
      error.name = "AlreadyExists";
      throw error;
    }

    const category = await new CategoryCollection({
      ...categoryBody,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    }).save();

    // Log category entry
    await logEntry("category", categoryBody, "CREATE");

    res.status(200).json({
      success: true,
      message: "Category created",
      response: category.toObject(),
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as {
      limit?: number;
      page?: number;
    };

    const categories = await CategoryCollection.paginate(
      {
        is_deleted: { $ne: true },
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!categories) {
      return res.status(204).json({
        success: false,
        message: "No categories found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Categories found",
      response: categories,
    });
  } catch (error) {
    next(error);
  }
});

// Get single category
app.get(
  "/:category_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category_id } = req.params;

      const category = await CategoryCollection.findOne({
        _id: category_id,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!category) {
        return res.status(204).json({
          success: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Category found",
        response: category,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete category
app.delete(
  "/:category_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category_id } = req.params;

      const category = await CategoryCollection.findOneAndUpdate(
        {
          _id: category_id,
          is_deleted: { $ne: true },
        },
        { is_deleted: true },
        { new: true }
      );

      if (!category) {
        const error = new Error("Category not found");
        error.name = "NotFound";
        throw error;
      }

      // Log category entry
      await logEntry("category", { _id: category_id }, "DELETE");

      res.status(200).json({
        success: true,
        message: "Category deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
