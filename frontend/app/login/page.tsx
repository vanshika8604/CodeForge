"use client";
import Link from "next/link";
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
  <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center px-4">
    <div className="w-full max-w-sm bg-[#111722] border border-[#1a2232] rounded-2xl p-8 flex flex-col gap-6">
      <div className="text-center">
        <div className="text-indigo-400 text-2xl mb-2">⌘</div>
        <h1 className="text-lg font-semibold">Log in to CodeForge</h1>
      </div>
      <AuthForm mode="login" onSubmit={handleSubmit} />
      <p className="text-xs text-center text-gray-500">
        No account? <Link href="/register" className="text-indigo-400 hover:underline">
  Sign up
</Link>
      </p>
    </div>
  </main>
);
}