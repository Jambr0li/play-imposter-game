"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft } from "lucide-react";

export default function InPersonMode() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="text-center max-w-md w-full shadow-lg">
        <CardContent className="space-y-8 pt-12 pb-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">
              In-Person Mode
            </h1>
            <p className="text-lg text-muted-foreground">
              Play together in the same room
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              size="lg"
              className="w-full text-lg h-12"
            >
              <Link href="/host">Host Game</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full text-lg h-12"
            >
              <Link href="/join">Join Game</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
            <Users className="size-4" />
            <span>3-10 players</span>
          </div>

          <Button
            asChild
            variant="ghost"
            className="w-full"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <ArrowLeft className="size-4" />
              Back to Menu
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
