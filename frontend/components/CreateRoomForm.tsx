"use client";

import { useState, FormEvent } from "react";

interface CreateRoomFormProps {
  onCreate: (name: string, language: string) => Promise<void>;
}

const LANGUAGES = ["javascript", "python", "typescript", "java", "cpp"];

export function CreateRoomForm({ onCreate }: CreateRoomFormProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(name.trim(), language);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border rounded p-4">
      <h2 className="font-semibold">Create a room</h2>

      <input
        type="text"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2"
        required
      />

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border rounded px-3 py-2"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create room"}
      </button>
    </form>
  );
}