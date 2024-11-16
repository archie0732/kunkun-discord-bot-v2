export class NhentaiError extends Error {
  message: string;
  status: number;
  constructor(message: string, status = 200) {
    super(message);
    this.message = message;
    this.status = status;
  }
}
