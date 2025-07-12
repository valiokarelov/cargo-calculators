import Link from 'next/link';

export default function Home() {
  return (
    <main
      className="min-h-screen bg-blue-50 p-8 flex flex-col items-start justify-start"
      style={{
        backgroundImage: 'url("/globe-outline.svg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '80%',
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Cargo Calculators</h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/chargeable-weight"
          className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition"
        >
          📦 Chargeable Weight Calculator
        </Link>

        {/* Future calculator buttons */}
        {/* 
        <Link href="/cbm-converter" className="...">📏 CBM Converter</Link> 
        <Link href="/unit-converter" className="...">🔁 Unit Converter</Link> 
        */}
      </div>
    </main>
  );
}
