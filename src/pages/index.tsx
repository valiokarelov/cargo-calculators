import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Cargo Calculators | Cargosizer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Convert cargo dimensions, weight, volume, and more" />
      </Head>

      <main className="relative min-h-screen bg-blue-50 px-4 py-8 sm:px-8">
        <div className="space-y-4 w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">Cargo Tools</h1>

          <Link 
            href="/airline-tracking" 
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            ✈️ Airline Tracking
          </Link>
          
          <Link 
            href="/chargeable-weight" 
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            📦 Chargeable Weight Calculator
          </Link>

          <Link 
            href="/measurement-converter" 
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            📐 Measurement Converter
          </Link>

          <Link 
            href="/temperature-converter" 
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            🌡️ Temperature Converter
          </Link>

          <Link 
            href="https://hts.usitc.gov/search"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            🔍 Search HTS (USITC)
          </Link>

          <Link 
            href="https://www.usda.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-600 text-white py-3 px-5 rounded-lg shadow hover:bg-green-700 transition text-center"
          >
            🐄 USDA Website
          </Link>

          <Link 
            href="https://www.fda.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-red-600 text-white py-3 px-5 rounded-lg shadow hover:bg-red-700 transition text-center"
          >
            💊 FDA Website
          </Link>

          <Link 
            href="/cargo-fitter"
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            🚚 Cargo Fitter
          </Link>

          <Link 
            href="/create-ncr" 
            className="block bg-blue-600 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-700 transition text-center"
          >
            ✏️ Create NCR
          </Link>
        </div>
      </main>
    </>
  );
}