"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

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
      className="text-left bg-[#111722] border border-[#1a2232] rounded-xl p-4
        hover:border-indigo-500/50 hover:bg-[#141b28]
        transition-colors duration-150 w-full"
    >
      <div className="flex items-center justify-between mb-2 gap-3">
        <h3 className="font-medium text-sm text-gray-100 truncate">
          {room.name}
        </h3>

        <Badge tone="neutral">{room.language}</Badge>
      </div>

      <p className="text-xs text-gray-600 font-mono">
        {room.joinCode}
      </p>
    </button>
  );
}