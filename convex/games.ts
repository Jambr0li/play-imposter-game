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
    "APPLE",
    "BANANA",
    "ORANGE",
    "STRAWBERRY",
    "MANGO",
    "WATERMELON",
    "GRAPE",
    "PINEAPPLE",
    "PEACH",
    "CHERRY",
    "ICE CREAM",
    "CAKE",
    "COOKIE",
    "DONUT",
    "PANCAKE",
    "WAFFLE",
    "BACON",
    "EGG",
    "TOAST",
    "BURRITO",
    "QUESADILLA",
    "NACHOS",
    "HOT DOG",
    "FRIES",
    "POPCORN",
    "PRETZEL",
    "BAGEL",
    "MUFFIN",
    "CROISSANT",
    "RAMEN",
    "CURRY",
    "DUMPLINGS",
    "SPRING ROLL",
    "TEMPURA",
    "KEBAB",
  ],
  Location: [
    "BEACH",
    "MOUNTAIN",
    "DESERT",
    "FOREST",
    "CITY",
    "ISLAND",
    "LAKE",
    "RIVER",
    "PARK",
    "MALL",
    "AIRPORT",
    "HOSPITAL",
    "SCHOOL",
    "LIBRARY",
    "RESTAURANT",
    "CAFE",
    "MUSEUM",
    "THEATER",
    "STADIUM",
    "GYM",
    "HOTEL",
    "RESORT",
    "CABIN",
    "CASTLE",
    "PALACE",
    "CHURCH",
    "BRIDGE",
    "LIGHTHOUSE",
    "FARM",
    "RANCH",
    "VINEYARD",
    "GARDEN",
    "PLAYGROUND",
    "CEMETERY",
    "SUBWAY",
    "TRAIN STATION",
    "BUS STOP",
    "PARKING LOT",
    "WAREHOUSE",
    "FACTORY",
    "OFFICE",
    "LABORATORY",
    "BAKERY",
    "BUTCHER SHOP",
    "BOOKSTORE",
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
    "HORSE",
    "COW",
    "PIG",
    "SHEEP",
    "GOAT",
    "CHICKEN",
    "DUCK",
    "GOOSE",
    "TURKEY",
    "PARROT",
    "FLAMINGO",
    "OWL",
    "HAWK",
    "CROW",
    "SEAGULL",
    "SNAKE",
    "LIZARD",
    "TURTLE",
    "FROG",
    "CROCODILE",
    "ALLIGATOR",
    "WHALE",
    "SEAL",
    "WALRUS",
    "OCTOPUS",
    "JELLYFISH",
    "STARFISH",
    "CRAB",
    "LOBSTER",
    "KANGAROO",
    "KOALA",
    "PANDA",
    "RACCOON",
    "SQUIRREL",
    "DEER",
  ],
  Object: [
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
    "BICYCLE",
    "MOTORCYCLE",
    "SKATEBOARD",
    "SCOOTER",
    "BOAT",
    "PLANE",
    "HELICOPTER",
    "TRAIN",
    "BUS",
    "TRUCK",
    "TELEVISION",
    "COMPUTER",
    "HEADPHONES",
    "SPEAKER",
    "MICROPHONE",
    "RADIO",
    "GLASSES",
    "SUNGLASSES",
    "HAT",
    "SHOES",
    "BACKPACK",
    "WALLET",
    "KEYS",
    "BOTTLE",
    "CUP",
    "PLATE",
    "FORK",
    "SPOON",
    "KNIFE",
    "PAN",
    "POT",
    "TOASTER",
    "BLENDER",
  ],
} as const;

type Category = keyof typeof WORD_CATEGORIES;

// Helper function to calculate max imposters (should leave at least 2 non-imposters)
function getMaxImposterCount(playerCount: number): number {
  return Math.max(1, playerCount - 2);
}

