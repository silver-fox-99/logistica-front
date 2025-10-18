import { z } from "zod";

export const addEmailSchema = z.object({
    email: z.string().email("Please enter a valid E-mail"),
});

export type AddEmailForm = z.infer<typeof addEmailSchema>;
