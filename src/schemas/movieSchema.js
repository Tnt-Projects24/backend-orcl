import { z } from "zod";

export const MovieSchema = z.object({
    id: z.number().int().positive(),

    title: z
        .string()
        .min(1, "Title is required")
        .max(255),

    overview: z
        .string()
        .max(5000)
        .optional(),

    releaseYear: z
        .number()
        .int()
        .min(1888)
        .max(2100),

    genres: z
        .array(
            z.string().min(1).max(100)
        )
        .min(1, "At least one genre is required"),

    runtime: z
        .number()
        .int()
        .positive(),

    posterUrl: z
        .string()
        .url("Invalid poster URL")
        .optional(),

    createdBy: z.number().int().positive(),

    createdDate: z.coerce.date()
});