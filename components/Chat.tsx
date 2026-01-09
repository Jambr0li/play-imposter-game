"use client";

import { useEffect, useRef, Component, ReactNode, ErrorInfo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

// Error boundary to catch rendering errors from Convex queries
class ChatErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error but don't crash
    console.error("Chat component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Show a fallback UI when chat fails to load
      return (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="size-5" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="h-48 overflow-y-auto px-4 space-y-2"
              data-testid="chat-messages"
            >
              <p className="text-sm text-muted-foreground text-center py-4">
                Chat is loading...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

interface ChatProps {
  gameCode: string;
  currentPlayerId: string;
}

function ChatContent({ gameCode, currentPlayerId }: ChatProps) {
  const messages = useQuery(api.chat.getMessages, { gameCode });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="size-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages container with scroll */}
        <div
          ref={scrollRef}
          className="h-48 overflow-y-auto px-4 space-y-2"
          data-testid="chat-messages"
        >
          {messages === undefined && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading messages...
            </p>
          )}
          {messages?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No messages yet. Say hello!
            </p>
          )}
          {messages?.map((msg, index) => {
            const isOwnMessage = msg.playerId === currentPlayerId;

            return (
              <div
                key={`${msg.sentAt}-${index}`}
                className={`flex items-start gap-2 ${
                  isOwnMessage ? "flex-row-reverse" : ""
                }`}
                data-testid="chat-message"
              >
                {/* Avatar */}
                <span className="text-xl flex-shrink-0" data-testid="chat-avatar">
                  {msg.avatar}
                </span>

                {/* Message bubble */}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1" data-testid="chat-player-name">
                    {msg.playerName}
                  </p>
                  <p className="text-sm break-words" data-testid="chat-message-content">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Export the wrapped component
export function Chat(props: ChatProps) {
  return (
    <ChatErrorBoundary>
      <ChatContent {...props} />
    </ChatErrorBoundary>
  );
}
