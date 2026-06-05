"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function QuinielaPage() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [pronosticos, setPronosticos] = useState<Record<number, any>>({});
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPartidos();
    cargarPronosticos();
  }, []);

  async function cargarPartidos() {
    const { data } = await supabase
      .from("partidos")
      .select("*")
      .order("fecha");

    setPartidos(data || []);
  }

  async function cargarPronosticos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("pronosticos")
      .select("*")
      .eq("usuario_id", user.id);

    const mapa: Record<number, any> = {};

    data?.forEach((p) => {
      mapa[p.partido_id] = {
        goles_local: p.goles_local,
        goles_visitante: p.goles_visitante,
      };
    });

    setPronosticos(mapa);
  }

  function actualizarPronostico(
    partidoId: number,
    campo: string,
    valor: number
  ) {
    setPronosticos((prev) => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [campo]: valor,
      },
    }));
  }

  async function guardarPronostico(
    partidoId: number
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const datos = pronosticos[partidoId];

    const { error } = await supabase
      .from("pronosticos")
      .upsert({
        usuario_id: user.id,
        partido_id: partidoId,
        goles_local: datos?.goles_local ?? 0,
        goles_visitante:
          datos?.goles_visitante ?? 0,
      });

    if (error) {
      setMensaje(error.message);
    } else {
      setMensaje("Pronóstico guardado");
    }
  }

  function obtenerSigno(
    local: number,
    visitante: number
  ) {
    if (local > visitante) return "1";
    if (local < visitante) return "2";
    return "X";
  }

  function calcularPuntos(partido: any) {
    const pronostico =
      pronosticos[partido.id];

    if (!pronostico) return null;

    if (
      partido.resultado_local === null ||
      partido.resultado_visitante === null
    ) {
      return null;
    }

    const signoReal = obtenerSigno(
      partido.resultado_local,
      partido.resultado_visitante
    );

    const signoPronosticado =
      obtenerSigno(
        pronostico.goles_local,
        pronostico.goles_visitante
      );

    const exacto =
      partido.resultado_local ===
        pronostico.goles_local &&
      partido.resultado_visitante ===
        pronostico.goles_visitante;

    if (exacto) {
      return {
        puntos: 3,
        mensaje: "🏆 Marcador exacto (+3)",
      };
    }

    if (signoReal === signoPronosticado) {
      return {
        puntos: 1,
        mensaje:
          "🟢 Acertaste el resultado (+1)",
      };
    }

    return {
      puntos: 0,
      mensaje: "🔴 Sin puntos",
    };
  }

  const grupos = partidos.reduce(
    (acc: Record<string, any[]>, partido) => {
      const fase =
        partido.fase || "Sin fase";

      if (!acc[fase]) {
        acc[fase] = [];
      }

      acc[fase].push(partido);

      return acc;
    },
    {}
  );

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Quiniela Mundial 2026
      </h1>

      {Object.entries(grupos).map(
        ([fase, partidosFase]) => (
          <div
            key={fase}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold mb-4">
              {fase}
            </h2>

            <div className="space-y-4">
              {partidosFase.map(
                (partido: any) => {
                  const cerrado =
                    new Date() >=
                    new Date(partido.fecha);

                  const resultado =
                    calcularPuntos(partido);

                  return (
                    <div
                      key={partido.id}
                      className="border rounded p-4"
                    >
                      <h3 className="font-bold text-lg">
                        {partido.local} vs{" "}
                        {partido.visitante}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        {new Date(
                          partido.fecha
                        ).toLocaleString(
                          "es-BO"
                        )}
                      </p>

                      {cerrado && (
                        <p className="text-red-600 mb-3">
                          🔒 Pronóstico cerrado
                        </p>
                      )}

                      <div className="flex gap-3 items-center">
                        <input
                          type="number"
                          disabled={cerrado}
                          value={
                            pronosticos[
                              partido.id
                            ]?.goles_local ?? ""
                          }
                          onChange={(e) =>
                            actualizarPronostico(
                              partido.id,
                              "goles_local",
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="border p-2 w-20"
                        />

                        <span>-</span>

                        <input
                          type="number"
                          disabled={cerrado}
                          value={
                            pronosticos[
                              partido.id
                            ]
                              ?.goles_visitante ??
                            ""
                          }
                          onChange={(e) =>
                            actualizarPronostico(
                              partido.id,
                              "goles_visitante",
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="border p-2 w-20"
                        />

                        {!cerrado && (
                          <button
                            onClick={() =>
                              guardarPronostico(
                                partido.id
                              )
                            }
                            className="border px-4 py-2 rounded"
                          >
                            Guardar
                          </button>
                        )}
                      </div>

                      {partido.resultado_local !==
                        null &&
                        partido.resultado_visitante !==
                          null && (
                          <div className="mt-4 border-t pt-4">
                            <p>
                              <strong>
                                Resultado oficial:
                              </strong>{" "}
                              {
                                partido.resultado_local
                              }{" "}
                              -{" "}
                              {
                                partido.resultado_visitante
                              }
                            </p>

                            {pronosticos[
                              partido.id
                            ] && (
                              <>
                                <p>
                                  <strong>
                                    Tu pronóstico:
                                  </strong>{" "}
                                  {
                                    pronosticos[
                                      partido.id
                                    ].goles_local
                                  }{" "}
                                  -{" "}
                                  {
                                    pronosticos[
                                      partido.id
                                    ]
                                      .goles_visitante
                                  }
                                </p>

                                {resultado && (
                                  <div className="mt-3">
                                    <p className="font-bold text-lg">
                                      {
                                        resultado.mensaje
                                      }
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      Total:{" "}
                                      {
                                        resultado.puntos
                                      }{" "}
                                      punto
                                      {resultado.puntos !==
                                      1
                                        ? "s"
                                        : ""}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )
      )}

      {mensaje && (
        <p className="mt-6">
          {mensaje}
        </p>
      )}
    </main>
  );
}