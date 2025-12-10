import { OTP } from "./../model/otp";
// createUser.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../error-codes/app.error";

export const createUserValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters"),

  // <-- This runs AFTER all the above validators
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      throw new AppError(
        "validation error",
        "AUTH_INVALID_USER",
        400,
        errors.array()
      );
    }

    next(); // continue to the real handler
  },
];
