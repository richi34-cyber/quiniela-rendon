"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MisResultadosPage() {
  const [filas, setFilas] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    puntos: 0,
    exactos: 0,
    pronosticos: 0,
  });

  useEffect(() => {
    cargar();
  }, []);

  function signo(local: number, visitante: number) {
    if (local > visitante) return "1";
    if (local < visitante) return "2";
    return "X";
  }

  async function cargar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: pronosticos } = await supabase
      .from("pronosticos")
      .select("*")
      .eq("usuario_id", user.id);

    const { data: partidos } = await supabase
      .from("partidos")
      .select("*");

    let puntosTotales = 0;
    let exactosTotales = 0;

    const resultado = (pronosticos || []).map(
      (p) => {
        const partido = partidos?.find(
          (x) => x.id === p.partido_id
        );

        let puntos = 0;

        if (
          partido?.resultado_local !== null &&
          partido?.resultado_visitante !== null
        ) {
          const real = signo(
            partido.resultado_local,
            partido.resultado_visitante
          );

          const pred = signo(
            p.goles_local,
            p.goles_visitante
          );

          if (real === pred) {
            puntos += 1;
          }

          const exacto =
            partido.resultado_local ===
              p.goles_local &&
            partido.resultado_visitante ===
              p.goles_visitante;

          if (exacto) {
            puntos += 2;
            exactosTotales++;
          }

          puntosTotales += puntos;
        }

        return {
          partido:
            partido?.local +
            " vs " +
            partido?.visitante,
          pronostico:
            p.goles_local +
            " - " +
            p.goles_visitante,
          resultado:
            partido?.resultado_local != null
              ? `${partido.resultado_local} - ${partido.resultado_visitante}`
              : "-",
          puntos,
        };
      }
    );

    setFilas(resultado);

    setEstadisticas({
      puntos: puntosTotales,
      exactos: exactosTotales,
      pronosticos: pronosticos?.length || 0,
    });
  }

  const promedio =
    estadisticas.pronosticos > 0
      ? (
          estadisticas.puntos /
          estadisticas.pronosticos
        ).toFixed(2)
      : "0";

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        📊 Mis Resultados
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded p-4">
          <div className="text-sm">
            Puntos Totales
          </div>
          <div className="text-2xl font-bold">
            {estadisticas.puntos}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm">
            Exactos
          </div>
          <div className="text-2xl font-bold">
            {estadisticas.exactos}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm">
            Pronósticos
          </div>
          <div className="text-2xl font-bold">
            {estadisticas.pronosticos}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm">
            Promedio
          </div>
          <div className="text-2xl font-bold">
            {promedio}
          </div>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">
                Partido
              </th>
              <th className="p-3 text-left">
                Pronóstico
              </th>
              <th className="p-3 text-left">
                Resultado
              </th>
              <th className="p-3 text-left">
                Puntos
              </th>
            </tr>
          </thead>

          <tbody>
            {filas.map((fila, i) => (
              <tr
                key={i}
                className="border-b"
              >
                <td className="p-3">
                  {fila.partido}
                </td>

                <td className="p-3">
                  {fila.pronostico}
                </td>

                <td className="p-3">
                  {fila.resultado}
                </td>

                <td className="p-3 font-bold">
                  {fila.puntos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}