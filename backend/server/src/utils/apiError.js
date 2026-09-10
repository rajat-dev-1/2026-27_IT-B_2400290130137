export class ApiError extends Error {
  constructor(statusCode, code, message, cause = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}
