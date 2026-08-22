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
    return <main className="p-8 text-red-600">{error}</main>;
  }

  if (!room || !connected || !user) {
    return <main className="p-8">Connecting to room...</main>;
  }

  return (
    <main className="p-8 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{room.name}</h1>

          <p className="text-gray-500 text-sm">
            Join code: {room.joinCode}
          </p>
        </div>

        <PresenceList users={presentUsers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="flex flex-col gap-3">
          <CodeEditor
            roomId={roomId}
            socketRef={socketRef}
            initialCode={initialCode}
            language={initialLanguage}
          />

          <div className="grid grid-cols-2 gap-3">
            <RunPanel roomId={roomId} />
            <ReviewPanel roomId={roomId} />
          </div>
        </div>

        <div className="h-[70vh]">
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            currentUserId={user.id}
          />
        </div>
      </div>
    </main>
  );
}