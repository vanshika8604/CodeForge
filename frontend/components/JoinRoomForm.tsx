"use client";

import { useState, FormEvent } from "react";

interface JoinRoomFormProps {
  onJoin: (joinCode: string) => Promise<void>;
}

export function JoinRoomForm({ onJoin }: JoinRoomFormProps) {
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onJoin(joinCode.trim().toUpperCase());
      setJoinCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border rounded p-4">
      <h2 className="font-semibold">Join a room</h2>

      <input
        type="text"
        placeholder="Join code (e.g. 7XQ2FP)"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        className="border rounded px-3 py-2 uppercase"
        required
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="border rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting ? "Joining..." : "Join room"}
      </button>
    </form>
  );
}