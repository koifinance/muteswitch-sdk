import { ErrorCodes } from '../..';

export class MuteSwitchError extends Error {
  public name = 'MuteSwitchError';
  public code: ErrorCodes;
  public message: string;
  constructor(message: string, code: ErrorCodes) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
