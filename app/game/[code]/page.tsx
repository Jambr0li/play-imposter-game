"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown,
  Users,
  Check,
  Loader2,
  LogOut,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [playerId, setPlayerId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  const game = useQuery(api.games.getGame, code ? { code } : "skip");
  const players = useQuery(api.games.getPlayers, code ? { code } : "skip");
  const playerWord = useQuery(
    api.games.getPlayerWord,
    code && playerId ? { gameCode: code, playerId } : "skip"
  );

  const setReady = useMutation(api.games.setReady);
  const leaveGame = useMutation(api.games.leaveGame);
  const restartGame = useMutation(api.games.restartGame);

  useEffect(() => {
    const id = localStorage.getItem("playerId");
    if (!id) {
      router.push("/join");
      return;
    }
    setPlayerId(id);
    setMounted(true);
  }, [router]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (playerId && code) {
        leaveGame({ gameCode: code, playerId }).catch(console.error);
      }
    };
  }, [playerId, code, leaveGame]);

  const currentPlayer = players?.find((p) => p.playerId === playerId);
  const readyCount = players?.filter((p) => p.isReady).length || 0;
  const totalPlayers = players?.length || 0;
  const allReady = readyCount === totalPlayers && totalPlayers >= 3;

  const handleToggleReady = async () => {
    if (!currentPlayer || !code) return;

    try {
      await setReady({
        gameCode: code,
        playerId,
        isReady: !currentPlayer.isReady,
      });
    } catch (error) {
      console.error("Error toggling ready:", error);
    }
  };

  const handleLeaveGame = async () => {
    if (!code || !playerId) return;

    try {
      await leaveGame({ gameCode: code, playerId });
      router.push("/");
    } catch (error) {
      console.error("Error leaving game:", error);
    }
  };

  const handleRestartGame = async () => {
    if (!code || !playerId) return;

    try {
      await restartGame({ gameCode: code, hostId: playerId });
      setShowRestartDialog(false);
    } catch (error: any) {
      console.error("Error restarting game:", error);
      alert(error.message || "Failed to restart game");
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Loading...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center">
              Game Not Found
            </CardTitle>
            <CardDescription className="text-center">
              This game doesn't exist or has ended.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              size="lg"
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // Playing phase - show the word
  if (game.status === "playing" && playerWord) {
    const isImposter = playerWord === "IMPOSTER";

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Card
            className={`${
              isImposter ? "border-destructive" : ""
            } shadow-lg animate-fadeIn`}
          >
            <CardHeader className="text-center pb-2">
              <CardDescription>
                Your word is:
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div
                className={`text-6xl md:text-8xl font-bold ${
                  isImposter ? "text-destructive" : ""
                }`}
              >
                {playerWord}
              </div>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <p className="text-center text-muted-foreground">
                {isImposter
                  ? "🤫 Keep it secret! Everyone else has a different word."
                  : "One player is the imposter with a different word!"}
              </p>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Players ({totalPlayers})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {players?.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
                >
                  <span className="font-medium">
                    {player.playerName}
                    {player.playerId === playerId && (
                      <span className="text-muted-foreground"> (You)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {player.isHost && (
                      <Badge variant="secondary">
                        <Crown className="size-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Show restart button only to host */}
          {currentPlayer?.isHost && (
            <Dialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full">
                  <RotateCcw className="mr-2" />
                  Start New Round
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Round?</DialogTitle>
                  <DialogDescription>
                    This will reset the game and all players will need to ready up again.
                    A new word will be chosen and a new imposter will be selected.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRestartDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRestartGame}>
                    Start New Round
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button
            onClick={handleLeaveGame}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <LogOut className="mr-2" />
            Leave Game
          </Button>
        </div>
      </main>
    );
  }

  // Waiting phase
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Waiting Room
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Game Code Display */}
            <Card className="bg-muted">
              <CardContent className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Game Code
                </p>
                <div className="text-5xl font-bold tracking-widest font-mono">
                  {code}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Share this code with your friends!
                </p>
              </CardContent>
            </Card>

            <Separator />

            {/* Players List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="size-5" />
                  <h3 className="font-semibold text-lg">
                    Players ({totalPlayers}/10)
                  </h3>
                </div>
                <Badge variant="outline">
                  {readyCount}/{totalPlayers} ready
                </Badge>
              </div>

              <div className="space-y-2">
                {players?.map((player) => (
                  <div
                    key={player._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {player.playerName}
                        {player.playerId === playerId && (
                          <span className="text-muted-foreground"> (You)</span>
                        )}
                      </span>
                      {player.isHost && (
                        <Badge variant="secondary" className="ml-1">
                          <Crown className="size-3 mr-1" />
                          Host
                        </Badge>
                      )}
                    </div>
                    {player.isReady && (
                      <Badge>
                        <Check className="size-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {totalPlayers < 3 && (
              <div className="flex items-center gap-2 border px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>Need at least 3 players to start</span>
              </div>
            )}

            {allReady && (
              <div className="flex items-center gap-2 border px-4 py-3 rounded-lg font-semibold animate-pulse">
                <Loader2 className="size-4 animate-spin" />
                <span>Starting game...</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              onClick={handleToggleReady}
              disabled={!currentPlayer}
              size="lg"
              variant={currentPlayer?.isReady ? "secondary" : "default"}
              className="w-full"
            >
              {currentPlayer?.isReady ? (
                <>
                  <Check className="mr-2" />
                  Not Ready
                </>
              ) : (
                <>
                  <Check className="mr-2" />
                  Ready!
                </>
              )}
            </Button>

            <Button
              onClick={handleLeaveGame}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2" />
              Leave Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
