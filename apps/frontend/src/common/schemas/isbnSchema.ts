import { z } from 'zod';

export const isbnSchema = z
  .string({
    required_error: 'Numer ISBN jest wymagany.',
  })
  .regex(new RegExp('^(97(8|9))?\\d{9}(\\d|X)$'), 'Niewłaściwy format.');
