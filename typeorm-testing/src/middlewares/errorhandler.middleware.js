import { ApiError } from "../utils/errors.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
