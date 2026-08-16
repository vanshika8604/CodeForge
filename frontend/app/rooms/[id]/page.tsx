"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { CodeEditor } from "@/components/CodeEditor";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { connected, initialCode, initialLanguage, socketRef } = useRoomSocket(roomId);

  useEffect(() => {
    api.rooms
      .getOne(roomId)
      .then((res) => setRoom(res.room))
      .catch((err) => setError(err.message));
  }, [roomId]);

  if (error) {
    return <main className="p-8 text-red-600">{error}</main>;
  }

  if (!room || !connected) {
    return <main className="p-8">Connecting to room...</main>;
  }

  return (
    <main className="p-8 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{room.name}</h1>
        <p className="text-gray-500 text-sm">Join code: {room.joinCode}</p>
      </div>

      <CodeEditor
        roomId={roomId}
        socketRef={socketRef}
        initialCode={initialCode}
        language={initialLanguage}
      />
    </main>
  );
}