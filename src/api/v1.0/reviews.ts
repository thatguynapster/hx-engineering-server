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

export default app;
