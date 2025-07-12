// pages/chargeable-weight.tsx
import { useState } from 'react';
import Link from 'next/link';

export default function ChargeableWeight() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [chargeableWeight, setChargeableWeight] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    const gw = parseFloat(grossWeight);

    const dimWeight = (l * w * h) / 6000;
    const result = Math.max(dimWeight, gw);
    setChargeableWeight(Number(result.toFixed(2)));
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <Link href="/" className="text-blue-600 underline mb-4 inline-block">&larr; Back to tools</Link>

      <h1 className="text-2xl font-bold mb-4">Chargeable Weight Calculator</h1>

      <div className="grid gap-4 max-w-md">
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Length (cm)"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Width (cm)"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <input
          className="p-2 border rounded"
          type="number"
          placeholder="Gross Weight (kg)"
          value={grossWeight}
          onChange={(e) => setGrossWeight(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={calculate}
        >
          Calculate
        </button>

        {chargeableWeight !== null && (
          <div className="p-4 bg-white rounded shadow">
            <strong>Chargeable Weight:</strong> {chargeableWeight} kg
          </div>
        )}
      </div>
    </main>
  );
}
