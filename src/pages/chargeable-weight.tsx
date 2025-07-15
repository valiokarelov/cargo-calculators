import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function ChargeableWeight() {
  const { t } = useTranslation('common');

  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [dimensionUnit, setDimensionUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [pieces, setPieces] = useState('1');
  const [pieceType, setPieceType] = useState<'box' | 'plt'>('box');

  const [cbm, setCbm] = useState<number | null>(null);
  const [chargeableWeight, setChargeableWeight] = useState<number | null>(null);

  const convertToCm = (value: number, unit: 'cm' | 'in') =>
    unit === 'in' ? value * 2.54 : value;

  const convertToKg = (value: number, unit: 'kg' | 'lb') =>
    unit === 'lb' ? value * 0.453592 : value;

  const calculate = () => {
    const l = convertToCm(parseFloat(length), dimensionUnit);
    const w = convertToCm(parseFloat(width), dimensionUnit);
    const h = convertToCm(parseFloat(height), dimensionUnit);
    const gw = convertToKg(parseFloat(grossWeight), weightUnit);
    const pcs = parseInt(pieces) || 1;

    const volumeCbm = (l / 100) * (w / 100) * (h / 100) * pcs;
    const dimWeight = ((l * w * h) / 6000) * pcs;
    const totalGross = gw * pcs;
    const result = Math.max(dimWeight, totalGross);

    setCbm(Number(volumeCbm.toFixed(3)));
    setChargeableWeight(Number(result.toFixed(2)));
  };

  return (
    <main
      className="min-h-screen p-6 bg-blue-50"
      style={{
        backgroundImage: 'url("/globe-outline.svg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '80%',
      }}
    >
      <div className="space-y-4">
        <Link href="/" className="text-blue-600 underline inline-block">
          &larr; {t('backToTools')}
        </Link>

        <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">{t('Chargeable Weight')}</h1>

          <div className="grid gap-4 max-w-md">
            <div className="flex gap-2">
              <input
                className="p-2 border rounded w-full"
                type="number"
                placeholder={t('length')}
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={dimensionUnit}
                onChange={(e) =>
                  setDimensionUnit(e.target.value as 'cm' | 'in')
                }
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="p-2 border rounded w-full"
                type="number"
                placeholder={t('width')}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={dimensionUnit}
                onChange={(e) =>
                  setDimensionUnit(e.target.value as 'cm' | 'in')
                }
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="p-2 border rounded w-full"
                type="number"
                placeholder={t('height')}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={dimensionUnit}
                onChange={(e) =>
                  setDimensionUnit(e.target.value as 'cm' | 'in')
                }
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                className="p-2 border rounded w-full"
                type="number"
                placeholder={t('grossWeight')}
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <input
                className="p-2 border rounded w-full"
                type="number"
                placeholder={t('pieces')}
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                min={1}
              />
              <select
                className="border rounded p-2"
                value={pieceType}
                onChange={(e) =>
                  setPieceType(e.target.value as 'box' | 'plt')
                }
              >
                <option value="box">📦 {t('box')}</option>
                <option value="plt">🧱 {t('pallet')}</option>
              </select>
            </div>

            <button
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={calculate}
            >
              {t('calculate')}
            </button>

            {cbm !== null && chargeableWeight !== null && (
              <div className="p-4 bg-white rounded shadow space-y-2">
                <p><strong>{t('volume')}:</strong> {cbm} CBM</p>
                <p><strong>{t('chargeableWeight')}:</strong> {chargeableWeight} kg</p>
                <p className="text-sm text-gray-500">
                  {t('basedOn', {
                    pieces,
                    pieceType: `${t(pieceType)}${pieces === '1' ? '' : 's'}`,
                    length,
                    width,
                    height,
                    dimensionUnit,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    }
  };
}
