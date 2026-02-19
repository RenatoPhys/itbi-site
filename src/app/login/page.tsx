"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Verifique seu e-mail para confirmar o cadastro!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleOAuthLogin(provider: "google" | "facebook") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {isSignUp ? "Criar conta" : "Entrar"}
        </h1>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </button>

          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-[#1877F2] py-3 font-medium text-white transition-colors hover:bg-[#166FE5] dark:border-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Entrar com Facebook
          </button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">ou</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="font-medium text-blue-600 hover:underline"
          >
            {isSignUp ? "Entrar" : "Cadastrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
