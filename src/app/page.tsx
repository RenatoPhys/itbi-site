import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 p-8">
        <div className="rounded-2xl bg-white p-10 shadow-lg dark:bg-gray-900">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ITBI
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Sistema de cálculo e consulta de ITBI
          </p>
          <div className="mt-6 flex gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              MVP
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              Next.js
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              Supabase
            </span>
          </div>

          <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Logado como
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.email}
            </p>
          </div>

          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
