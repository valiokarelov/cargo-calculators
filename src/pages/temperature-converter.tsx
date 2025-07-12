import Link from 'next/link';
import { useState } from 'react';

export default function TemperatureConverter() {
  const [value, setValue] = useState('');
  const [unitFrom, setUnitFrom] = useState('°C');
  const [unitTo, setUnitTo] = useState('°F');
  const [result, setResult] = useState<number | null>(null);

  const units = ['°C', '°F', 'K'];

  const convertTemperature = () => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    let celsius: number;

    // Convert from original to Celsius
    if (unitFrom === '°C') celsius = val;
    else if (unitFrom === '°F') celsius = (val - 32) * 5 / 9;
    else if (unitFrom === 'K') celsius = val - 273.15;
    else return;

    // Convert from Celsius to target unit
    let converted: number;
    if (unitTo === '°C') converted = celsius;
    else if (unitTo === '°F') converted = celsius * 9 / 5 + 32;
    else if (unitTo === 'K') converted = celsius + 273.15;
    else return;

    setResult(Number(converted.toFixed(2)));
  };

  return (
    <main className="min-h-screen p-6 bg-blue-50">
      <div className="space-y-6">
        <Link href="/" className="text-blue-600 underline inline-block">
          &larr; Back to tools
        </Link>

        <h1 className="text-2xl font-bold">🌡️ Temperature Converter</h1>

        <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md">
          <div className="grid gap-4">
            <input
              type="number"
              className="p-2 border rounded w-full"
              placeholder="Enter temperature"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <div className="flex gap-2">
              <select
                className="border rounded p-2 w-full"
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>

              <select
                className="border rounded p-2 w-full"
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <button
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={convertTemperature}
            >
              Convert
            </button>

            {result !== null && (
              <div className="p-4 bg-white rounded shadow">
                <p><strong>Result:</strong> {result} {unitTo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
