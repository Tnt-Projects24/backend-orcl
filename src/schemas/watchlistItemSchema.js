import {z} from "zod";
import WatchlistStatus from "./watchlistSchema.js"
export const WatchListItemSchema = z.object({
    id: z.number().int().positive(),

    userId: z.number().int().positive(),

    movieId: z.number().int().positive(),

    status: WatchlistStatus,
 

    rating: z.coerce
        .number()
        .int("Must be an ingeger")
        .min(1, "Rating must be between 1 and 10")
        .max(10,"Rating must be between 1 and 10")
        .optional(),

    notes: z
        .string()
        .max(2000)
        .optional(),

    createdAt: z.coerce.date(),

    updatedAt: z.coerce.date()
});

