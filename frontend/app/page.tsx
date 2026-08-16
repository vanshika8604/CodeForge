"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { RoomCard } from "@/components/RoomCard";

interface Room {
  id: string;
  name: string;
  language: string;
  joinCode: string;
}

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchRooms();
  }, [user]);

  async function fetchRooms() {
    setRoomsLoading(true);
    try {
      const res = await api.rooms.list();
      setRooms(res.rooms);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setRoomsLoading(false);
    }
  }

  async function handleCreate(name: string, language: string) {
    const res = await api.rooms.create({ name, language });
    router.push(`/rooms/${res.room.id}`);
  }

  async function handleJoin(joinCode: string) {
    const res = await api.rooms.join(joinCode);
    router.push(`/rooms/${res.room.id}`);
  }

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Welcome to CodeForge</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push("/login")} className="border rounded px-4 py-2">
            Log in
          </button>
          <button onClick={() => router.push("/register")} className="bg-black text-white rounded px-4 py-2">
            Sign up
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
        <button onClick={logout} className="border rounded px-4 py-2">
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CreateRoomForm onCreate={handleCreate} />
        <JoinRoomForm onJoin={handleJoin} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Your rooms</h2>

        {roomsLoading ? (
          <p className="text-gray-500">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500">No rooms yet — create or join one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}