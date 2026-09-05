import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/validateRequests.js";
import { addtoWatchListItemSchema } from "../validators/watchlistValidators.js";

import {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
} from "../controllers/watchlistController.js";

const router = express.Router();

router.get("/:userId", getWatchlist);

router.post(
    "/",
    authMiddleware,
    validateRequest(addtoWatchListItemSchema),
    addToWatchlist
);

router.delete("/:id", removeFromWatchlist);

export default router;