import { beforeEach, describe, expect, it } from 'vitest';

import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';

import { PasswordValidationServiceImpl } from './passwordValidationServiceImpl.js';

describe('PasswordValidationServiceImpl', () => {
  let passwordValidationService: PasswordValidationServiceImpl;

  beforeEach(() => {
    passwordValidationService = new PasswordValidationServiceImpl();
  });

  it('should not throw an error if the password is valid', async () => {
    const password = 'Password123';

    expect(() => { passwordValidationService.validate({ password }); }).not.toThrow();
  });

  it('should throw an error if the password is less than 8 characters long', async () => {
    const password = '1234567';

    try {
      passwordValidationService.validate({ password });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Password must be at least 8 characters long.',
      });

      return;
    }

    expect.fail();
  });

  it('should throw an error if the password is more than 64 characters long', async () => {
    const password = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

    try {
      passwordValidationService.validate({ password });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Password must be at most 64 characters long.',
      });

      return;
    }

    expect.fail();
  });

  it('should throw an error if the password does not contain a number', async () => {
    const password = 'Abcdefgh';

    try {
      passwordValidationService.validate({ password });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Password must contain at least one number.',
      });

      return;
    }

    expect.fail();
  });

  it('should throw an error if the password does not contain a lowercase letter', async () => {
    const password = 'ABCDEFGH';

    try {
      passwordValidationService.validate({ password });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Password must contain at least one lowercase letter.',
      });

      return;
    }

    expect.fail();
  });

  it('should throw an error if the password does not contain an uppercase letter', async () => {
    const password = 'abcdefgh';

    try {
      passwordValidationService.validate({ password });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Password must contain at least one uppercase letter.',
      });

      return;
    }

    expect.fail();
  });
});
