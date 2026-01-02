import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup every 10 minutes
crons.interval(
  "cleanup inactive games",
  { minutes: 10 },
  internal.games.cleanupInactiveGames
);

export default crons;
