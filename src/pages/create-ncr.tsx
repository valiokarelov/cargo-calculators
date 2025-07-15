import Link from 'next/link';

export default function CargoFitter() {
  return (
    <main className="min-h-screen p-6 bg-blue-50 flex flex-col items-start">
      <Link href="/" className="text-blue-600 underline mb-4">
        &larr; Back to tools
      </Link>

      <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-800 mb-2"> ✏️ NCR generator</h1>
        <p className="text-lg text-gray-700">This tool is currently under construction. Please check back soon!</p>
      </div>
    </main>
  );
}