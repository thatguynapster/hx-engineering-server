import express, { Express, NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { log_entry } from "../../functions";
import { createReviewSchema } from "../../validators";
import { ProductCollection, ReviewCollection } from "../../models";

const app: Express = express();

// create review
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review_body = await createReviewSchema(req.body);

    // check if product exists
    const product_exists = await ProductCollection.findOne({
      _id: new Types.ObjectId(review_body.product),
    }).lean();

    if (!product_exists) {
      const e = new Error("Product not found");
      e.name = "NotFound";
      throw e;
    }
    // END check if product exists

    let review = new ReviewCollection({
      ...review_body,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    });
    review = (await review.save()).toObject();

    // log product entry
    await log_entry("review", review_body, "CREATE");
    // END log product entry

    res.status(200).json({
      success: true,
      message: "Done",
      code: 200,
      response: review,
    });
  } catch (error) {
    next(error);
  }
});

// get reviews
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as unknown as {
      limit: number;
      page: number;
    };

    const reviews_doc = await ReviewCollection.paginate(
      {
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!reviews_doc) {
      return res.status(204).json({
        success: false,
        message: "No reviews found",
        code: 204,
        response: null,
      });
    }

    return res.status(200).json({
      success: false,
      message: "Reviews found",
      code: 200,
      response: reviews_doc,
    });
  } catch (error) {
    next(error);
  }
});

// get single review
app.get(
  "/:review_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { review_id } = req.params as unknown as { review_id: string };

      const review_doc = await ReviewCollection.findOne({
        _id: review_id,
        is_dev: process.env.NODE_ENV === "dev",
      });

      if (!review_doc) {
        return res.status(204).json({
          success: false,
          message: "Review not found",
          code: 204,
          response: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Review Found",
        code: 200,
        response: review_doc,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
