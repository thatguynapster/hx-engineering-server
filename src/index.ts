import express, { Express, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

if (!process.env.NODE_ENV) {
  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }
}

//Runnning Environment
console.log(`Environment: ${process.env.NODE_ENV}`);

//CONNECT TO DATABASE
mongoose.connect(process.env.DB_URL as unknown as string).then(
  () => {
    console.log(`Database connected`);
  },
  (err) => {
    console.log(`Failed to connect database. Error: `, err);
  }
);

const app: Express = express();
const port = process.env.PORT || 3000;

// CORS Config
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.options("*", cors({ origin: "*", optionsSuccessStatus: 200 }));

// parse body
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false, limit: "100mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Date");
  res.removeHeader("Connection");
  res.setHeader("Server", "thatGuyNapster");
  next();
});

// Router
import router from "./router";
app.use(router);

app.listen(port, () => {
  console.log("Server started");
  console.log(`Port: ${port}`);
});
