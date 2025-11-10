export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {any} [errors]
   */
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message = "Bad Request", errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not Found") {
    return new ApiError(404, message);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }
}
