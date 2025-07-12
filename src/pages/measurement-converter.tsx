import Link from 'next/link';
import { useState } from 'react';

export default function MeasurementConverter() {
  const [tab, setTab] = useState<'length' | 'weight' | 'volume'>('length');
  const [value, setValue] = useState('');
  const [unitFrom, setUnitFrom] = useState('cm');
  const [unitTo, setUnitTo] = useState('in');
  const [result, setResult] = useState<number | null>(null);
  const [mode, setMode] = useState<'metric' | 'imperial'>('metric');

  const unitOptions = {
    length: ['cm', 'm', 'in', 'ft', 'yd'],
    weight: ['kg', 'lb'],
    volume: ['L', 'm³', 'ft³', 'in³'],
  };

  const defaultUnits = {
    metric: {
      length: ['cm', 'm'],
      weight: ['kg', 'kg'],
      volume: ['L', 'm³'],
    },
    imperial: {
      length: ['in', 'ft'],
      weight: ['lb', 'lb'],
      volume: ['in³', 'ft³'],
    },
  };

  const conversionRates: Record<string, number> = {
    // Length (cm)
    cm: 1,
    m: 100,
    in: 2.54,
    ft: 30.48,
    yd: 91.44,
    // Weight (kg)
    kg: 1,
    lb: 0.453592,
    // Volume (L)
    L: 1,
    'm³': 1000,
    'ft³': 28.3168,
    'in³': 0.0163871,
  };

  const handleTabChange = (newTab: typeof tab) => {
    setTab(newTab);
    const [from, to] = defaultUnits[mode][newTab];
    setUnitFrom(from);
    setUnitTo(to);
    setResult(null);
    setValue('');
  };

  const handleModeToggle = () => {
    const newMode = mode === 'metric' ? 'imperial' : 'metric';
    setMode(newMode);
    const [from, to] = defaultUnits[newMode][tab];
    setUnitFrom(from);
    setUnitTo(to);
    setResult(null);
    setValue('');
  };

  const handleConvert = () => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    const base = conversionRates[unitFrom];
    const target = conversionRates[unitTo];
    const converted = (val * base) / target;

    setResult(Number(converted.toFixed(4)));
  };

  return (
    <main className="min-h-screen p-6 bg-blue-50">
      <div className="space-y-6">
        <Link href="/" className="text-blue-600 underline inline-block">
          &larr; Back to tools
        </Link>

        <h1 className="text-2xl font-bold">Measurement Converter</h1>

        {/* Mode toggle */}
        <div className="flex items-center gap-4">
          <span className="font-medium">Mode:</span>
          <button
            className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded"
            onClick={handleModeToggle}
          >
            {mode === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['length', 'weight', 'volume'] as const).map((t) => (
            <button
              key={t}
              className={`py-2 px-4 rounded ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-600'
              }`}
              onClick={() => handleTabChange(t)}
            >
              {t === 'length' && '📏 Length'}
              {t === 'weight' && '⚖️ Weight'}
              {t === 'volume' && '🧊 Volume'}
            </button>
          ))}
        </div>

        {/* Converter UI */}
        <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md">
          <div className="grid gap-4">
            <input
              type="number"
              className="p-2 border rounded w-full"
              placeholder={`Enter ${tab} value`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <div className="flex gap-2">
              <select
                className="border rounded p-2 w-full"
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
              >
                {unitOptions[tab].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <select
                className="border rounded p-2 w-full"
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
              >
                {unitOptions[tab].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={handleConvert}
            >
              Convert
            </button>

            {result !== null && (
              <div className="p-4 bg-white rounded shadow">
                <p>
                  <strong>Result:</strong> {result} {unitTo}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

