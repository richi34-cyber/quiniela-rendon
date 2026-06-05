"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMINS = ["richi34@gmail.com"];

export default function AdminPage() {
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [partidos, setPartidos] = useState<any[]>([]);
  const [pronosticosPorPartido, setPronosticosPorPartido] =
    useState<Record<number, any[]>>({});

  const [partidoAbierto, setPartidoAbierto] =
    useState<number | null>(null);

  const [nuevoPartido, setNuevoPartido] =
    useState({
      local: "",
      visitante: "",
      fecha: "",
      fase: "",
    });

  useEffect(() => {
    verificarAcceso();
  }, []);

  async function verificarAcceso() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setCargando(false);
      return;
    }

    if (!ADMINS.includes(user.email)) {
      setCargando(false);
      return;
    }

    setAutorizado(true);

    await Promise.all([
      cargarPartidos(),
      cargarPronosticos(),
    ]);

    setCargando(false);
  }

  async function cargarPartidos() {
    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .order("fecha");

    if (error) {
      setMensaje(error.message);
      return;
    }

    setPartidos(data || []);
  }

  async function cargarPronosticos() {
    const [pronosticosResp, profilesResp] =
      await Promise.all([
        supabase
          .from("pronosticos")
          .select("*"),
        supabase
          .from("profiles")
          .select("*"),
      ]);

    const pronosticos =
      pronosticosResp.data || [];

    const profiles =
      profilesResp.data || [];

    const agrupados: Record<
      number,
      any[]
    > = {};

    pronosticos.forEach((p) => {
      const profile = profiles.find(
        (x) => x.id === p.usuario_id
      );

      if (!agrupados[p.partido_id]) {
        agrupados[p.partido_id] = [];
      }

      agrupados[p.partido_id].push({
        ...p,
        nickname:
          profile?.nickname ||
          "Usuario",
      });
    });

    setPronosticosPorPartido(
      agrupados
    );
  }

  async function crearPartido() {
    setMensaje("");

    if (
      !nuevoPartido.local ||
      !nuevoPartido.visitante ||
      !nuevoPartido.fecha
    ) {
      setMensaje(
        "Completa todos los campos"
      );
      return;
    }

    const { error } = await supabase
      .from("partidos")
      .insert({
        local: nuevoPartido.local,
        visitante:
          nuevoPartido.visitante,
        fecha: nuevoPartido.fecha,
        fase:
          nuevoPartido.fase ||
          "Fase de grupos",
      });

    if (error) {
      setMensaje(error.message);
      return;
    }

    setNuevoPartido({
      local: "",
      visitante: "",
      fecha: "",
      fase: "",
    });

    setMensaje(
      "Partido creado correctamente"
    );

    await cargarPartidos();
  }

  async function guardarPartido(
    partido: any
  ) {
    const { error } = await supabase
      .from("partidos")
      .update({
        local: partido.local,
        visitante:
          partido.visitante,
        fecha: partido.fecha,
        fase: partido.fase,
        resultado_local:
          partido.resultado_local ===
          ""
            ? null
            : partido.resultado_local,
        resultado_visitante:
          partido.resultado_visitante ===
          ""
            ? null
            : partido.resultado_visitante,
      })
      .eq("id", partido.id);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje(
      "Partido actualizado"
    );

    await cargarPartidos();
  }

  async function eliminarPartido(
    id: number
  ) {
    if (
      !confirm(
        "¿Seguro que deseas eliminar este partido?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("partidos")
      .delete()
      .eq("id", id);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje(
      "Partido eliminado"
    );

    await cargarPartidos();
  }

  function actualizarCampo(
    id: number,
    campo: string,
    valor: any
  ) {
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [campo]: valor,
            }
          : p
      )
    );
  }

  if (cargando) {
    return (
      <main className="p-8">
        Cargando...
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="p-8">
        Acceso denegado
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Administración
      </h1>

      <div className="border rounded p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Crear Partido
        </h2>

        <div className="grid md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Local"
            className="border p-2 rounded"
            value={nuevoPartido.local}
            onChange={(e) =>
              setNuevoPartido({
                ...nuevoPartido,
                local:
                  e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Visitante"
            className="border p-2 rounded"
            value={
              nuevoPartido.visitante
            }
            onChange={(e) =>
              setNuevoPartido({
                ...nuevoPartido,
                visitante:
                  e.target.value,
              })
            }
          />

          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={nuevoPartido.fecha}
            onChange={(e) =>
              setNuevoPartido({
                ...nuevoPartido,
                fecha:
                  e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Fase"
            className="border p-2 rounded"
            value={nuevoPartido.fase}
            onChange={(e) =>
              setNuevoPartido({
                ...nuevoPartido,
                fase:
                  e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={crearPartido}
          className="border px-4 py-2 rounded mt-4"
        >
          Crear Partido
        </button>
      </div>

      <div className="space-y-6">
        {partidos.map(
          (partido) => (
            <div
              key={partido.id}
              className="border rounded p-4"
            >
              <div className="mb-3 font-bold">
                Pronósticos recibidos:{" "}
                {
                  (
                    pronosticosPorPartido[
                      partido.id
                    ] || []
                  ).length
                }
              </div>

              <div className="grid md:grid-cols-6 gap-3">
                <input
                  className="border p-2 rounded"
                  value={
                    partido.local ?? ""
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "local",
                      e.target.value
                    )
                  }
                />

                <input
                  className="border p-2 rounded"
                  value={
                    partido.visitante ??
                    ""
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "visitante",
                      e.target.value
                    )
                  }
                />

                <input
                  type="datetime-local"
                  className="border p-2 rounded"
                  value={
  partido.fecha
    ? String(partido.fecha).slice(0, 16)
    : ""
}
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "fecha",
                      e.target.value
                    )
                  }
                />

                <input
                  className="border p-2 rounded"
                  value={
                    partido.fase ?? ""
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "fase",
                      e.target.value
                    )
                  }
                />

                <input
                  type="number"
                  placeholder="Local"
                  className="border p-2 rounded"
                  value={
                    partido.resultado_local ??
                    ""
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "resultado_local",
                      e.target
                        .value === ""
                        ? ""
                        : Number(
                            e.target
                              .value
                          )
                    )
                  }
                />

                <input
                  type="number"
                  placeholder="Visitante"
                  className="border p-2 rounded"
                  value={
                    partido.resultado_visitante ??
                    ""
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      partido.id,
                      "resultado_visitante",
                      e.target
                        .value === ""
                        ? ""
                        : Number(
                            e.target
                              .value
                          )
                    )
                  }
                />
              </div>

              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={() =>
                    guardarPartido(
                      partido
                    )
                  }
                  className="border px-4 py-2 rounded"
                >
                  Guardar
                </button>

                <button
                  onClick={() =>
                    eliminarPartido(
                      partido.id
                    )
                  }
                  className="border px-4 py-2 rounded"
                >
                  Eliminar
                </button>

                <button
                  onClick={() =>
                    setPartidoAbierto(
                      partidoAbierto ===
                        partido.id
                        ? null
                        : partido.id
                    )
                  }
                  className="border px-4 py-2 rounded"
                >
                  Ver pronósticos
                </button>
              </div>

              {partidoAbierto ===
                partido.id && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-bold mb-3">
                    Pronósticos
                  </h3>

                  {(
                    pronosticosPorPartido[
                      partido.id
                    ] || []
                  ).length === 0 ? (
                    <p>
                      No hay
                      pronósticos.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pronosticosPorPartido[
                        partido.id
                      ].map(
                        (
                          pronostico,
                          index
                        ) => (
                          <div
                            key={index}
                            className="border rounded p-2 flex justify-between"
                          >
                            <span>
                              {
                                pronostico.nickname
                              }
                            </span>

                            <strong>
                              {
                                pronostico.goles_local
                              }
                              {" - "}
                              {
                                pronostico.goles_visitante
                              }
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {mensaje && (
        <p className="mt-6">
          {mensaje}
        </p>
      )}
    </main>
  );
}