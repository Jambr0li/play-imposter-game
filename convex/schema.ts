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
      v.literal("finished"),
      // Online game statuses
      v.literal("lobby"),
      v.literal("round-1"),
      v.literal("round-2"),
      v.literal("round-3"),
      v.literal("voting"),
      v.literal("imposter-guess"),
      v.literal("results")
    ),
    word: v.string(),
    category: v.string(),
    categoryPreference: v.optional(v.string()), // "Random", "Food", "Location", "Animal", "Object"
    usedWords: v.optional(v.array(v.string())),
    imposterIds: v.optional(v.array(v.string())),
    imposterCount: v.optional(v.number()), // Preferred number of imposters
    createdAt: v.number(),
    // Online game specific fields
    gameMode: v.optional(v.union(v.literal("in-person"), v.literal("online"))),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    currentTurnPlayerId: v.optional(v.string()),
    currentRound: v.optional(v.number()), // 1, 2, or 3
    turnOrder: v.optional(v.array(v.string())), // Array of playerIds in turn order
    votedOutPlayerId: v.optional(v.string()), // Player voted out as imposter
    imposterGuess: v.optional(v.string()), // Imposter's guess for the word
    gameWinner: v.optional(v.union(v.literal("imposters"), v.literal("players"))),
  }).index("by_code", ["code"])
    .index("by_mode_and_visibility", ["gameMode", "visibility", "status"]),

  players: defineTable({
    gameCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
    isReady: v.boolean(),
    isHost: v.boolean(),
    joinedAt: v.number(),
    hasSubmittedWord: v.optional(v.boolean()), // For current round
    hasVoted: v.optional(v.boolean()), // For voting phase
  })
    .index("by_game", ["gameCode"])
    .index("by_player", ["playerId"]),

  chatMessages: defineTable({
    gameCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
    word: v.string(),
    round: v.number(), // 1, 2, or 3
    timestamp: v.number(),
  })
    .index("by_game", ["gameCode"])
    .index("by_game_and_round", ["gameCode", "round"]),

  votes: defineTable({
    gameCode: v.string(),
    voterId: v.string(),
    voterName: v.string(),
    votedForPlayerId: v.string(),
    votedForPlayerName: v.string(),
    timestamp: v.number(),
  })
    .index("by_game", ["gameCode"])
    .index("by_voter", ["voterId"]),
});

