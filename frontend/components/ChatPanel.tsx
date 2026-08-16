"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  currentUserId: string;
}

export function ChatPanel({ messages, onSend, currentUserId }: ChatPanelProps) {
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
    <div className="flex flex-col h-full border rounded">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`max-w-[75%] rounded px-3 py-2 text-sm ${
                isMe ? "self-end bg-blue-600 text-white" : "self-start bg-gray-800 text-gray-100"
              }`}
            >
              {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender.name}</p>}
              <p>{msg.content}</p>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-black text-white rounded px-4 py-2 text-sm">
          Send
        </button>
      </form>
    </div>
  );
}