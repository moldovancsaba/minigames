/**
 * Interface for standardized API responses across the application.
 * Used to ensure consistent error handling and data formatting.
 * 
 * @template T - The type of data being returned in the response
 * @property {boolean} success - Indicates if the API call was successful
 * @property {T} [data] - Optional payload containing the successful response data
 * @property {string} [error] - Optional error message when success is false
 * @property {number} statusCode - HTTP status code of the response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Formats API responses into a consistent structure for all endpoints.
 * 
 * @template T - The type of data being returned in the response
 * @param {T} [data] - The data payload to include in the response
 * @param {boolean} [success=true] - Whether the operation was successful
 * @param {number} [statusCode=200] - HTTP status code for the response
 * @param {string} [error] - Error message in case of failure
 * @returns {ApiResponse<T>} A formatted API response object
 * 
 * @example
 * // Successful response with data
 * const users = await db.getUsers();
 * return formatApiResponse(users);
 * // => { success: true, data: [...users], statusCode: 200 }
 * 
 * @example
 * // Error response
 * return formatApiResponse(
 *   undefined,
 *   false,
 *   404,
 *   "User not found"
 * );
 * // => { success: false, error: "User not found", statusCode: 404 }
 * 
 * @example
 * // Typed response
 * interface User { id: string; name: string; }
 * const user: User = { id: "123", name: "John" };
 * return formatApiResponse<User>(user);
 * // => { success: true, data: { id: "123", name: "John" }, statusCode: 200 }
 */
export function formatApiResponse<T>(
  data?: T,
  success = true,
  statusCode = 200,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    statusCode,
  };
}
