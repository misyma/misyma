import { z } from 'zod';

export const emailSchema = z
  .string({
    required_error: 'Wymagane.',
  })
  .email({
    message: 'Niewłaściwy adres email.',
  })
  .max(254, 'Email nie może być dłuższy niż 254 znaki.');

export const passwordSchema = z
  .string({
    required_error: 'Wymagane.',
  })
  .min(8, 'Hasło musi mieć minimum 8 znaków.')
  .max(64, 'Hasło może mieć maksymalnie 64 znaki.');

export const passwordSuperRefine = (
  {
    password,
  }: {
    password: string;
  },
  ctx: z.RefinementCtx,
) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Hasło musi zawierać przynajmniej jedną wielką literę.',
    });
  }

  if (!hasLowercase) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Hasło musi zawierać przynajmniej jedną małą literę.',
    });
  }

  if (!hasNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Hasło musi zawierać przynajmniej jedną cyfrę.',
    });
  }

  if (!hasSpecialChar) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Hasło musi zawierać przynajmniej jeden znak specjalny.',
    });
  }
};
