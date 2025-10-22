"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Check,
  Crown,
  LogOut,
  Send,
  Trophy,
  Target,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function OnlineGameRoom() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [mounted, setMounted] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [voteFor, setVoteFor] = useState("");
  const [guessWord, setGuessWord] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const game = useQuery(api.games.getGame, code ? { code } : "skip");
  const players = useQuery(api.games.getPlayers, code ? { code } : "skip");
  const playerWord = useQuery(
    api.games.getPlayerWord,
    code && playerId ? { gameCode: code, playerId } : "skip"
  );
  const chatMessages = useQuery(
    api.games.getChatMessages,
    code ? { gameCode: code } : "skip"
  );
  const votes = useQuery(api.games.getVotes, code ? { gameCode: code } : "skip");
  const imposterCountOptions = useQuery(
    api.games.getImposterCountOptions,
    code ? { code } : "skip"
  );

  const joinGame = useMutation(api.games.joinGame);
  const setReady = useMutation(api.games.setReady);
  const leaveGame = useMutation(api.games.leaveGame);
  const setCategoryPreference = useMutation(api.games.setCategoryPreference);
  const setImposterCount = useMutation(api.games.setImposterCount);
  const submitWord = useMutation(api.games.submitWord);
  const submitVote = useMutation(api.games.submitVote);
  const submitImposterGuess = useMutation(api.games.submitImposterGuess);
  const returnToLobby = useMutation(api.games.returnToLobby);

  useEffect(() => {
    setMounted(true);
    let id = localStorage.getItem("playerId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("playerId", id);
    }
    setPlayerId(id);

    const name = localStorage.getItem("playerName") || "";
    setPlayerName(name);
  }, []);

  // Auto-join game if not already in it
  useEffect(() => {
    if (!mounted || !game || !playerId || !playerName || isJoining) return;

    const isInGame = players?.some((p) => p.playerId === playerId);
    if (!isInGame && game.status === "lobby") {
      setIsJoining(true);
      joinGame({ code, playerId, playerName })
        .catch((error) => {
          console.error("Failed to join game:", error);
          alert(error.message || "Failed to join game");
          router.push("/online");
        })
        .finally(() => setIsJoining(false));
    }
  }, [mounted, game, playerId, playerName, players, isJoining, joinGame, code, router]);

  const handleLeaveGame = async () => {
    if (!playerId) return;
    try {
      await leaveGame({ gameCode: code, playerId });
      router.push("/online");
    } catch (error) {
      console.error("Failed to leave game:", error);
    }
  };

  const handleToggleReady = async () => {
    if (!playerId) return;
    const currentPlayer = players?.find((p) => p.playerId === playerId);
    if (!currentPlayer) return;

    try {
      await setReady({
        gameCode: code,
        playerId,
        isReady: !currentPlayer.isReady,
      });
    } catch (error) {
      console.error("Failed to toggle ready:", error);
    }
  };

  const handleCategoryChange = async (category: string) => {
    if (!game || game.hostId !== playerId) return;
    try {
      await setCategoryPreference({
        gameCode: code,
        hostId: playerId,
        categoryPreference: category,
      });
    } catch (error) {
      console.error("Failed to change category:", error);
    }
  };

  const handleImposterCountChange = async (count: string) => {
    if (!game || game.hostId !== playerId) return;
    try {
      await setImposterCount({
        gameCode: code,
        hostId: playerId,
        imposterCount: parseInt(count),
      });
    } catch (error) {
      console.error("Failed to change imposter count:", error);
    }
  };

  const handleSubmitWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || !playerId) return;

    try {
      await submitWord({
        gameCode: code,
        playerId,
        word: wordInput.trim(),
      });
      setWordInput("");
    } catch (error: any) {
      alert(error.message || "Failed to submit word");
    }
  };

  const handleSubmitVote = async () => {
    if (!voteFor || !playerId) return;

    try {
      await submitVote({
        gameCode: code,
        voterId: playerId,
        votedForPlayerId: voteFor,
      });
    } catch (error: any) {
      alert(error.message || "Failed to submit vote");
    }
  };

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessWord.trim() || !playerId) return;

    try {
      await submitImposterGuess({
        gameCode: code,
        playerId,
        guess: guessWord.trim(),
      });
    } catch (error: any) {
      alert(error.message || "Failed to submit guess");
    }
  };

  const handleReturnToLobby = async () => {
    if (!game || game.hostId !== playerId) return;
    try {
      await returnToLobby({
        gameCode: code,
        hostId: playerId,
      });
    } catch (error: any) {
      alert(error.message || "Failed to return to lobby");
    }
  };

  if (!mounted) return null;

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center p-8">
          <p className="text-muted-foreground">Loading game...</p>
        </Card>
      </main>
    );
  }

  const currentPlayer = players?.find((p) => p.playerId === playerId);
  const isHost = game.hostId === playerId;
  const readyCount = players?.filter((p) => p.isReady).length || 0;
  const totalPlayers = players?.length || 0;
  const isImposter = game.imposterIds?.includes(playerId);

  // LOBBY STATE
  if (game.status === "lobby") {
    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Game Lobby</h1>
            <div className="flex items-center gap-3 mt-2">
              <code className="text-2xl font-mono font-bold bg-muted px-4 py-2 rounded">
                {code}
              </code>
              <Badge variant="outline">
                <Users className="size-3 mr-1" />
                {totalPlayers}/10
              </Badge>
              <Badge variant={game.visibility === "public" ? "default" : "secondary"}>
                {game.visibility === "public" ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLeaveGame}>
            <LogOut className="size-4 mr-2" />
            Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Players ({readyCount}/{totalPlayers} Ready)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players?.map((player) => (
                  <div
                    key={player._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.playerId === playerId ? "bg-primary/5 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {player.isHost && <Crown className="size-4 text-yellow-500" />}
                      <span className="font-medium">{player.playerName}</span>
                      {player.playerId === playerId && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                    {player.isReady && (
                      <Check className="size-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <Button
                onClick={handleToggleReady}
                variant={currentPlayer?.isReady ? "outline" : "default"}
                className="w-full"
                size="lg"
              >
                {currentPlayer?.isReady ? "Not Ready" : "Ready"}
              </Button>
            </CardContent>
          </Card>

          {/* Game Settings (Host Only) */}
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={game.categoryPreference || "Random"}
                  onValueChange={handleCategoryChange}
                  disabled={!isHost}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Imposters</label>
                <Select
                  value={game.imposterCount?.toString() || "1"}
                  onValueChange={handleImposterCountChange}
                  disabled={!isHost || !imposterCountOptions}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imposterCountOptions &&
                      Array.from(
                        { length: imposterCountOptions.max - imposterCountOptions.min + 1 },
                        (_, i) => imposterCountOptions.min + i
                      ).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {!isHost && (
                <p className="text-sm text-muted-foreground">
                  Only the host can change game settings
                </p>
              )}

              {totalPlayers >= 3 && readyCount === totalPlayers && (
                <div className="pt-2">
                  <p className="text-sm text-green-600 font-medium text-center">
                    Game will start automatically when all players are ready!
                  </p>
                </div>
              )}

              {totalPlayers < 3 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Need at least 3 players to start
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ROUND STATES (round-1, round-2, round-3)
  if (game.status?.startsWith("round-")) {
    const currentRound = game.currentRound || 1;
    const isMyTurn = game.currentTurnPlayerId === playerId;
    const currentTurnPlayer = players?.find((p) => p.playerId === game.currentTurnPlayerId);
    const hasSubmitted = currentPlayer?.hasSubmittedWord;

    return (
      <main className="min-h-screen p-4 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Round {currentRound} of 3</h1>
            <Badge variant="outline" className="mt-2">
              Category: {playerWord?.category || game.category}
            </Badge>
          </div>
          <Button variant="ghost" onClick={handleLeaveGame}>
            <LogOut className="size-4 mr-2" />
            Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Display */}
          <Card className={isImposter ? "border-red-500 lg:col-span-1" : "lg:col-span-1"}>
            <CardHeader>
              <CardTitle>Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              {isImposter ? (
                <div className="space-y-2">
                  <div className="text-center p-6 bg-red-500/10 rounded-lg border-2 border-red-500">
                    <p className="text-3xl font-bold text-red-600">IMPOSTER</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You don't know the word. Blend in!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">The word is</p>
                    <p className="text-4xl font-bold">{playerWord?.word}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                Word Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {chatMessages && chatMessages.length > 0 ? (
                  chatMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-3 rounded-lg border ${
                        msg.playerId === playerId ? "bg-primary/5 border-primary" : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{msg.playerName}</span>
                          <Badge variant="outline" className="text-xs">
                            Round {msg.round}
                          </Badge>
                        </div>
                        <span className="text-2xl font-mono font-bold">{msg.word}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No words submitted yet
                  </p>
                )}
              </div>

              <Separator />

              {isMyTurn && !hasSubmitted ? (
                <form onSubmit={handleSubmitWord} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="size-5 text-primary animate-pulse" />
                    <p className="font-semibold text-primary">It's your turn!</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a single word..."
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      maxLength={30}
                      autoFocus
                    />
                    <Button type="submit" disabled={!wordInput.trim()}>
                      <Send className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submit a word related to the category. Don't use the secret word!
                  </p>
                </form>
              ) : hasSubmitted ? (
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500">
                  <Check className="size-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-700">Word submitted!</p>
                  <p className="text-sm text-muted-foreground">
                    Waiting for other players...
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="font-medium">
                    Waiting for {currentTurnPlayer?.playerName}'s turn...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Players Status */}
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {players?.map((player) => (
                <div
                  key={player._id}
                  className={`p-3 rounded-lg border text-center ${
                    player.playerId === game.currentTurnPlayerId
                      ? "ring-2 ring-primary bg-primary/5"
                      : player.hasSubmittedWord
                      ? "bg-green-500/10 border-green-500"
                      : ""
                  }`}
                >
                  <p className="font-medium truncate">{player.playerName}</p>
                  {player.hasSubmittedWord && (
                    <Check className="size-4 text-green-600 mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // VOTING STATE
  if (game.status === "voting") {
    const hasVoted = currentPlayer?.hasVoted;
    const votedCount = players?.filter((p) => p.hasVoted).length || 0;

    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vote for the Imposter</h1>
          <Button variant="ghost" onClick={handleLeaveGame}>
            <LogOut className="size-4 mr-2" />
            Leave
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Voting Progress ({votedCount}/{totalPlayers})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg">
              Who do you think is the imposter?
            </p>

            {!hasVoted ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players
                    ?.filter((p) => p.playerId !== playerId)
                    .map((player) => (
                      <Card
                        key={player._id}
                        className={`cursor-pointer transition-all ${
                          voteFor === player.playerId
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setVoteFor(player.playerId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{player.playerName}</span>
                            {voteFor === player.playerId && (
                              <Check className="size-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                <Button
                  onClick={handleSubmitVote}
                  disabled={!voteFor}
                  className="w-full"
                  size="lg"
                >
                  Submit Vote
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-green-500/10 rounded-lg border border-green-500">
                <Check className="size-12 text-green-600 mx-auto mb-4" />
                <p className="text-xl font-medium text-green-700">Vote submitted!</p>
                <p className="text-muted-foreground mt-2">
                  Waiting for other players to vote...
                </p>
              </div>
            )}

            {/* Players Voting Status */}
            <Separator />
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {players?.map((player) => (
                <div
                  key={player._id}
                  className={`p-2 rounded text-center text-sm ${
                    player.hasVoted ? "bg-green-500/10" : "bg-muted"
                  }`}
                >
                  <p className="truncate">{player.playerName}</p>
                  {player.hasVoted && <Check className="size-3 mx-auto text-green-600" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Review */}
        <Card>
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {chatMessages?.map((msg) => (
                <div key={msg._id} className="p-3 rounded-lg bg-muted border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.playerName}</span>
                      <Badge variant="outline" className="text-xs">
                        Round {msg.round}
                      </Badge>
                    </div>
                    <span className="text-xl font-mono font-bold">{msg.word}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // IMPOSTER GUESS STATE
  if (game.status === "imposter-guess") {
    const votedOutPlayer = players?.find((p) => p.playerId === game.votedOutPlayerId);
    const amVotedOut = game.votedOutPlayerId === playerId;

    return (
      <main className="min-h-screen p-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Imposter's Last Chance</h1>
          <Button variant="ghost" onClick={handleLeaveGame}>
            <LogOut className="size-4 mr-2" />
            Leave
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xl">
                <span className="font-bold">{votedOutPlayer?.playerName}</span> was voted out!
              </p>
              <p className="text-muted-foreground">
                They were an imposter! Can they guess the word?
              </p>
            </div>

            {amVotedOut ? (
              <form onSubmit={handleSubmitGuess} className="space-y-4">
                <div className="p-6 bg-red-500/10 rounded-lg border-2 border-red-500">
                  <p className="text-center text-lg font-semibold mb-4">
                    Guess the secret word to win!
                  </p>
                  <Input
                    placeholder="Enter your guess..."
                    value={guessWord}
                    onChange={(e) => setGuessWord(e.target.value)}
                    maxLength={30}
                    autoFocus
                    className="text-center text-2xl font-bold"
                  />
                </div>
                <Button type="submit" disabled={!guessWord.trim()} className="w-full" size="lg">
                  Submit Guess
                </Button>
              </form>
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-lg">
                  Waiting for <span className="font-bold">{votedOutPlayer?.playerName}</span> to guess...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Review */}
        <Card>
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chatMessages?.map((msg) => (
                <div key={msg._id} className="p-3 rounded-lg bg-muted border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.playerName}</span>
                      <Badge variant="outline" className="text-xs">
                        Round {msg.round}
                      </Badge>
                    </div>
                    <span className="text-xl font-mono font-bold">{msg.word}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // RESULTS STATE
  if (game.status === "results") {
    const votedOutPlayer = players?.find((p) => p.playerId === game.votedOutPlayerId);
    const imposters = players?.filter((p) => game.imposterIds?.includes(p.playerId));
    const didImpostersWin = game.gameWinner === "imposters";
    const wasImposterVotedOut = game.imposterIds?.includes(game.votedOutPlayerId || "");

    return (
      <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Game Over</h1>
          <Button variant="ghost" asChild>
            <Link href="/online">
              <ArrowLeft className="size-4 mr-2" />
              Back to Lobby List
            </Link>
          </Button>
        </div>

        {/* Winner Announcement */}
        <Card className={didImpostersWin ? "border-red-500" : "border-green-500"}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Trophy
                className={`size-20 mx-auto ${
                  didImpostersWin ? "text-red-500" : "text-green-500"
                }`}
              />
              <div>
                <p className="text-3xl font-bold">
                  {didImpostersWin ? "Imposters Win!" : "Players Win!"}
                </p>
                <p className="text-muted-foreground mt-2">
                  {didImpostersWin
                    ? "The imposters successfully deceived everyone!"
                    : "The players successfully identified the imposter!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>The Secret Word</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold">{game.word}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Category: {game.category}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The Imposters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {imposters?.map((imposter) => (
                  <div
                    key={imposter._id}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500"
                  >
                    <p className="font-bold text-center">{imposter.playerName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vote Results */}
        <Card>
          <CardHeader>
            <CardTitle>Voting Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-center text-lg">
                <span className="font-bold">{votedOutPlayer?.playerName}</span> was voted out
              </p>
              {wasImposterVotedOut && game.imposterGuess && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Imposter's guess:</p>
                  <p className="text-2xl font-bold">{game.imposterGuess}</p>
                  {game.imposterGuess.toUpperCase() === game.word.toUpperCase() ? (
                    <p className="text-green-600 font-medium mt-2">Correct!</p>
                  ) : (
                    <p className="text-red-600 font-medium mt-2">Incorrect!</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {chatMessages?.map((msg) => {
                const wasImposter = game.imposterIds?.includes(msg.playerId);
                return (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-lg border ${
                      wasImposter ? "bg-red-500/10 border-red-500" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{msg.playerName}</span>
                        {wasImposter && (
                          <Badge variant="destructive" className="text-xs">
                            Imposter
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Round {msg.round}
                        </Badge>
                      </div>
                      <span className="text-xl font-mono font-bold">{msg.word}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Host Controls */}
        {isHost && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button onClick={handleReturnToLobby} className="w-full" size="lg">
                  Return to Lobby
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Start a new game with the same players
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    );
  }

  return null;
}
