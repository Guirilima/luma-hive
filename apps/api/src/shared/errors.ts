export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const requireValue = (condition: unknown, message: string, status = 400): void => {
  if (!condition) throw new HttpError(status, message);
};
