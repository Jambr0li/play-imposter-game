import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    code: v.string(),
    hostId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("playing"),
      v.literal("finished")
    ),
    word: v.string(),
    imposterId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    gameCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
    isReady: v.boolean(),
    isHost: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_game", ["gameCode"])
    .index("by_player", ["playerId"]),
});

