import express, { Request, Response, NextFunction } from "express";
const app = express();
import cors from "cors";

app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

app.options(
  "*",
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

app.use((_, res: Response, next: NextFunction) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Date");
  res.removeHeader("Connection");
  res.setHeader("Server", "TGN");
  next();
});

/**
 * routes
 */
import Products from "../api/v1.0/products";
app.use("/api/v1.0/products", Products);

app.get("/health-check", (_, res: Response, next: NextFunction) => {
  try {
    return res.status(200).send("OK");
  } catch (err) {
    return next(err);
  }
});

app.get("/environment-check", (_, res: Response, next: NextFunction) => {
  try {
    return res.status(200).send({
      env: process.env.NODE_ENV,
    });
  } catch (err) {
    return next(err);
  }
});

app.use("*", (_, res) => {
  res.status(404).send("👀 Are you sure you know what you're doing?");
});

export default app;
