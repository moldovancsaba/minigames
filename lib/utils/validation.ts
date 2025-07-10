// Returns true if the provided string is a valid MongoDB ObjectId
export function validateObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}
