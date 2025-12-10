import { validationResult } from "express-validator";
import { AppDataSource } from "../config/database";
import { User } from "../model/user";

export const userRepository = AppDataSource.getRepository(User);
