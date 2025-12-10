import { ErrorCode } from "./auth.error";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly errors: unknown;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode = 400,
    errors: unknown = null
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    console.log(Object.getPrototypeOf(this));
  }
}
