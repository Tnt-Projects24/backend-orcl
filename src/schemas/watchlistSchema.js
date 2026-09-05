import { z } from "zod";

  const WatchlistStatus = z.enum([
    "PLANNED",
    "WATCHING",
    "COMPLETED",
    "DROPPED"
]);

export default WatchlistStatus;