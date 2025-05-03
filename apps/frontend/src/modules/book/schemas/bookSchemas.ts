import { languages } from '@common/contracts';
import { z } from 'zod';

export const bookTitleSchema = z
  .string()
  .min(1, {
    message: 'Tytuł musi mieć co najmniej jeden znak.',
  })
  .max(256, {
    message: 'Tytuł może mieć maksymalnie 256 znaków.',
  });

export const publisherSchema = z
  .string()
  .min(1, {
    message: 'Nazwa wydawnictwa powinna mieć co namniej 1 znak.',
  })
  .max(128, {
    message: 'Nazwa wydawnictwa powinna mieć co najwyżej 128 znaków.',
  });

export const releaseYearSchema = z
  .number({
    invalid_type_error: 'Rok wydania musi być liczbą.',
    required_error: 'Rok wyadania musi być liczbą.',
    coerce: true,
  })
  .min(1, {
    message: 'Rok wydania musi być późniejszy niż 1800',
  })
  .max(2100, {
    message: 'Rok wydania nie może być późniejszy niż 2100',
  });

export const languageSchema = z.nativeEnum(languages);

export const translatorSchema = z
  .string({
    required_error: 'Przekład jest wymagany.',
  })
  .min(1, {
    message: 'Przekład jest zbyt krótki.',
  })
  .max(64, {
    message: 'Przekład może mieć maksymalnie 64 znaki.',
  });

export const pagesCountSchema = z
  .number({
    required_error: 'Ilość stron jest wymagana.',
    coerce: true,
  })
  .int({
    message: 'Ilość stron musi być wartością całkowitą.',
  })
  .min(1, {
    message: 'Książka nie może mieć mniej niż jedną stronę.',
  })
  .max(5000, {
    message: 'Za dużo stron. Maksymalnie 5000 jest dopuszczalnych.',
  });
