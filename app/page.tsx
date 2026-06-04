export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold">
          La Quiniela Rendón ⚽
        </h1>

        <p className="mt-2 text-gray-600">
          Pronósticos Mundial 2026
        </p>

        <div className="grid gap-4 mt-8 md:grid-cols-2">
          <div className="border rounded-xl p-4">
            <h2 className="font-bold text-xl">
              Próximos partidos
            </h2>

            <div className="mt-4">
              🇦🇷 Argentina vs 🇵🇹 Portugal
              <br />
              Pronóstico: pendiente
            </div>

            <div className="mt-4">
              🇧🇷 Brasil vs 🇪🇸 España
              <br />
              Pronóstico: pendiente
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <h2 className="font-bold text-xl">
              Clasificación
            </h2>

            <ol className="mt-4 space-y-2">
              <li>🥇 Jorge - 15 pts</li>
              <li>🥈 Carlos - 12 pts</li>
              <li>🥉 Ana - 10 pts</li>
              <li>4️⃣ Luis - 8 pts</li>
              <li>5️⃣ María - 5 pts</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}