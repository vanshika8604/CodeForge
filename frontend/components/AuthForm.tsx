"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (values: {
    name?: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        name: mode === "register" ? name : undefined,
        email,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      {mode === "register" && (
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <p className="text-red-400 text-xs">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full mt-1"
      >
        {submitting
          ? "Please wait..."
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>
    </form>
  );
}