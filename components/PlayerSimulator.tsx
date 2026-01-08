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
  const submitVote = useMutation(api.games.submitVote);
  const resetToLobby = useMutation(api.games.resetToLobby);

  const playerVote = useQuery(api.games.getPlayerVote, {
    gameCode,
    playerId,
  });

  const voters = useQuery(api.games.getVoters, {
    gameCode,
  });

  const votingResults = useQuery(
    api.games.getVotingResults,
    game?.phase === "results" ? { gameCode } : "skip"
  );

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

  const handleSubmitVote = async (votedForId: string) => {
    try {
      await submitVote({
        gameCode,
        voterId: playerId,
        votedForId,
      });
    } catch (error: any) {
      console.error("Error submitting vote:", error);
    }
  };

  const handleDone = async () => {
    try {
      await resetToLobby({
        gameCode,
        hostId: playerId,
      });
    } catch (error: any) {
      console.error("Error resetting to lobby:", error);
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
    const { category, word, isImposter } = playerWord;

    // Voting phase - show voting interface
    if (game.phase === "voting") {
      const hasVoted = playerVote !== undefined && playerVote !== null;

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
              <p className="text-xs font-bold mb-2">🗳️ Voting Phase</p>
              <p className="text-xs text-muted-foreground">
                {hasVoted ? "Vote submitted!" : "Vote for the imposter"}
              </p>
            </div>

            {hasVoted ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-green-100 p-2">
                    <Check className="size-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs font-semibold">Waiting for others...</p>
              </div>
            ) : (
              <div className="text-xs">
                <p className="font-semibold mb-2">Select a player:</p>
                <div className="space-y-1">
                  {players?.map((p) => {
                    const hasPlayerVoted = voters?.includes(p.playerId);
                    return (
                      <Button
                        key={p._id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs h-auto py-2"
                        onClick={() => handleSubmitVote(p.playerId)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={p.playerId === playerId ? "font-bold" : ""}>
                            {p.playerName}
                            {p.playerId === playerId && " (You)"}
                          </span>
                          {hasPlayerVoted && (
                            <Check className="size-3 text-green-600 ml-1" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Results phase - show voting results
    if (game.phase === "results" && votingResults) {
      const {
        votedOutPlayerName,
        votedOutWasImposter,
        voteDetails,
        imposterIds,
        isTie,
      } = votingResults;

      return (
        <Card className={colorClass}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{playerName}</span>
              {currentPlayer?.isHost && <Crown className="size-4" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-xs font-bold mb-1">📊 Results</p>
            </div>

            {/* Vote Tally */}
            <div className="text-xs">
              <p className="font-semibold mb-1">Votes:</p>
              <div className="space-y-1">
                {voteDetails.map((detail) => (
                  <div
                    key={detail.playerId}
                    className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
                  >
                    <span className="text-xs">{detail.playerName}</span>
                    <Badge variant="secondary" className="text-xs h-5">
                      {detail.voteCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Voted Out Result */}
            <div className={`p-2 rounded text-center ${
              votedOutWasImposter
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-xs font-bold mb-1">
                {votedOutWasImposter ? '✓ SUCCESS' : '✗ FAILED'}
              </p>
              <p className={`text-xs ${
                votedOutWasImposter ? 'text-green-700' : 'text-red-700'
              }`}>
                {votedOutPlayerName} was {votedOutWasImposter ? '' : 'NOT '}the imposter
              </p>
            </div>

            {/* Show imposters */}
            <div className="text-xs text-center">
              <p className="text-muted-foreground mb-1">
                {imposterIds.length === 1 ? 'Imposter:' : 'Imposters:'}
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {players
                  ?.filter(p => imposterIds.includes(p.playerId))
                  .map(p => (
                    <Badge
                      key={p.playerId}
                      variant="destructive"
                      className="text-xs h-5"
                    >
                      {p.playerName}
                    </Badge>
                  ))
                }
              </div>
            </div>

            {/* Done button for host only */}
            {currentPlayer?.isHost && (
              <Button
                onClick={handleDone}
                size="sm"
                className="w-full mt-2"
              >
                Done
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

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
            <p className="text-xs text-muted-foreground mb-1">Category:</p>
            <p className="text-sm font-bold mb-2">{category}</p>
            <p className="text-xs text-muted-foreground mb-1">Your word:</p>
            <div
              className={`text-3xl font-bold ${
                isImposter ? "text-destructive" : ""
              }`}
            >
              {isImposter ? "???" : word}
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

