"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function JoinGameForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");
  
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [gameCode, setGameCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const joinGame = useMutation(api.games.joinGame);

  useEffect(() => {
    // Get or create playerId
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    // Get stored name if exists
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    }

    // Pre-fill game code from URL parameter
    if (codeFromUrl) {
      setGameCode(codeFromUrl.toUpperCase());
    }
  }, [codeFromUrl]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    localStorage.setItem("playerName", playerName);
    setError("");

    try {
      const result = await joinGame({
        code: gameCode.toUpperCase(),
        playerId,
        playerName,
      });

      if (result.success) {
        router.push(`/game/${result.code}`);
      }
    } catch (error: any) {
      console.error("Error joining game:", error);
      
      // Extract user-friendly error message from Convex error
      let errorMessage = "Failed to join game. Please check the code and try again.";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("game not found") || msg.includes("not found")) {
          errorMessage = "Game not found";
        } else if (msg.includes("already started")) {
          errorMessage = "Game has already started";
        } else if (msg.includes("full")) {
          errorMessage = "Game is full (max 10 players)";
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Join a Game</CardTitle>
          <CardDescription className="text-center">
            Enter the game code to join your friends
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Game Code</Label>
            <Input
              id="code"
              type="text"
              value={gameCode}
              onChange={(e) =>
                setGameCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="ABCD12"
              className="text-lg font-mono text-center uppercase tracking-wider"
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
              placeholder="Enter your name"
              className="text-base"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleJoinGame}
            size="lg"
            className="w-full"
          >
            Join Game
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="w-full"
          >
            Back
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join a Game</CardTitle>
            <CardDescription className="text-center">
              Loading...
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    }>
      <JoinGameForm />
    </Suspense>
  );
}

