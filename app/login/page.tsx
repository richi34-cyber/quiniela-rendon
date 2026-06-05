"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Revisa tu correo para iniciar sesión.");
    }
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

        <button
          onClick={login}
          className="border p-2 w-full"
        >
          Enviar enlace de acceso
        </button>
      </div>
    </main>
  );
}