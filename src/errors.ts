export class ProtocolValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly path = "$"
  ) {
    super(`${message} at ${path}`);
    this.name = "ProtocolValidationError";
  }
}
