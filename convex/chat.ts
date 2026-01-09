import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get chat messages for a game lobby
export const getMessages = query({
  args: {
    gameCode: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedCode = args.gameCode.toUpperCase();

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_game", (q) => q.eq("gameCode", normalizedCode))
      .collect();

    // Sort by sentAt (oldest first) and return required fields
    return messages
      .sort((a, b) => a.sentAt - b.sentAt)
      .map((msg) => ({
        playerName: msg.playerName,
        avatar: msg.avatar,
        message: msg.message,
        sentAt: msg.sentAt,
      }));
  },
});

// Send a chat message in the lobby
export const sendMessage = mutation({
  args: {
    gameCode: v.string(),
    playerId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedCode = args.gameCode.toUpperCase();

    // Validate the player is in the game
    const player = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameCode", normalizedCode))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!player) {
      throw new Error("Player not found in game");
    }

    // Get the game to update lastActivityAt
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();

    if (!game) {
      throw new Error("Game not found");
    }

    // Store the message with player's name and avatar
    await ctx.db.insert("messages", {
      gameCode: normalizedCode,
      playerId: args.playerId,
      playerName: player.playerName,
      avatar: player.avatar,
      message: args.message,
      sentAt: Date.now(),
    });

    // Update game's lastActivityAt timestamp
    await ctx.db.patch(game._id, {
      lastActivityAt: Date.now(),
    });

    return { success: true };
  },
});
