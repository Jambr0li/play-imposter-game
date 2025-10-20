import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to generate a unique 6-digit code
function generateGameCode(): string {
  // Use only uppercase letters and numbers, excluding confusing characters (0, O, I, 1)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Define categories and their words
const WORD_CATEGORIES = {
  Food: [
    "PIZZA",
    "BURGER",
    "SUSHI",
    "PASTA",
    "TACO",
    "SANDWICH",
    "SALAD",
    "SOUP",
    "STEAK",
    "CHICKEN",
    "RICE",
    "NOODLES",
    "BREAD",
    "CHEESE",
    "CHOCOLATE",
  ],
  Location: [
    "BEACH",
    "MOUNTAIN",
    "DESERT",
    "FOREST",
    "CITY",
    "VILLAGE",
    "ISLAND",
    "LAKE",
    "RIVER",
    "PARK",
    "MALL",
    "AIRPORT",
    "HOSPITAL",
    "SCHOOL",
    "LIBRARY",
  ],
  Animal: [
    "DOG",
    "CAT",
    "ELEPHANT",
    "LION",
    "TIGER",
    "BEAR",
    "WOLF",
    "EAGLE",
    "SHARK",
    "DOLPHIN",
    "PENGUIN",
    "MONKEY",
    "GIRAFFE",
    "ZEBRA",
    "RABBIT",
  ],
  Thing: [
    "CAR",
    "PHONE",
    "LAPTOP",
    "WATCH",
    "CHAIR",
    "TABLE",
    "LAMP",
    "MIRROR",
    "BOOK",
    "PENCIL",
    "CAMERA",
    "GUITAR",
    "BALL",
    "CLOCK",
    "UMBRELLA",
  ],
} as const;

type Category = keyof typeof WORD_CATEGORIES;

// Helper function to get a random word with category
function getRandomWordWithCategory(): { word: string; category: Category } {
  const categories = Object.keys(WORD_CATEGORIES) as Category[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const wordsInCategory = WORD_CATEGORIES[randomCategory];
  const randomWord = wordsInCategory[Math.floor(Math.random() * wordsInCategory.length)];
  
  return {
    word: randomWord,
    category: randomCategory,
  };
}

// Create a new game
export const createGame = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),
  },
  handler: async (ctx, args) => {
    let code = generateGameCode();
    
    // Ensure code is unique
    let existing = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    
    while (existing) {
      code = generateGameCode();
      existing = await ctx.db
        .query("games")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }

    // Create the game
    const { word, category } = getRandomWordWithCategory();
    const gameId = await ctx.db.insert("games", {
      code,
      hostId: args.hostId,
      status: "waiting",
      word,
      category,
      createdAt: Date.now(),
    });

    // Add host as first player
    await ctx.db.insert("players", {
      gameCode: code,
      playerId: args.hostId,
      playerName: args.hostName,
      isReady: false,
      isHost: true,
      joinedAt: Date.now(),
    });

    return { code, gameId };
  },
});

// Join an existing game
export const joinGame = mutation({
  args: {
    code: v.string(),
    playerId: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if game exists
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "waiting") {
      throw new Error("Game has already started");
    }

    // Check if player already exists in this game
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", game.code))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (existingPlayer) {
      return { success: true, code: game.code };
    }

    // Check player count (max 10)
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", game.code))
      .collect();

    if (players.length >= 10) {
      throw new Error("Game is full (max 10 players)");
    }

    // Add player to game
    await ctx.db.insert("players", {
      gameCode: game.code,
      playerId: args.playerId,
      playerName: args.playerName,
      isReady: false,
      isHost: false,
      joinedAt: Date.now(),
    });

    return { success: true, code: game.code };
  },
});

// Toggle ready state for a player
export const setReady = mutation({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
    isReady: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    await ctx.db.patch(player._id, {
      isReady: args.isReady,
    });

    // Check if all players are ready
    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    const allReady = allPlayers.every((p) => p.isReady);
    const minPlayers = allPlayers.length >= 3;

    if (allReady && minPlayers) {
      // Start the game automatically
      const game = await ctx.db
        .query("games")
        .withIndex("by_code", (q) => q.eq("code", args.gameCode))
        .first();

      if (game && game.status === "waiting") {
        // Pick a random imposter
        const randomIndex = Math.floor(Math.random() * allPlayers.length);
        const imposter = allPlayers[randomIndex];

        await ctx.db.patch(game._id, {
          status: "playing",
          imposterId: imposter.playerId,
        });
      }
    }

    return { success: true };
  },
});

// Start the game manually (host only)
export const startGame = mutation({
  args: {
    gameCode: v.string(),
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId !== args.hostId) {
      throw new Error("Only the host can start the game");
    }

    if (game.status !== "waiting") {
      throw new Error("Game has already started");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    if (players.length < 3) {
      throw new Error("Need at least 3 players to start");
    }

    // Pick a random imposter
    const randomIndex = Math.floor(Math.random() * players.length);
    const imposter = players[randomIndex];

    await ctx.db.patch(game._id, {
      status: "playing",
      imposterId: imposter.playerId,
    });

    return { success: true };
  },
});

// Leave a game
export const leaveGame = mutation({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (player) {
      await ctx.db.delete(player._id);
    }

    // If host left, maybe end the game or assign new host
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (game && game.hostId === args.playerId) {
      const remainingPlayers = await ctx.db
        .query("players")
        .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
        .collect();

      if (remainingPlayers.length === 0) {
        // No players left, delete the game
        await ctx.db.delete(game._id);
      } else {
        // Assign new host
        const newHost = remainingPlayers[0];
        await ctx.db.patch(game._id, {
          hostId: newHost.playerId,
        });
        await ctx.db.patch(newHost._id, {
          isHost: true,
        });
      }
    }

    return { success: true };
  },
});

// Restart the game (host only)
export const restartGame = mutation({
  args: {
    gameCode: v.string(),
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the game
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    // Verify caller is the host
    if (game.hostId !== args.hostId) {
      throw new Error("Only the host can restart the game");
    }

    // Get all players
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    // Reset all players to not ready
    for (const player of players) {
      await ctx.db.patch(player._id, {
        isReady: false,
      });
    }

    // Reset game state with new word and category
    const { word, category } = getRandomWordWithCategory();
    await ctx.db.patch(game._id, {
      status: "waiting",
      word,
      category,
      imposterId: undefined, // Clear imposter
    });

    return { success: true };
  },
});

// Get game details
export const getGame = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

// Get all players in a game
export const getPlayers = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.code.toUpperCase()))
      .order("asc")
      .collect();
  },
});

// Get the word for a specific player
export const getPlayerWord = query({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode.toUpperCase()))
      .first();

    if (!game) {
      return null;
    }

    if (game.status !== "playing") {
      return null;
    }

    // Return category for everyone, word only for non-imposters
    if (game.imposterId === args.playerId) {
      return {
        category: game.category,
        word: null,
        isImposter: true,
      };
    }

    return {
      category: game.category,
      word: game.word,
      isImposter: false,
    };
  },
});

