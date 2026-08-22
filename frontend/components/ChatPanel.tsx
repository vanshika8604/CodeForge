"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  currentUserId: string;
}

export function ChatPanel({
  messages,
  onSend,
  currentUserId,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!draft.trim()) return;

    onSend(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chat header */}
      <div className="px-3 py-2.5 border-b border-[#1a2232] text-xs font-medium text-gray-400 shrink-0">
        Chat
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <EmptyState
            title="No messages yet"
            description="Say hello to your collaborators."
          />
        )}

        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;

          return (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                isMe
                  ? "self-end bg-indigo-600 text-white"
                  : "self-start bg-[#161d2b] text-gray-100"
              }`}
            >
              {!isMe && (
                <p className="text-[10px] text-gray-400 mb-0.5">
                  {msg.sender.name}
                </p>
              )}

              <p className="break-words">{msg.content}</p>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-[#1a2232] p-2 shrink-0"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 min-w-0"
        />

        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}