"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Crown, AlertCircle } from "lucide-react";

interface PlayerSimulatorProps {
  gameCode: string;
  playerId: string;
  playerName: string;
  colorClass?: string;
}

export default function PlayerSimulator({
  gameCode,
  playerId,
  playerName,
  colorClass = "bg-muted",
}: PlayerSimulatorProps) {
  const game = useQuery(api.games.getGame, { code: gameCode });
  const players = useQuery(api.games.getPlayers, { code: gameCode });
  const playerWord = useQuery(api.games.getPlayerWord, {
    gameCode,
    playerId,
  });

  const joinGame = useMutation(api.games.joinGame);
  const setReady = useMutation(api.games.setReady);

  // Auto-join on mount
  useEffect(() => {
    if (!gameCode || !game) return;

    const timer = setTimeout(() => {
      joinGame({
        code: gameCode,
        playerId,
        playerName,
      }).catch((e) => {
        // Ignore errors if already joined
        console.log(`Player ${playerName} join:`, e.message);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [gameCode, playerId, playerName, joinGame, game]);

  const currentPlayer = players?.find((p) => p.playerId === playerId);

  const handleToggleReady = async () => {
    if (!currentPlayer) return;

    try {
      await setReady({
        gameCode,
        playerId,
        isReady: !currentPlayer.isReady,
      });
    } catch (error) {
      console.error("Error toggling ready:", error);
    }
  };

  if (!game) {
    return (
      <Card className={colorClass}>
        <CardHeader>
          <CardTitle className="text-sm">
            <Skeleton className="h-4 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-8 w-24 mx-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Playing phase
  if (game.status === "playing" && playerWord) {
    const isImposter = playerWord === "IMPOSTER";

    return (
      <Card
        className={`${colorClass} ${
          isImposter ? "border-destructive border-2" : ""
        }`}
      >
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{playerName}</span>
            {currentPlayer?.isHost && <Crown className="size-4" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Your word:</p>
            <div
              className={`text-3xl font-bold ${
                isImposter ? "text-destructive" : ""
              }`}
            >
              {playerWord}
            </div>
            {isImposter && (
              <p className="text-xs text-destructive mt-2">🤫 You're the imposter!</p>
            )}
          </div>

          <div className="text-xs">
            <p className="font-semibold mb-2">Players ({players?.length || 0}):</p>
            <div className="space-y-1">
              {players?.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={p.playerId === playerId ? "font-bold" : ""}>
                    {p.playerName}
                    {p.playerId === playerId && " (This)"}
                  </span>
                  {p.isHost && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Host
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Waiting phase
  const readyCount = players?.filter((p) => p.isReady).length || 0;
  const totalPlayers = players?.length || 0;

  return (
    <Card className={colorClass}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{playerName}</span>
          {currentPlayer?.isHost && <Crown className="size-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Waiting Room</p>
          <p className="text-xs font-semibold mt-1">
            {readyCount}/{totalPlayers} ready
          </p>
        </div>

        <div className="text-xs">
          <p className="font-semibold mb-2">Players ({totalPlayers}):</p>
          <div className="space-y-1">
            {players?.map((p) => (
              <div
                key={p._id}
                className={`flex items-center justify-between text-xs p-1 rounded ${
                  p.isReady ? "bg-green-100" : ""
                }`}
              >
                <span className={p.playerId === playerId ? "font-bold" : ""}>
                  {p.playerName}
                  {p.playerId === playerId && " (This)"}
                </span>
                <div className="flex items-center gap-1">
                  {p.isHost && (
                    <Badge variant="secondary" className="text-xs h-5">
                      Host
                    </Badge>
                  )}
                  {p.isReady && (
                    <Badge variant="default" className="text-xs h-5">
                      <Check className="size-3" />
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPlayers < 3 && (
          <div className="text-xs text-muted-foreground border rounded p-2">
            Need at least 3 players
          </div>
        )}

        <Button
          onClick={handleToggleReady}
          disabled={!currentPlayer}
          size="sm"
          variant={currentPlayer?.isReady ? "secondary" : "default"}
          className="w-full"
        >
          {currentPlayer?.isReady ? "Not Ready" : "Ready!"}
        </Button>
      </CardContent>
    </Card>
  );
}

