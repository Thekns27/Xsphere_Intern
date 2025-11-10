import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorhandler.middleware.js";

const app = express();

app.use(express.json());

await AppDataSource.initialize()
  .then(() => {
    console.log("database is initialized ");
  })
  .catch((e) => {
    console.log(e);
  });

app.use("/user", userRouter);
app.use(errorHandler);

app.listen(4004, () => {
  console.log("server is listen on port 4004");
});
