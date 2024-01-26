import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { createDiscountSchema } from "../../validators";
import { DiscountCollection } from "../../models";
import { logEntry } from "../../functions";

const app: Express = express();

// Create discount
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discountBody = await createDiscountSchema(req.body);

    // Check if discount exists
    const existingDiscount = await DiscountCollection.findOne({
      code: discountBody.code,
      is_deleted: { $ne: true },
    });

    if (existingDiscount) {
      const error = new Error(`Discount with this code already exists`);
      error.name = "AlreadyExists";
      throw error;
    }

    const discount = await new DiscountCollection({
      ...discountBody,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    }).save();

    // Log discount entry
    await logEntry("discount", discountBody, "CREATE");

    res.status(200).json({
      success: true,
      message: "Discount created",
      response: discount.toObject(),
    });
  } catch (error) {
    next(error);
  }
});

// Get discounts
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as {
      limit?: number;
      page?: number;
    };

    const discounts = await DiscountCollection.paginate(
      {
        is_deleted: { $ne: true },
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!discounts) {
      return res.status(204).json({
        success: false,
        message: "No discounts found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Discounts found",
      response: discounts,
    });
  } catch (error) {
    next(error);
  }
});

// Get single discount
app.get(
  "/:discount_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { discount_id } = req.params;

      const discount = await DiscountCollection.findOne({
        _id: discount_id,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!discount) {
        return res.status(204).json({
          success: false,
          message: "Discount not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Discount found",
        response: discount,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete discount
app.delete(
  "/:discount_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { discount_id } = req.params;

      const deletedDiscount = await DiscountCollection.findOneAndUpdate(
        {
          _id: discount_id,
          is_deleted: { $ne: true },
        },
        { is_deleted: true },
        { new: true }
      );

      if (!deletedDiscount) {
        const error = new Error("Discount not found");
        error.name = "NotFound";
        throw error;
      }

      // Log discount entry
      await logEntry("discount", { _id: discount_id }, "DELETE");

      res.status(200).json({
        success: true,
        message: "Discount deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
