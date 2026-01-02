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
    category: v.string(),
    categoryPreference: v.optional(v.string()), // "Random", "Food", "Location", "Animal", "Object"
    usedWords: v.optional(v.array(v.string())),
    imposterIds: v.optional(v.array(v.string())),
    imposterCount: v.optional(v.number()), // Preferred number of imposters
    createdAt: v.number(),
    lastActivityAt: v.number(), // Track last activity for automatic cleanup
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

