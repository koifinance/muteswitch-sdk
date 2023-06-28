import { MuteSwitchError } from '../..';
import { ErrorCodes } from './error-codes';

describe('MuteSwitchError', () => {
  const message = 'message_error';
  const code = ErrorCodes.canNotFindChainId;
  const muteswitchError = new MuteSwitchError(message, code);

  it('should have the correct name on error', () => {
    expect(muteswitchError.name).toEqual('MuteSwitchError');
  });

  it('should have the correct code on error', () => {
    expect(muteswitchError.code).toEqual(code);
  });

  it('should have the correct message on error', () => {
    expect(muteswitchError.message).toEqual(message);
  });
});
