import { z } from "zod";

export const loginUserFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export type LoginUserFormValues = z.infer<typeof loginUserFormSchema>;
