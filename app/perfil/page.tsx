"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setNickname(data.nickname || "");
    }

    setCargando(false);
  }

  async function guardarPerfil() {
    setMensaje("");

    if (!nickname.trim()) {
      setMensaje("Debes ingresar un nickname");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        nickname: nickname.trim(),
      });

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje("Perfil guardado correctamente");
  }

  if (cargando) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Cargando perfil...
        </h1>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mi Perfil
      </h1>

      <div className="border rounded p-6">
        <p className="mb-4">
          <strong>Correo:</strong> {email}
        </p>

        <label className="block mb-2 font-medium">
          Nickname
        </label>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Ej: Jorge"
        />

        <button
          onClick={guardarPerfil}
          className="border px-4 py-2 rounded mt-4"
        >
          Guardar
        </button>

        {mensaje && (
          <p className="mt-4">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}