"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EstadisticasPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  function signo(local: number, visitante: number) {
    if (local > visitante) return "1";
    if (local < visitante) return "2";
    return "X";
  }

  async function cargarEstadisticas() {
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
        nickname: string;
        puntos: number;
        exactos: number;
        pronosticos: number;
      }
    > = {};

    profiles.forEach((p) => {
      tabla[p.id] = {
        nickname: p.nickname || "Usuario",
        puntos: 0,
        exactos: 0,
        pronosticos: 0,
      };
    });

    for (const p of pronosticos) {
      if (!tabla[p.usuario_id]) continue;

      tabla[p.usuario_id].pronosticos++;

      const partido = partidos.find(
        (x) => x.id === p.partido_id
      );

      if (!partido) continue;

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

    const jugadores = Object.values(tabla);

    const lider = [...jugadores].sort(
      (a, b) => b.puntos - a.puntos
    )[0];

    const masExactos = [...jugadores].sort(
      (a, b) => b.exactos - a.exactos
    )[0];

    const masActivo = [...jugadores].sort(
      (a, b) => b.pronosticos - a.pronosticos
    )[0];

    const mejorPromedio = [...jugadores].sort((a, b) => {
      const promA =
        a.pronosticos > 0
          ? a.puntos / a.pronosticos
          : 0;

      const promB =
        b.pronosticos > 0
          ? b.puntos / b.pronosticos
          : 0;

      return promB - promA;
    })[0];

    setStats({
      usuarios: profiles.length,
      partidos: partidos.length,
      pronosticos: pronosticos.length,
      lider,
      masExactos,
      masActivo,
      mejorPromedio,
    });
  }

  if (!stats) {
    return (
      <main className="p-8">
        Cargando estadísticas...
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        📈 Estadísticas Generales
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            👥 Usuarios
          </h2>
          <p className="text-3xl">
            {stats.usuarios}
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            ⚽ Partidos
          </h2>
          <p className="text-3xl">
            {stats.partidos}
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            📝 Pronósticos
          </h2>
          <p className="text-3xl">
            {stats.pronosticos}
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            🥇 Líder Actual
          </h2>
          <p>
            {stats.lider?.nickname}
          </p>
          <p className="text-2xl font-bold">
            {stats.lider?.puntos} pts
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            🎯 Más Exactos
          </h2>
          <p>
            {stats.masExactos?.nickname}
          </p>
          <p className="text-2xl font-bold">
            {stats.masExactos?.exactos}
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            🔥 Más Activo
          </h2>
          <p>
            {stats.masActivo?.nickname}
          </p>
          <p className="text-2xl font-bold">
            {stats.masActivo?.pronosticos}
          </p>
        </div>

        <div className="border rounded p-5">
          <h2 className="font-bold mb-2">
            📊 Mejor Promedio
          </h2>
          <p>
            {stats.mejorPromedio?.nickname}
          </p>
          <p className="text-2xl font-bold">
            {(
              stats.mejorPromedio.puntos /
              Math.max(
                stats.mejorPromedio.pronosticos,
                1
              )
            ).toFixed(2)}
          </p>
        </div>

      </div>
    </main>
  );
}