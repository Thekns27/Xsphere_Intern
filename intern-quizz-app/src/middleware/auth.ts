import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { LoginPayload, TokenPayload } from "../types/auth.type";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "123") as TokenPayload;
    if (!decoded) {
      return res.status(401).json({ message: "Provided token is invalid" });
    }
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
};
