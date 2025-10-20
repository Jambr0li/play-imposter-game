"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import PlayerSimulator from "@/components/PlayerSimulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function TestPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();

  // Create 3 test players with different colors
  const testPlayers = [
    { id: "test_player_alice", name: "Alice", color: "bg-blue-50" },
    { id: "test_player_bob", name: "Bob", color: "bg-green-50" },
    { id: "test_player_charlie", name: "Charlie", color: "bg-yellow-50" },
  ];

  if (!code) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p>Invalid game code</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-background rounded-lg p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold">🧪 Test Mode</h1>
            <p className="text-sm text-muted-foreground">
              Game Code: <span className="font-mono font-bold">{code}</span> • Simulating 3 players
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/game/${code}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Game
            </Link>
          </Button>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>How to use:</strong> Click "Ready" on each player to start the game.
              When all 3 are ready, the game will start automatically. One player will be
              randomly chosen as the imposter (shown with a red border).
            </p>
          </CardContent>
        </Card>

        {/* Player Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testPlayers.map((player) => (
            <PlayerSimulator
              key={player.id}
              gameCode={code}
              playerId={player.id}
              playerName={player.name}
              colorClass={player.color}
            />
          ))}
        </div>

        {/* Footer Info */}
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              This is a development/testing tool. Each card represents a different player's view.
              Changes made by one player (clicking Ready) will be reflected in real-time across all views.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

