import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { log_entry } from "../../functions";
import { createCategorySchema } from "../../validators";
import { CategoryCollection } from "../../models";

const app: Express = express();

// create category
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category_body = await createCategorySchema(req.body);

    // check if category exists
    const category_exists = await CategoryCollection.findOne({
      name: category_body.name,
      $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
    }).lean();

    if (category_exists) {
      const e = new Error("Category with name already exists");
      e.name = "AlreadyExists";
      throw e;
    }
    // END check if category exists

    let category = new CategoryCollection({
      ...category_body,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    });
    category = (await category.save()).toObject();

    // log category entry
    await log_entry("category", category_body, "CREATE");
    // END log category entry

    res.status(200).json({
      success: true,
      message: "Done",
      code: 200,
      response: category,
    });
  } catch (error) {
    next(error);
  }
});

// get categories
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as unknown as {
      limit: number;
      page: number;
    };

    const category_doc = await CategoryCollection.paginate(
      {
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!category_doc) {
      return res.status(200).json({
        success: false,
        message: "No category found",
        code: 204,
        response: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories found",
      code: 200,
      response: category_doc,
    });
  } catch (error) {
    next(error);
  }
});

// get single category
app.get(
  "/:category_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category_id } = req.params as unknown as {
        category_id: string;
      };

      const category_doc = await CategoryCollection.findOne({
        _id: category_id,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!category_doc) {
        return res.status(200).json({
          success: false,
          message: "Category not found",
          code: 204,
          response: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category found",
        code: 200,
        response: category_doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

// delete category
app.delete(
  "/:category_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category_id } = req.params;

      //check if product is already deleted
      const category_deleted = await CategoryCollection.findOne({
        _id: new mongoose.Types.ObjectId(category_id),
        is_deleted: true,
      });
      if (category_deleted) {
        const error = new Error("Category already deleted");
        error.name = "AlreadyDeleted";
        throw error;
      }
      // END check if category is already deleted

      const category_doc = await CategoryCollection.findOneAndUpdate(
        {
          _id: category_id,
        },
        { is_deleted: true },
        {
          new: true,
        }
      );

      if (!category_doc) {
        const error = new Error("Category not found");
        error.name = "NotFound";
        throw error;
      }

      // log category entry
      await log_entry("category", { _id: category_id }, "DELETE");
      // END log category entry

      return res.status(200).json({
        success: true,
        message: "Category deleted",
        code: 200,
        response: null,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
