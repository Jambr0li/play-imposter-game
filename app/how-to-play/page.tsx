"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Users, Eye, MessageCircle, RotateCcw } from "lucide-react";

export default function HowToPlay() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl text-center">
              How to Play
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Setup */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold">Setup</h2>
              </div>
              <p className="text-muted-foreground pl-10">
                One player hosts a game and receives a unique 6-digit code. Share this code with your friends so they can join.
              </p>
            </div>

            {/* Joining */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Join & Configure
                </h2>
              </div>
              <p className="text-muted-foreground pl-10">
                Players enter the game code and their name to join. The host can configure the category and number of imposters. You need 3-10 players to start.
              </p>
            </div>

            {/* Ready Up */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Ready Up
                </h2>
              </div>
              <p className="text-muted-foreground pl-10">
                When everyone is in the waiting room, all players mark themselves as ready. The game automatically starts when everyone is ready.
              </p>
            </div>

            {/* Game Start */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Eye className="size-5" />
                  Receive Your Word
                </h2>
              </div>
              <p className="text-muted-foreground pl-10">
                <strong>Regular players</strong> see a word from the chosen category. <strong className="text-destructive">Imposters</strong> only see the category but NOT the word. Everyone can see who the other players are.
              </p>
            </div>

            {/* Objective */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageCircle className="size-5" />
                  Play & Discuss
                </h2>
              </div>
              <div className="text-muted-foreground pl-10 space-y-2">
                <p>
                  <strong>Regular players:</strong> Describe the word without saying it directly. Try to identify who doesn't know the word.
                </p>
                <p className="text-destructive font-medium">
                  <strong>Imposters:</strong> Blend in! Listen carefully and try to figure out what the word is based on others' descriptions.
                </p>
                <p className="mt-3">
                  Discuss amongst yourselves to figure out who the imposter(s) are!
                </p>
              </div>
            </div>

            {/* New Round */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <RotateCcw className="size-5" />
                  Play Again
                </h2>
              </div>
              <p className="text-muted-foreground pl-10">
                After finding the imposter(s), the host can start a new round with the same players. New roles will be assigned randomly!
              </p>
            </div>

            {/* Player Count */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <Users className="size-5 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-semibold">3-10 Players</p>
                    <p className="text-sm text-muted-foreground">
                      Best played with voice chat or in person
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full"
        >
          <Link href="/">
            <ArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
