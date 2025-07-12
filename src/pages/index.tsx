// src/pages/index.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Cargosizer Tools</h1>
      <p className="mb-4 text-gray-700">Select a calculator:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/chargeable-weight" className="p-4 bg-white border rounded-xl shadow hover:shadow-md transition">
          📦 Chargeable Weight Calculator
        </Link>
      </div>
    </main>
  );
}
