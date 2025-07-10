export class ValidationError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
    if (details) {
      this.details = details;
    }
  }
}
