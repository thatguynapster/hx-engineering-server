import express, { Express, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { ProductCollection, ReviewCollection } from "../../models";
import { createReviewSchema } from "../../validators";
import { logEntry } from "../../functions";

const app: Express = express();

// Create review
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewBody = await createReviewSchema(req.body);

    const productExists = await ProductCollection.exists({
      _id: reviewBody.product,
    });

    if (!productExists) {
      const error = new Error("Product not found");
      error.name = "NotFound";
      throw error;
    }

    const review = await new ReviewCollection({
      ...reviewBody,
      _id: new mongoose.Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
    }).save();

    await logEntry("review", reviewBody, "CREATE");

    res.status(200).json({
      success: true,
      message: "Review created",
      response: review.toObject(),
    });
  } catch (error) {
    next(error);
  }
});

// Get reviews
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as {
      limit?: number;
      page?: number;
    };

    const reviews = await ReviewCollection.paginate(
      { is_dev: process.env.NODE_ENV === "dev" },
      { lean: true, limit, page, sort: { _id: -1 } }
    );

    if (!reviews.docs.length) {
      return res.status(204).json({
        success: false,
        message: "No reviews found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reviews found",
      response: reviews,
    });
  } catch (error) {
    next(error);
  }
});

// Get single review
app.get(
  "/:review_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { review_id } = req.params;

      const review = await ReviewCollection.findById(review_id);

      if (!review) {
        return res.status(204).json({
          success: false,
          message: "Review not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Review found",
        response: review,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;
