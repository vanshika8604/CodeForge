"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(values: { email: string; password: string }) {
    await login(values.email, values.password);
    router.push("/");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-semibold">Log in to CodeForge</h1>
      <AuthForm mode="login" onSubmit={handleSubmit} />
    </main>
  );
}