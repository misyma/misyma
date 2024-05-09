import { z } from 'zod';

export const isbnSchema = z
  .string({
    required_error: 'Numer ISBN jest wymagany.',
  })
  .regex(/^(?=(?:[^0-9]*[0-9]){10}(?:(?:[^0-9]*[0-9]){3})?$)[\d-]+$/, 'Niewłaściwy format.');
