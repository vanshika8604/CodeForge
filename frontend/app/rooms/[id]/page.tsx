"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.rooms
      .getOne(roomId)
      .then((res) => setRoom(res.room))
      .catch((err) => setError(err.message));
  }, [roomId]);

  if (error) {
    return <main className="p-8 text-red-600">{error}</main>;
  }

  if (!room) {
    return <main className="p-8">Loading room...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{room.name}</h1>
      <p className="text-gray-500">Join code: {room.joinCode}</p>
      <p className="text-gray-500">Language: {room.language}</p>
      {/* Monaco editor + live collaboration comes in the next milestone */}
    </main>
  );
}