import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { createDiscountSchema } from "../../validators";
import { DiscountCollection } from "../../models";
import { log_entry } from "../../functions";

const app: Express = express();

// create discount
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discount_body = await createDiscountSchema(req.body);

    // check if discount exists
    const discount_exists = await DiscountCollection.findOne({
      name: discount_body.name,
      $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }],
    });

    if (discount_exists) {
      const e = new Error(`Discount with this name already exists`);
      e.name = "AlreadyExists";
      throw e;
    }
    // END check if discount exists

    let discount = new DiscountCollection({
      ...discount_body,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    });
    discount = (await discount.save()).toObject();

    // log product entry
    await log_entry("discount", discount_body, "CREATE");
    // END log product entry

    res.status(200).json({
      success: true,
      message: "Done",
      code: 200,
      response: discount,
    });
  } catch (error) {
    next(error);
  }
});

// get discounts
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as unknown as {
      limit: number;
      page: number;
    };

    const discount_doc = await DiscountCollection.paginate(
      {
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!discount_doc) {
      return res.status(204).json({
        success: false,
        message: "No discounts found",
        code: 204,
        response: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Discounts found",
      code: 200,
      response: discount_doc,
    });
  } catch (error) {
    next(error);
  }
});

// get single discount
app.get(
  "/:discount_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { discount_id } = req.params;

      const discount_doc = await DiscountCollection.findOne({
        _id: discount_id,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!discount_doc) {
        return res.status(204).json({
          success: false,
          message: "Discount not found",
          code: 204,
          response: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Discount found",
        code: 200,
        response: discount_doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

// delete discount
app.delete(
  "/:discount_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { discount_id } = req.params;

      // check if discount is already deleted
      const discount_deleted = await DiscountCollection.findOne({
        _id: new mongoose.Types.ObjectId(discount_id),
        is_deleted: true,
      });
      if (discount_deleted) {
        const error = new Error("Discount already deleted");
        error.name = "AlreadyDeleted";
        throw error;
      }
      // END check if discount is already deleted

      const discount_doc = await DiscountCollection.findOneAndUpdate(
        {
          _id: discount_id,
        },
        { is_deleted: true },
        {
          new: true,
        }
      );

      if (!discount_doc) {
        const error = new Error("Discount not found");
        error.name = "NotFound";
        throw error;
      }

      // log product entry
      await log_entry("discount", { _id: discount_id }, "DELETE");
      // END log product entry

      return res.status(200).json({
        success: true,
        message: "Discount deleted",
        code: 200,
        response: null,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
