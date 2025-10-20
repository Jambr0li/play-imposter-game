"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HostPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(true);

  const createGame = useMutation(api.games.createGame);

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
  }, []);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem("playerName", playerName);
    setShowNameInput(false);

    try {
      const result = await createGame({
        hostId: playerId,
        hostName: playerName,
      });
      // Redirect to game room
      router.push(`/game/${result.code}`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
      setShowNameInput(true);
    }
  };

  if (showNameInput) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Host a Game</CardTitle>
            <CardDescription className="text-center">
              Enter your name to create a new game room
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGame()}
                placeholder="Enter your name"
                className="text-base"
                autoFocus
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              onClick={handleCreateGame}
              size="lg"
              className="w-full"
            >
              Create Game
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <Skeleton className="h-7 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    </main>
  );
}

