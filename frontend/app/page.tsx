"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
      <button onClick={logout} className="border rounded px-4 py-2">
        Log out
      </button>
      {/* Room list and creation UI comes in the next frontend milestone */}
    </main>
  );
}