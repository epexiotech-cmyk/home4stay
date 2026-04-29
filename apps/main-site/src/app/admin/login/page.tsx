"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // HARDCODED CREDENTIALS
    if (username === "admin" && password === "123456") {
      // Set simple cookie
      document.cookie = "admin-auth=true; path=/";
      router.push("/admin/leads");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900">Admin Login</h1>
          <p className="mt-2 text-zinc-500">Manage Home4Stay properties & leads</p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-900">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 py-4 font-bold text-white transition hover:bg-zinc-800"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Secure admin access only • © 2026 Home4Stay
        </p>
      </div>
    </div>
  );
}
