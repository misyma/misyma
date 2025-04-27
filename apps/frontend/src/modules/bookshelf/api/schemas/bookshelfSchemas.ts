import { z } from "zod";

export const bookshelfNameSchema = z
  .string({
    required_error: 'Nazwa jest wymagana',
  })
  .min(1, 'Nazwa jest za krótka.')
  .max(64, 'Nazwa jest zbyt długa.');
