"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMINS = ["richi34@gmail.com"];

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
    }

    checkUser();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const esAdmin = ADMINS.includes(email);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">

            <img
              src="/logo-quiniela.png"
              alt="La Quiniela Rendón"
              className="w-72 md:w-96 rounded-2xl"
            />

            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3">
                La Quiniela Rendón ⚽
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                Mundial 2026
              </p>

              <p className="text-lg">
                Bienvenido:
                <strong className="ml-2">
                  {email}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <button
            onClick={() => router.push("/quiniela")}
            className="bg-green-50 border rounded-3xl p-8 text-left shadow hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">
              ⚽
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Pronósticos
            </h2>

            <p className="text-gray-600">
              Realiza tus predicciones para los partidos.
            </p>
          </button>

          <button
            onClick={() => router.push("/ranking")}
            className="bg-blue-50 border rounded-3xl p-8 text-left shadow hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">
              🏆
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Ranking
            </h2>

            <p className="text-gray-600">
              Consulta la clasificación familiar.
            </p>
          </button>

          <button
            onClick={() => router.push("/perfil")}
            className="bg-purple-50 border rounded-3xl p-8 text-left shadow hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">
              👤
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Mi Perfil
            </h2>

            <p className="text-gray-600">
              Cambia tu nickname y tus datos.
            </p>
          </button>

          {esAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="bg-orange-50 border rounded-3xl p-8 text-left shadow hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">
                ⚙️
              </div>

              <h2 className="text-2xl font-bold mb-2">
                Administración
              </h2>

              <p className="text-gray-600">
                Gestiona partidos y resultados.
              </p>
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="bg-white border rounded-xl px-6 py-3 shadow hover:shadow-lg"
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </main>
  );
}