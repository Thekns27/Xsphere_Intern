export const ErrorCodes = {
  AUTH_MISSING_FIELDS: "AUTH_MISSING_FIELDS",
  AUTH_INVALID_USER: "AUTH_INVALID_USER",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  ERROR_ONE: "ERROR_ONE",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
