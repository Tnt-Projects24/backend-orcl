import { z } from "zod";

export const UserSchema = z.object({
    id: z.number().int().positive(),

    name: z
        .string()
        .min(1, "Name is required")
        .max(100),

    email: z
        .string()
        .email("Invalid email address")
        .max(255),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    createdDate: z.coerce.date()
});