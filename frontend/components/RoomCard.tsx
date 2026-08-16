"use client";

import { useRouter } from "next/navigation";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    language: string;
    joinCode: string;
  };
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/rooms/${room.id}`)}
      className="border rounded p-4 text-left hover:bg-gray-50 transition"
    >
      <h3 className="font-semibold">{room.name}</h3>
      <p className="text-sm text-gray-500">{room.language}</p>
      <p className="text-xs text-gray-400 mt-2">Code: {room.joinCode}</p>
    </button>
  );
}