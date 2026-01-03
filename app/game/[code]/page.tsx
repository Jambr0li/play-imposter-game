"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  UserX,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [playerId, setPlayerId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [playerToKick, setPlayerToKick] = useState<{ id: string; name: string } | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const game = useQuery(api.games.getGame, code ? { code } : "skip");
  const players = useQuery(api.games.getPlayers, code ? { code } : "skip");
  const playerWord = useQuery(
    api.games.getPlayerWord,
    code && playerId ? { gameCode: code, playerId } : "skip"
  );
  const imposterOptions = useQuery(
    api.games.getImposterCountOptions,
    code ? { code } : "skip"
  );

  const setReady = useMutation(api.games.setReady);
  const leaveGame = useMutation(api.games.leaveGame);
  const restartGame = useMutation(api.games.restartGame);
  const setCategoryPreference = useMutation(api.games.setCategoryPreference);
  const setImposterCount = useMutation(api.games.setImposterCount);
  const kickPlayer = useMutation(api.games.kickPlayer);

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

  // Detect if player was kicked (not in players list but game still exists)
  useEffect(() => {
    if (!mounted || !playerId || !game || !players) return;

    // If game exists and players loaded, but current player is not in the list
    if (game && players && !currentPlayer && !isLeaving) {
      // Player was kicked or removed
      setIsLeaving(true);
      router.push("/");
    }
  }, [mounted, playerId, game, players, currentPlayer, isLeaving, router]);
  const readyCount = players?.filter((p) => p.isReady).length || 0;
  const totalPlayers = players?.length || 0;
  const allReady = readyCount === totalPlayers && totalPlayers >= 3;
  
  // Generate join URL for QR code
  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?code=${code}`
    : '';

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
      setIsLeaving(true);
      await leaveGame({ gameCode: code, playerId });
      setShowLeaveDialog(false);
      router.push("/");
    } catch (error) {
      console.error("Error leaving game:", error);
      setIsLeaving(false);
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

  const handleCategoryChange = async (category: string) => {
    if (!code || !playerId) return;

    try {
      await setCategoryPreference({
        gameCode: code,
        hostId: playerId,
        categoryPreference: category,
      });
    } catch (error: any) {
      console.error("Error setting category:", error);
    }
  };

  const handleImposterCountChange = async (count: string) => {
    if (!code || !playerId) return;

    try {
      await setImposterCount({
        gameCode: code,
        hostId: playerId,
        imposterCount: parseInt(count),
      });
    } catch (error: any) {
      console.error("Error setting imposter count:", error);
      alert(error.message || "Failed to set imposter count");
    }
  };

  const handleKickPlayer = async () => {
    if (!code || !playerId || !playerToKick) return;

    try {
      await kickPlayer({
        gameCode: code,
        hostId: playerId,
        targetPlayerId: playerToKick.id,
      });
      setShowKickDialog(false);
      setPlayerToKick(null);
    } catch (error: any) {
      console.error("Error kicking player:", error);
      alert(error.message || "Failed to kick player");
    }
  };

  if (!mounted || game === undefined || isLeaving) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-9 w-48 mx-auto" />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Game Code Skeleton */}
              <Card className="bg-muted">
                <CardContent className="text-center py-6 space-y-3">
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <Skeleton className="h-16 w-64 mx-auto" />
                  <Skeleton className="h-3 w-48 mx-auto" />
                </CardContent>
              </Card>

              <Separator />

              {/* Players List Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>

                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  // Game not found - query returned but game doesn't exist
  if (game === null) {
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
    const { category, word, isImposter } = playerWord;
    const imposterIds = game.imposterIds || [];
    const imposterCount = imposterIds.length;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Card
            className={`${
              isImposter ? "border-destructive border-2" : ""
            } shadow-lg animate-fadeIn`}
          >
            <CardHeader className="text-center space-y-2">
              <CardDescription className="text-sm">Category:</CardDescription>
              <CardTitle className="text-3xl">{category}</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center py-8">
              {isImposter ? (
                <div className="space-y-4">
                  <div className="text-6xl md:text-8xl font-bold text-destructive">
                    IMPOSTER
                  </div>
                  <p className="text-sm text-muted-foreground px-4">
                    Guess what word the others are thinking about in this category
                  </p>
                </div>
              ) : (
                <div className="text-6xl md:text-8xl font-bold">
                  {word}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="justify-center pt-2">
              <p className="text-center text-muted-foreground">
                {isImposter
                  ? "Goodluck!"
                  : ''}
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

          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
              >
                <LogOut className="mr-2" />
                Leave Game
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave Game?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to leave the game?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleLeaveGame} variant="destructive">
                  Leave Game
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

            {/* QR Code Button */}
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full">
                  <QrCode className="mr-2" />
                  Show QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan to Join</DialogTitle>
                  <DialogDescription>
                    Scan this QR code with your phone camera to join the game
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={joinUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Or share the code manually:
                  </p>
                  <p className="text-2xl font-bold font-mono tracking-widest">
                    {code}
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Development Test Mode Link */}
            {process.env.NODE_ENV === "development" && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/test/${code}`} target="_blank">
                  🧪 Open Test Mode (3 Players)
                </Link>
              </Button>
            )}

            <Separator />

            {/* Host Settings */}
            {currentPlayer?.isHost && (
              <div className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category-select">Category</Label>
                  <Select
                    value={game.categoryPreference || "Random"}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Random">Random</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Location">Location</SelectItem>
                      <SelectItem value="Animal">Animal</SelectItem>
                      <SelectItem value="Object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Imposter Count Selection */}
                {imposterOptions && imposterOptions.max >= 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="imposter-select">
                      Number of Imposters
                      {imposterOptions.playerCount < 3 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (Need {3 - imposterOptions.playerCount} more player{3 - imposterOptions.playerCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </Label>
                    <Select
                      value={String(game.imposterCount || 1)}
                      onValueChange={handleImposterCountChange}
                      disabled={imposterOptions.playerCount < 3}
                    >
                      <SelectTrigger id="imposter-select">
                        <SelectValue placeholder="Select imposters" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: imposterOptions.max },
                          (_, i) => i + 1
                        ).map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count} Imposter{count > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

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
                    <div className="flex items-center gap-2">
                      {player.isReady && (
                        <Badge>
                          <Check className="size-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                      {currentPlayer?.isHost && !player.isHost && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPlayerToKick({ id: player.playerId, name: player.playerName });
                            setShowKickDialog(true);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserX className="size-4" />
                        </Button>
                      )}
                    </div>
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

            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="mr-2" />
                  Leave Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Game?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to leave the game?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleLeaveGame} variant="destructive">
                    Leave Game
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Kick Player Confirmation Dialog */}
        <Dialog open={showKickDialog} onOpenChange={setShowKickDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kick Player?</DialogTitle>
              <DialogDescription>
                Are you sure you want to kick <strong>{playerToKick?.name}</strong> from the game?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowKickDialog(false);
                  setPlayerToKick(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleKickPlayer} variant="destructive">
                Kick Player
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
