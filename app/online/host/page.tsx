"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Lock } from "lucide-react";
import Link from "next/link";

export default function HostOnlineGame() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isCreating, setIsCreating] = useState(false);

  const createOnlineGame = useMutation(api.games.createOnlineGame);

  useEffect(() => {
    setMounted(true);
    // Get or create player ID
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    // Get player name from localStorage
    const name = localStorage.getItem("playerName");
    if (name) {
      setPlayerName(name);
    }
  }, []);

  const handleCreateGame = async () => {
    if (!playerName || !playerId) return;

    setIsCreating(true);
    try {
      // Save name to localStorage
      localStorage.setItem("playerName", playerName);

      // Create game
      const result = await createOnlineGame({
        hostId: playerId,
        hostName: playerName,
        visibility,
      });

      // Redirect to game lobby
      router.push(`/online/game/${result.code}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      alert("Failed to create game. Please try again.");
      setIsCreating(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Host Online Game</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/online">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>Game Visibility</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  visibility === "public"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
                onClick={() => setVisibility("public")}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Globe
                    className={`size-8 ${
                      visibility === "public" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-center">
                    <p className="font-semibold">Public</p>
                    <p className="text-xs text-muted-foreground">
                      Visible in lobby list
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  visibility === "private"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-accent"
                }`}
                onClick={() => setVisibility("private")}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Lock
                    className={`size-8 ${
                      visibility === "private" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-center">
                    <p className="font-semibold">Private</p>
                    <p className="text-xs text-muted-foreground">
                      Join by code only
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Button
            onClick={handleCreateGame}
            disabled={!playerName || isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create Game"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
