"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRoomSocket } from "@/hooks/useRoomSocket";

import { CodeEditor } from "@/components/CodeEditor";
import { PresenceList } from "@/components/PresenceList";
import { ChatPanel } from "@/components/ChatPanel";
import { RunPanel } from "@/components/RunPanel";
import { ReviewPanel } from "@/components/ReviewPanel";

import { Badge } from "@/components/ui/Badge";
import { StatusDot } from "@/components/ui/StatusDot";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const { user } = useAuth();

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    connected,
    initialCode,
    initialLanguage,
    presentUsers,
    messages,
    sendMessage,
    socketRef,
  } = useRoomSocket(roomId);

  useEffect(() => {
    api.rooms
      .getOne(roomId)
      .then((res) => setRoom(res.room))
      .catch((err) => setError(err.message));
  }, [roomId]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0e14] text-gray-100 flex items-center justify-center px-6">
        <div className="rounded-xl border border-red-900/50 bg-[#111722] px-6 py-5 text-center">
          <p className="text-sm font-medium text-red-400">
            Unable to load room
          </p>
          <p className="mt-1 text-xs text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!room || !connected || !user) {
    return (
      <main className="h-screen bg-[#0a0e14] text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">
            Connecting to room...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-[#0a0e14] text-gray-100 overflow-hidden">
      {/* Room Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2232] bg-[#0d121c] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            C
          </div>

          <h1 className="text-sm font-medium truncate max-w-[220px]">
            {room.name}
          </h1>

          <Badge tone="neutral">{room.joinCode}</Badge>
          <Badge tone="neutral">{initialLanguage}</Badge>
        </div>

        <div className="flex items-center gap-4">
          <StatusDot connected={connected} />
          <PresenceList users={presentUsers} />
        </div>
      </header>

      {/* IDE Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditor
              roomId={roomId}
              socketRef={socketRef}
              initialCode={initialCode}
              language={initialLanguage}
            />
          </div>

          {/* Run + Review Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-t border-[#1a2232] bg-[#0d121c] shrink-0">
            <RunPanel roomId={roomId} />
            <ReviewPanel roomId={roomId} />
          </div>
        </div>

        {/* Chat Sidebar */}
        <aside className="border-l border-[#1a2232] bg-[#0d121c] flex flex-col min-h-0">
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            currentUserId={user.id}
          />
        </aside>
      </div>
    </main>
  );
}