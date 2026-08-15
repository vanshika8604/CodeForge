"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(values: { name?: string; email: string; password: string }) {
    await register(values.name || "", values.email, values.password);
    router.push("/");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-semibold">Create your CodeForge account</h1>
      <AuthForm mode="register" onSubmit={handleSubmit} />
    </main>
  );
}