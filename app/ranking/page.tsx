"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RankingItem = {
  usuario_id: string;
  nickname: string;
  puntos: number;
  exactos: number;
  pronosticos: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [miUsuario, setMiUsuario] = useState("");

  useEffect(() => {
    cargarRanking();
  }, []);

  function signo(local: number, visitante: number) {
    if (local > visitante) return "1";
    if (local < visitante) return "2";
    return "X";
  }

  async function cargarRanking() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setMiUsuario(user.id);
    }

    const [
      partidosResp,
      pronosticosResp,
      profilesResp,
    ] = await Promise.all([
      supabase.from("partidos").select("*"),
      supabase.from("pronosticos").select("*"),
      supabase.from("profiles").select("*"),
    ]);

    const partidos = partidosResp.data || [];
    const pronosticos = pronosticosResp.data || [];
    const profiles = profilesResp.data || [];

    const tabla: Record<
      string,
      {
        puntos: number;
        exactos: number;
        pronosticos: number;
      }
    > = {};

    for (const p of pronosticos) {
      const partido = partidos.find(
        (x) => x.id === p.partido_id
      );

      if (!partido) continue;

      if (!tabla[p.usuario_id]) {
        tabla[p.usuario_id] = {
          puntos: 0,
          exactos: 0,
          pronosticos: 0,
        };
      }

      tabla[p.usuario_id].pronosticos++;

      if (
        partido.resultado_local === null ||
        partido.resultado_visitante === null
      ) {
        continue;
      }

      const real = signo(
        partido.resultado_local,
        partido.resultado_visitante
      );

      const pred = signo(
        p.goles_local,
        p.goles_visitante
      );

      if (real === pred) {
        tabla[p.usuario_id].puntos += 1;
      }

      const exacto =
        partido.resultado_local === p.goles_local &&
        partido.resultado_visitante === p.goles_visitante;

      if (exacto) {
        tabla[p.usuario_id].puntos += 2;
        tabla[p.usuario_id].exactos += 1;
      }
    }

    const resultado: RankingItem[] = Object.entries(tabla).map(
      ([usuario_id, datos]) => {
        const profile = profiles.find(
          (p) => p.id === usuario_id
        );

        return {
          usuario_id,
          nickname: profile?.nickname || "Usuario",
          puntos: datos.puntos,
          exactos: datos.exactos,
          pronosticos: datos.pronosticos,
        };
      }
    );

    resultado.sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      return b.exactos - a.exactos;
    });

    setRanking(resultado);
    setCargando(false);
  }

  function medalla(posicion: number) {
    if (posicion === 0) return "🥇";
    if (posicion === 1) return "🥈";
    if (posicion === 2) return "🥉";
    return `${posicion + 1}`;
  }

  if (cargando) {
    return (
      <main className="p-8">
        Cargando ranking...
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Ranking Mundial 2026
      </h1>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-3 text-left">Pos</th>
              <th className="p-3 text-left">Jugador</th>
              <th className="p-3 text-left">Puntos</th>
              <th className="p-3 text-left">Exactos</th>
              <th className="p-3 text-left">Pronósticos</th>
            </tr>
          </thead>

          <tbody>
            {ranking.map((fila, index) => {
              const esYo =
                fila.usuario_id === miUsuario;

              return (
                <tr
                  key={fila.usuario_id}
                  className={
                    esYo
                      ? "border-b bg-green-100 font-semibold"
                      : "border-b"
                  }
                >
                  <td className="p-3">
                    {medalla(index)}
                  </td>

                  <td className="p-3">
                    {fila.nickname}
                    {esYo && (
                      <span className="ml-2">
                        (Tú)
                      </span>
                    )}
                  </td>

                  <td className="p-3 font-bold">
                    {fila.puntos}
                  </td>

                  <td className="p-3">
                    {fila.exactos}
                  </td>

                  <td className="p-3">
                    {fila.pronosticos}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}