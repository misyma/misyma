import { Type } from '@sinclair/typebox';

export const genreDTOSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
});
