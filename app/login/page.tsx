"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">
          La Quiniela Rendón ⚽
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={login}
          disabled={loading}
          className="border p-2 w-full"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}