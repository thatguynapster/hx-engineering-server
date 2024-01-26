import express, { Express, NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import {
  DiscountCollection,
  ProductCollection,
  SaleCollection,
} from "../../models";
import { createSalesSchema } from "../../validators";
import { logEntry } from "../../functions";

const app: Express = express();

// create sale
app.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sale_body = await createSalesSchema(req.body);

    // check if products exist
    // NOTE: should return an empty array if all products exist
    const missing_products = await findMissingProducts(sale_body.products);

    if (missing_products.length) {
      return res.status(200).json({
        success: false,
        message: "Some products are no longer in stock",
        code: 204,
        response: missing_products,
      });
    }
    // END check if products exist

    // get products price sum
    const price = await calculateTotalPrice(sale_body.products);
    // END get products price sum

    // check if discount exists
    if (sale_body.discount) {
      const discount_exists = await findDiscount(sale_body.discount);
      if (!discount_exists) {
        return res.status(200).json({
          success: false,
          message: "Invalid discount code",
          code: 204,
        });
      }
    }
    // END check if discount exists

    let sale = new SaleCollection({
      ...sale_body,
      _id: new Types.ObjectId(),
      is_dev: process.env.NODE_ENV === "dev",
      price,
    });
    sale = (await sale.save()).toObject();

    // log sale entry
    await logEntry("sale", sale_body, "CREATE");
    // END log sale entry

    res.status(200).json({
      success: true,
      message: "Done",
      code: 200,
      response: sale,
    });
  } catch (error) {
    next(error);
  }
});

// get sales
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, page = 1 } = req.query as {
      limit?: number;
      page?: number;
    };

    const sales = await SaleCollection.paginate(
      {
        is_deleted: { $ne: true },
        is_dev: process.env.NODE_ENV === "dev",
      },
      { lean: true, limit, page, sort: { _id: -1 } }
    );
    if (!sales) {
      res.status(204).json({
        success: false,
        message: "No sales found",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Sales found", response: sales });
  } catch (error) {
    next(error);
  }
});

// get single sale
app.get(
  "/:sale_id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sale_id } = req.params;

      const sale = await SaleCollection.findOne({
        _id: sale_id,
      });
      if (!sale) {
        return res
          .status(204)
          .json({ success: false, message: "Sale not found" });
      }

      res.status(200).json({
        success: true,
        message: "Sale found",
        response: sale,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default app;

async function findMissingProducts(products: string[]): Promise<string[]> {
  const productsDetails = await Promise.all(
    products.map(async (productId) => {
      const productDetails = await ProductCollection.findOne({
        _id: productId,
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      });
      return productDetails ? null : productId;
    })
  );

  return productsDetails.filter((product) => product) as string[];
}

async function calculateTotalPrice(products: string[]): Promise<number> {
  let totalPrice = 0;
  await Promise.all(
    products.map(async (productId) => {
      const productDetails = await ProductCollection.findOne({
        _id: productId,
        is_deleted: false,
        is_dev: process.env.NODE_ENV === "dev",
      });
      totalPrice += productDetails?.price || 0;
    })
  );
  return totalPrice;
}

async function findDiscount(discountId: string): Promise<boolean> {
  const discountExists = await DiscountCollection.findOne({
    _id: discountId,
    is_deleted: false,
    is_dev: process.env.NODE_ENV === "dev",
  });
  return !!discountExists;
}
