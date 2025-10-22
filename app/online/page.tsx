"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Plus, Search, Clock } from "lucide-react";

export default function OnlineMode() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");

  const publicGames = useQuery(api.games.getPublicGames);

  useEffect(() => {
    setMounted(true);
    // Get or create player ID
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    // Get player name
    const name = localStorage.getItem("playerName");
    if (name) {
      setPlayerName(name);
    }
  }, []);

  const handleJoinByCode = () => {
    if (!joinCode || !playerName) return;

    localStorage.setItem("playerName", playerName);
    router.push(`/online/game/${joinCode.toUpperCase()}`);
  };

  const handleJoinGame = (code: string) => {
    if (!playerName) return;

    localStorage.setItem("playerName", playerName);
    router.push(`/online/game/${code}`);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Online Mode</h1>
          <Button asChild variant="ghost">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Player Name Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/online/host">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Plus className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Host Game</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a new game room
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Search className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Join by Code</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Game code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    maxLength={6}
                    className="uppercase"
                  />
                  <Button
                    onClick={handleJoinByCode}
                    disabled={!joinCode || !playerName || joinCode.length !== 6}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Public Games List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Public Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!publicGames ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading games...
              </div>
            ) : publicGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No public games available. Be the first to host one!
              </div>
            ) : (
              <div className="space-y-3">
                {publicGames.map((game) => (
                  <Card key={game._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <code className="text-2xl font-mono font-bold">
                              {game.code}
                            </code>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="size-3" />
                              {game.playerCount}/10
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatTimeAgo(game.createdAt)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Category: {game.categoryPreference || "Random"} • {game.imposterCount} imposter(s)
                          </p>
                        </div>
                        <Button
                          onClick={() => handleJoinGame(game.code)}
                          disabled={!playerName || game.playerCount >= 10}
                        >
                          Join Game
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
