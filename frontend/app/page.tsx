"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";
import { RoomCard } from "@/components/RoomCard";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusDot } from "@/components/ui/StatusDot";

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
    if (!user) {
      setRoomsLoading(false);
      return;
    }

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

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0e14] text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading CodeForge...</p>
        </div>
      </main>
    );
  }

  // Logged-out landing page
  if (!user) {
    return (
      <main className="min-h-screen bg-[#0a0e14] text-gray-100 flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#1a2232]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              C
            </div>

            <span className="font-semibold text-lg tracking-tight">
              CodeForge
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
            >
              Log in
            </Button>

            <Button
              variant="primary"
              onClick={() => router.push("/register")}
            >
              Sign up
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <Badge tone="info">
            Real-time · Multiplayer · AI-assisted
          </Badge>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            Code together.
            <br />
            <span className="text-indigo-400">
              Build together.
            </span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
            CodeForge is a real-time collaborative coding platform where
            you can write, run, review, and discuss code together in the
            same room.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="primary"
              className="px-6 py-3"
              onClick={() => router.push("/register")}
            >
              Create a room →
            </Button>

            <Button
              variant="secondary"
              className="px-6 py-3"
              onClick={() => router.push("/login")}
            >
              Join a room
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "⌘",
                title: "Live editor",
                description:
                  "Monaco-powered coding with changes synchronized instantly across collaborators.",
              },
              {
                icon: "▶",
                title: "Run & review",
                description:
                  "Execute your code and get AI-powered feedback without leaving the room.",
              },
              {
                icon: "💬",
                title: "Built-in chat",
                description:
                  "Discuss solutions with your teammates without switching between apps.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#1a2232] bg-[#111722] p-5 hover:border-[#232b3d] transition-colors"
              >
                <div className="mb-4 h-9 w-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {feature.icon}
                </div>

                <h3 className="font-medium text-sm text-gray-100">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // Logged-in dashboard
  return (
    <main className="min-h-screen bg-[#0a0e14] text-gray-100">
      {/* Dashboard Navbar */}
      <nav className="border-b border-[#1a2232] bg-[#0d1119]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              C
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                CodeForge
              </p>

              <StatusDot connected />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-200">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                Developer
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={logout}
            >
              Log out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge tone="success">
            Welcome back
          </Badge>

          <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
            Hey, {user.name}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a workspace or jump back into one of your rooms.
          </p>
        </div>

        {/* Create / Join */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
          <div className="rounded-xl border border-[#232b3d] bg-[#111722] p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-100">
                Create a room
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Start a new collaborative coding workspace.
              </p>
            </div>

            <CreateRoomForm onCreate={handleCreate} />
          </div>

          <div className="rounded-xl border border-[#232b3d] bg-[#111722] p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-100">
                Join a room
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Enter a room code shared by another developer.
              </p>
            </div>

            <JoinRoomForm onJoin={handleJoin} />
          </div>
        </section>

        {/* Rooms */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Your rooms
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Your recent collaborative workspaces
              </p>
            </div>

            {rooms.length > 0 && (
              <Badge tone="neutral">
                {rooms.length}{" "}
                {rooms.length === 1 ? "room" : "rooms"}
              </Badge>
            )}
          </div>

          {roomsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-xl border border-[#1a2232] bg-[#111722] animate-pulse"
                />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232b3d] bg-[#111722]/50">
              <EmptyState
                title="No rooms yet"
                description="Create your first room above or join a room using a shared code."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}