// Helper function to get a random word with category
function getRandomWordWithCategory(
  preferredCategory?: string,
  usedWords: string[] = []
): { word: string; category: Category; updatedUsedWords: string[] } {
  const categories = Object.keys(WORD_CATEGORIES) as Category[];
  
  // Collect all words from all categories
  const allWords: string[] = [];
  for (const category of categories) {
    allWords.push(...WORD_CATEGORIES[category]);
  }
  
  // Filter out used words
  let availableWords = allWords.filter(word => !usedWords.includes(word));
  
  // If all words have been used, reset the list
  if (availableWords.length === 0) {
    availableWords = [...allWords];
    usedWords = [];
  }
  
  // If a specific category is preferred and valid, filter to that category
  let selectedWord: string;
  let selectedCategory: Category;
  
  if (preferredCategory && preferredCategory !== "Random" && categories.includes(preferredCategory as Category)) {
    selectedCategory = preferredCategory as Category;
    const categoryWords = WORD_CATEGORIES[selectedCategory];
    const availableCategoryWords = categoryWords.filter(word => availableWords.includes(word));
    
    // If all words in this category are used, use any available word from this category
    if (availableCategoryWords.length === 0) {
      selectedWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    } else {
      selectedWord = availableCategoryWords[Math.floor(Math.random() * availableCategoryWords.length)];
    }
  } else {
    // Pick randomly from available words
    selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Determine which category this word belongs to
    for (const cat of categories) {
      const categoryWordList = WORD_CATEGORIES[cat] as readonly string[];
      if (categoryWordList.includes(selectedWord)) {
        selectedCategory = cat;
        break;
      }
    }
  }
  
  // Add selected word to used words
  const updatedUsedWords = [...usedWords, selectedWord];
  
  return {
    word: selectedWord,
    category: selectedCategory!,
    updatedUsedWords,
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
      categoryPreference: "Random", // Default to random
      imposterCount: 1, // Default to 1 imposter
      usedWords: [],
      createdAt: Date.now(),
      gameMode: "in-person", // Set game mode
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
        // Generate word based on category preference
        const { word, category, updatedUsedWords } = getRandomWordWithCategory(
          game.categoryPreference,
          game.usedWords || []
        );
        
        // Determine number of imposters
        const desiredCount = game.imposterCount || 1;
        const maxCount = getMaxImposterCount(allPlayers.length);
        const imposterCount = Math.min(desiredCount, maxCount);
        
        // Pick random imposters
        const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
        const imposters = shuffled.slice(0, imposterCount);
        const imposterIds = imposters.map(p => p.playerId);

        await ctx.db.patch(game._id, {
          status: "playing",
          word,
          category,
          usedWords: updatedUsedWords,
          imposterIds,
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

    // Generate word based on category preference
    const { word, category, updatedUsedWords } = getRandomWordWithCategory(
      game.categoryPreference,
      game.usedWords || []
    );
    
    // Determine number of imposters
    const desiredCount = game.imposterCount || 1;
    const maxCount = getMaxImposterCount(players.length);
    const imposterCount = Math.min(desiredCount, maxCount);
    
    // Pick random imposters
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const imposters = shuffled.slice(0, imposterCount);
    const imposterIds = imposters.map(p => p.playerId);

    await ctx.db.patch(game._id, {
      status: "playing",
      word,
      category,
      usedWords: updatedUsedWords,
      imposterIds,
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

// Set category preference (host only)
export const setCategoryPreference = mutation({
  args: {
    gameCode: v.string(),
    hostId: v.string(),
    categoryPreference: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode.toUpperCase()))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId !== args.hostId) {
      throw new Error("Only the host can change category preference");
    }

    if (game.status !== "waiting") {
      throw new Error("Cannot change category after game has started");
    }

    const validCategories = ["Random", "Food", "Location", "Animal", "Object"];
    if (!validCategories.includes(args.categoryPreference)) {
      throw new Error("Invalid category");
    }

    await ctx.db.patch(game._id, {
      categoryPreference: args.categoryPreference,
    });

    return { success: true };
  },
});

// Set imposter count preference (host only)
export const setImposterCount = mutation({
  args: {
    gameCode: v.string(),
    hostId: v.string(),
    imposterCount: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode.toUpperCase()))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId !== args.hostId) {
      throw new Error("Only the host can change imposter count");
    }

    if (game.status !== "waiting") {
      throw new Error("Cannot change imposter count after game has started");
    }

    // Get current player count to validate
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode.toUpperCase()))
      .collect();
    
    const maxCount = getMaxImposterCount(players.length);
    
    if (args.imposterCount < 1) {
      throw new Error("Must have at least 1 imposter");
    }
    
    if (args.imposterCount > maxCount) {
      throw new Error(`Too many imposters for ${players.length} players (max: ${maxCount})`);
    }

    await ctx.db.patch(game._id, {
      imposterCount: args.imposterCount,
    });

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

    // Reset game state (word will be selected when game starts)
    await ctx.db.patch(game._id, {
      status: "waiting",
      imposterIds: undefined,
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

// Get valid imposter count options for a game
export const getImposterCountOptions = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.code.toUpperCase()))
      .collect();
    
    const playerCount = players.length;
    const maxCount = getMaxImposterCount(playerCount);
    
    return {
      min: 1,
      max: maxCount,
      playerCount,
    };
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

    if (game.status !== "playing" && !game.status?.startsWith("round-")) {
      return null;
    }

    // Check if player is an imposter
    const imposterIds = game.imposterIds || [];
    const isImposter = imposterIds.includes(args.playerId);

    // Return category for everyone, word only for non-imposters
    if (isImposter) {
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

// ===== ONLINE GAME SPECIFIC FUNCTIONS =====

// Create an online game
export const createOnlineGame = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private")),
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

    // Create the game (word will be selected when game starts)
    const { word, category } = getRandomWordWithCategory();
    const gameId = await ctx.db.insert("games", {
      code,
      hostId: args.hostId,
      status: "lobby",
      word,
      category,
      categoryPreference: "Random",
      imposterCount: 1,
      usedWords: [],
      createdAt: Date.now(),
      gameMode: "online",
      visibility: args.visibility,
      currentRound: 0,
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

// Get list of public online games
export const getPublicGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_mode_and_visibility", (q) =>
        q.eq("gameMode", "online").eq("visibility", "public")
      )
      .filter((q) => q.eq(q.field("status"), "lobby"))
      .collect();

    // Get player count for each game
    const gamesWithPlayerCount = await Promise.all(
      games.map(async (game) => {
        const players = await ctx.db
          .query("players")
          .withIndex("by_game", (q) => q.eq("gameCode", game.code))
          .collect();

        return {
          ...game,
          playerCount: players.length,
        };
      })
    );

    // Filter out full games and sort by creation time
    return gamesWithPlayerCount
      .filter((game) => game.playerCount < 10)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Start an online game (moves to round-1)
export const startOnlineGame = mutation({
  args: {
    gameCode: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "lobby") {
      throw new Error("Game has already started");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    if (players.length < 3) {
      throw new Error("Need at least 3 players to start");
    }

    // Check if all players are ready
    const allReady = players.every((p) => p.isReady);
    if (!allReady) {
      throw new Error("Not all players are ready");
    }

    // Generate word based on category preference
    const { word, category, updatedUsedWords } = getRandomWordWithCategory(
      game.categoryPreference,
      game.usedWords || []
    );

    // Determine number of imposters
    const desiredCount = game.imposterCount || 1;
    const maxCount = getMaxImposterCount(players.length);
    const imposterCount = Math.min(desiredCount, maxCount);

    // Pick random imposters
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const imposters = shuffled.slice(0, imposterCount);
    const imposterIds = imposters.map((p) => p.playerId);

    // Set random turn order
    const turnOrder = shuffled.map((p) => p.playerId);
    const firstPlayer = turnOrder[0];

    await ctx.db.patch(game._id, {
      status: "round-1",
      word,
      category,
      usedWords: updatedUsedWords,
      imposterIds,
      currentRound: 1,
      turnOrder,
      currentTurnPlayerId: firstPlayer,
    });

    // Reset player states
    for (const player of players) {
      await ctx.db.patch(player._id, {
        hasSubmittedWord: false,
      });
    }

    return { success: true };
  },
});

// Submit a word during a round
export const submitWord = mutation({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    const validStatuses = ["round-1", "round-2", "round-3"];
    if (!validStatuses.includes(game.status as string)) {
      throw new Error("Not in a word submission round");
    }

    // Verify it's this player's turn
    if (game.currentTurnPlayerId !== args.playerId) {
      throw new Error("It's not your turn");
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Validate word (single word, not the secret word)
    const trimmedWord = args.word.trim().toUpperCase();
    if (!trimmedWord || trimmedWord.includes(" ")) {
      throw new Error("Must submit a single word");
    }

    if (trimmedWord === game.word.toUpperCase()) {
      throw new Error("Cannot submit the secret word");
    }

    // Add to chat
    await ctx.db.insert("chatMessages", {
      gameCode: args.gameCode,
      playerId: args.playerId,
      playerName: player.playerName,
      word: trimmedWord,
      round: game.currentRound || 1,
      timestamp: Date.now(),
    });

    // Mark player as having submitted
    await ctx.db.patch(player._id, {
      hasSubmittedWord: true,
    });

    // Get all players and turn order
    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    const turnOrder = game.turnOrder || [];
    const currentIndex = turnOrder.indexOf(args.playerId);
    const nextIndex = (currentIndex + 1) % turnOrder.length;
    const nextPlayerId = turnOrder[nextIndex];

    // Check if everyone has submitted
    const allSubmitted = allPlayers.every((p) => p.hasSubmittedWord);

    if (allSubmitted) {
      // Move to next round or voting
      const currentRound = game.currentRound || 1;

      if (currentRound < 3) {
        // Next round
        const nextStatus = `round-${currentRound + 1}` as any;
        await ctx.db.patch(game._id, {
          status: nextStatus,
          currentRound: currentRound + 1,
          currentTurnPlayerId: turnOrder[0], // Reset to first player
        });

        // Reset submission states
        for (const p of allPlayers) {
          await ctx.db.patch(p._id, {
            hasSubmittedWord: false,
          });
        }
      } else {
        // Move to voting
        await ctx.db.patch(game._id, {
          status: "voting",
          currentTurnPlayerId: undefined,
        });

        // Reset voting states
        for (const p of allPlayers) {
          await ctx.db.patch(p._id, {
            hasVoted: false,
          });
        }
      }
    } else {
      // Move to next player
      await ctx.db.patch(game._id, {
        currentTurnPlayerId: nextPlayerId,
      });
    }

    return { success: true };
  },
});

// Submit a vote for who is the imposter
export const submitVote = mutation({
  args: {
    gameCode: v.string(),
    voterId: v.string(),
    votedForPlayerId: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "voting") {
      throw new Error("Not in voting phase");
    }

    const voter = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .filter((q) => q.eq(q.field("playerId"), args.voterId))
      .first();

    const votedFor = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .filter((q) => q.eq(q.field("playerId"), args.votedForPlayerId))
      .first();

    if (!voter || !votedFor) {
      throw new Error("Player not found");
    }

    // Check if already voted
    if (voter.hasVoted) {
      throw new Error("You have already voted");
    }

    // Record vote
    await ctx.db.insert("votes", {
      gameCode: args.gameCode,
      voterId: args.voterId,
      voterName: voter.playerName,
      votedForPlayerId: args.votedForPlayerId,
      votedForPlayerName: votedFor.playerName,
      timestamp: Date.now(),
    });

    // Mark as voted
    await ctx.db.patch(voter._id, {
      hasVoted: true,
    });

    // Check if everyone has voted
    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    const allVoted = allPlayers.every((p) => p.hasVoted);

    if (allVoted) {
      // Count votes
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
        .collect();

      const voteCounts = new Map<string, number>();
      for (const vote of votes) {
        const count = voteCounts.get(vote.votedForPlayerId) || 0;
        voteCounts.set(vote.votedForPlayerId, count + 1);
      }

      // Find player with most votes
      let maxVotes = 0;
      let votedOutPlayerId = "";
      for (const [playerId, count] of voteCounts.entries()) {
        if (count > maxVotes) {
          maxVotes = count;
          votedOutPlayerId = playerId;
        }
      }

      // Check if voted out player is an imposter
      const imposterIds = game.imposterIds || [];
      const votedOutIsImposter = imposterIds.includes(votedOutPlayerId);

      if (votedOutIsImposter) {
        // Move to imposter guess phase
        await ctx.db.patch(game._id, {
          status: "imposter-guess",
          votedOutPlayerId,
        });
      } else {
        // Non-imposter was voted out, imposters win
        await ctx.db.patch(game._id, {
          status: "results",
          votedOutPlayerId,
          gameWinner: "imposters",
        });
      }
    }

    return { success: true };
  },
});

// Submit imposter's guess for the word
export const submitImposterGuess = mutation({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
    guess: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", args.gameCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "imposter-guess") {
      throw new Error("Not in imposter guess phase");
    }

    // Verify player is the voted out imposter
    if (game.votedOutPlayerId !== args.playerId) {
      throw new Error("Only the voted out imposter can guess");
    }

    const trimmedGuess = args.guess.trim().toUpperCase();
    const correctWord = game.word.toUpperCase();

    const isCorrect = trimmedGuess === correctWord;

    // Determine winner
    const winner = isCorrect ? "imposters" : "players";

    await ctx.db.patch(game._id, {
      status: "results",
      imposterGuess: trimmedGuess,
      gameWinner: winner,
    });

    return { success: true, isCorrect };
  },
});

// Return to lobby after game ends
export const returnToLobby = mutation({
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
      throw new Error("Only the host can return to lobby");
    }

    if (game.status !== "results") {
      throw new Error("Game is not in results phase");
    }

    // Get all players
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    // Reset all players
    for (const player of players) {
      await ctx.db.patch(player._id, {
        isReady: false,
        hasSubmittedWord: false,
        hasVoted: false,
      });
    }

    // Delete old votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete old chat messages
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Reset game state
    await ctx.db.patch(game._id, {
      status: "lobby",
      currentRound: 0,
      currentTurnPlayerId: undefined,
      turnOrder: undefined,
      votedOutPlayerId: undefined,
      imposterGuess: undefined,
      gameWinner: undefined,
      imposterIds: undefined,
    });

    return { success: true };
  },
});

// Get chat messages for a game
export const getChatMessages = query({
  args: {
    gameCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode.toUpperCase()))
      .order("asc")
      .collect();
  },
});

// Get votes for a game
export const getVotes = query({
  args: {
    gameCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_game", (q) => q.eq("gameCode", args.gameCode.toUpperCase()))
      .collect();
  },
});

