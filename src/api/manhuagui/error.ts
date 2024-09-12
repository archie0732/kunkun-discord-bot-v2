export class ManhuaguiError extends Error {
  message: string;
  id: string;

  constructor(message: string, id: string) {
    super(message);
    this.message = message;
    this.id = id;
  }
}
