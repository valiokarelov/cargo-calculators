const airlines = [
  { name: 'Lufthansa', url: 'https://lufthansa-cargo.com/track' },
  { name: 'Qatar Airways', url: 'https://www.qrcargo.com/track' },
  { name: 'Singapore Airlines', url: 'https://www.siacargo.com/trackandtrace/' },
  { name: 'Emirates SkyCargo', url: 'https://skychain.emirates.com/Skychain/Login' },
  { name: 'Turkish Cargo', url: 'https://www.turkishcargo.com.tr/en/online-services/track-your-cargo' },
  { name: 'Korean Air', url: 'https://cargo.koreanair.com/cc/iw/cargoTracking.do' },
  { name: 'Cathay Pacific', url: 'https://www.cathaypacificcargo.com/en-us/e-services/tracking.aspx' },
  { name: 'Etihad Cargo', url: 'https://www.etihadcargo.com/en/track-shipment' },
  { name: 'Air France KLM', url: 'https://www.afklcargo.com/mycargo/shipment-tracking' },
  { name: 'Cargolux', url: 'https://www.cargolux.com/e-services/track-your-shipment' },
];

export default function AirlineTrackingPanel() {
  return (
    <div className="mt-10 sm:fixed sm:top-24 sm:right-4 w-full sm:w-64 space-y-2 z-50">
      <h2 className="text-lg font-semibold mb-2 text-blue-800">✈️ Track Your Cargo</h2>
      {airlines.map((airline, idx) => (
        <a
          key={idx}
          href={airline.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border border-blue-300 text-blue-700 py-2 px-4 rounded-lg shadow hover:bg-blue-100 text-sm text-center"
        >
          {airline.name}
        </a>
      ))}
    </div>
  );
}
