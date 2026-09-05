import { z } from "zod";

const WatchlistStatus = z.enum([
    "PLANNED",
    "WATCHING",
    "COMPLETED",
    "DROPPED"
]);

export const addtoWatchListItemSchema = z.object({
    movieId: z.number().int().positive(),

    status: WatchlistStatus,

    rating: z.coerce
        .number()
        .int("Must be an integer")
        .min(1, "Rating must be between 1 and 10")
        .max(10, "Rating must be between 1 and 10")
        .optional(),

    notes: z.string().max(2000).optional()
});