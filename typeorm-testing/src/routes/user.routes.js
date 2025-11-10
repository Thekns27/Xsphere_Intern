import { Router } from "express";
const userRouter = Router();
import { createUser } from "../controllers/user.controller.js";

userRouter.post("/", createUser);

export default userRouter;
