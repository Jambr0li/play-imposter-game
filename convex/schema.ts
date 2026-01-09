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
    phase: v.optional(v.union(
      v.literal("lobby"),
      v.literal("voting"),
      v.literal("results")
    )),
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
    avatar: v.string(),
    isReady: v.boolean(),
    isHost: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_game", ["gameCode"])
    .index("by_player", ["playerId"]),

  votes: defineTable({
    gameCode: v.string(),
    voterId: v.string(), // Player who is voting
    votedForId: v.string(), // Player they voted for
    submittedAt: v.number(),
  })
    .index("by_game", ["gameCode"])
    .index("by_voter", ["gameCode", "voterId"]),

  messages: defineTable({
    gameCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
    avatar: v.string(),
    message: v.string(),
    sentAt: v.number(),
  }).index("by_game", ["gameCode"]),
});

