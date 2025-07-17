import React, { useState, useMemo } from 'react';

// Sample airline data - you can expand this to 200 airlines
const airlines = [
  { id: 1, name: "001 AA American Airlines", url: "https://www.aacargo.com/AACargo/tracking" },
  { id: 2, name: "003 2C CMA CGM Air Cargo", url: "https://pathfinder.digitalfactory.aero/#/" },
  { id: 3, name: "006 DL Delta Airlines", url: "https://www.deltacargo.com/Cargo/" },
  { id: 4, name: "014 AC Air Canada", url: "https://www.aircanada.com/cargo/tracking" },
  { id: 5, name: "016 UA United Airlines", url: "https://www.unitedcargo.com/en/us/track/index.html" },
  { id: 6, name: "020 LH Lufthansa Cargo", url: "https://www.lufthansa-cargo.com/en/eservices/etracking" },
  { id: 7, name: "023 FX FedEx", url: "https://www.fedex.com/fedextrack/" },
  { id: 8, name: "027 AS Alaska Airlines", url: "https://www.alaskacargo.com/" },
  { id: 9, name: "043 KA Dragonair", url: "https://www.cathaycargo.com/en-us/track-and-trace.html" },
  { id: 10, name: "044 AR Aerolineas Argentinas", url: "https://cargo.aerolineas.com.ar/en-us" },
  { id: 11, name: "045 LA LAN Airlines (LATAM)", url: "https://www.latamcargo.com/en/" },
  { id: 12, name: "047 TP TAP Portugal", url: "https://www.tapcargo.com/pt" },
  { id: 13, name: "050 OA Olympic Airways", url: "https://www.olympicair.com/en/customerhelp/" },
  { id: 14, name: "053 EI Aer Lingus", url: "https://www.iagcargo.com/en/home/" },
  { id: 15, name: "055 AZ ITA Airways Cargo (AlItalia)", url: "https://booking.ita-airways-cargo.com/#/trackAndTrace" },
  { id: 16, name: "057 AF Air France Cargo", url: "https://www.afklcargo.com/mycargo/shipment/singlesearch" },
  { id: 17, name: "061 HM Air Seychelles", url: "https://www.airseychelles.com/en/cargo" },
  { id: 18, name: "...", url: "..." },
  { id: 19, name: "...", url: "..." },
  { id: 20, name: "...", url: "..." },
  { id: 21, name: "...", url: "..." },
  { id: 22, name: "...", url: "..." },
  { id: 23, name: "...", url: "..." },
  { id: 24, name: "...", url: "..." },
  { id: 25, name: "...", url: "..." },
  { id: 26, name: "...", url: "..." },
  { id: 27, name: "...", url: "..." },
  { id: 28, name: "...", url: "..." },
  { id: 29, name: "...", url: "..." },
  { id: 30, name: "...", url: "..." },
  { id: 31, name: "...", url: "..." },
  { id: 32, name: "...", url: "..." },
  { id: 33, name: "...", url: "..." },
  { id: 34, name: "...", url: "..." },
  { id: 35, name: "...", url: "..." },
  { id: 36, name: "...", url: "..." },
  { id: 37, name: "...", url: "..." },
  { id: 38, name: "...", url: "..." },
  { id: 39, name: "...", url: "..." },
  { id: 40, name: "...", url: "..." },
  { id: 41, name: "...", url: "..." },
  { id: 42, name: "...", url: "..." },
  { id: 43, name: "...", url: "..." },
  { id: 44, name: "...", url: "..." },
  { id: 45, name: "...", url: "..." },
  { id: 46, name: "...", url: "..." },
  { id: 47, name: "...", url: "..." },
  { id: 48, name: "...", url: "..." },
  { id: 49, name: "...", url: "..." },
  { id: 50, name: "...", url: "..." },
  { id: 51, name: "...", url: "..." },
  { id: 52, name: "...", url: "..." },
  { id: 53, name: "...", url: "..." },
  { id: 54, name: "...", url: "..." },
  { id: 55, name: "...", url: "..." },
  { id: 56, name: "...", url: "..." },
  { id: 57, name: "...", url: "..." },
  { id: 58, name: "...", url: "..." },
  { id: 59, name: "...", url: "..." },
  { id: 60, name: "...", url: "..." },
  { id: 61, name: "...", url: "..." },
  { id: 62, name: "...", url: "..." },
  { id: 63, name: "...", url: "..." },
  { id: 64, name: "...", url: "..." },
  { id: 65, name: "...", url: "..." },
  { id: 66, name: "...", url: "..." },
  { id: 67, name: "...", url: "..." },
  { id: 68, name: "...", url: "..." },
  { id: 69, name: "...", url: "..." },
  { id: 70, name: "...", url: "..." },
  { id: 71, name: "...", url: "..." },
  { id: 72, name: "...", url: "..." },
  { id: 73, name: "...", url: "..." },
  { id: 74, name: "...", url: "..." },
  { id: 75, name: "...", url: "..." },
  { id: 76, name: "...", url: "..." },
  { id: 77, name: "...", url: "..." },
  { id: 78, name: "...", url: "..." },
  { id: 79, name: "...", url: "..." },
  { id: 80, name: "...", url: "..." },
  { id: 81, name: "...", url: "..." },
  { id: 82, name: "...", url: "..." },
  { id: 83, name: "...", url: "..." },
  { id: 84, name: "...", url: "..." },
  { id: 85, name: "...", url: "..." },
  { id: 86, name: "...", url: "..." },
  { id: 87, name: "...", url: "..." },
  { id: 88, name: "...", url: "..." },
  { id: 89, name: "...", url: "..." },
  { id: 90, name: "...", url: "..." },
  { id: 91, name: "...", url: "..." },
  { id: 92, name: "...", url: "..." },
  { id: 93, name: "...", url: "..." },
  { id: 94, name: "...", url: "..." },
  { id: 95, name: "...", url: "..." },
  { id: 96, name: "...", url: "..." },
  { id: 97, name: "...", url: "..." },
  { id: 98, name: "...", url: "..." },
  { id: 99, name: "...", url: "..." },
  { id: 100, name: "...", url: "..." },
  { id: 101, name: "...", url: "..." },
  { id: 102, name: "...", url: "..." },
  { id: 103, name: "...", url: "..." },
  { id: 104, name: "...", url: "..." },
  { id: 105, name: "...", url: "..." },
  { id: 106, name: "...", url: "..." },
  { id: 107, name: "...", url: "..." },
  { id: 108, name: "...", url: "..." },
  { id: 109, name: "...", url: "..." },
  { id: 110, name: "...", url: "..." },
  { id: 111, name: "...", url: "..." },
  { id: 112, name: "...", url: "..." },
  { id: 113, name: "...", url: "..." },
  { id: 114, name: "...", url: "..." },
  { id: 115, name: "...", url: "..." },
  { id: 116, name: "...", url: "..." },
  { id: 117, name: "...", url: "..." },
  { id: 118, name: "...", url: "..." },
  { id: 119, name: "...", url: "..." },
  { id: 120, name: "...", url: "..." },
  { id: 121, name: "...", url: "..." },
  { id: 122, name: "...", url: "..." },
  { id: 123, name: "...", url: "..." },
  { id: 124, name: "...", url: "..." },
  { id: 125, name: "...", url: "..." },
  { id: 126, name: "...", url: "..." },
  { id: 127, name: "...", url: "..." },
  { id: 128, name: "...", url: "..." },
  { id: 129, name: "...", url: "..." },
  { id: 130, name: "...", url: "..." },
  { id: 131, name: "...", url: "..." },
  { id: 132, name: "...", url: "..." },
  { id: 133, name: "...", url: "..." },
  { id: 134, name: "...", url: "..." },
  { id: 135, name: "...", url: "..." },
  { id: 136, name: "...", url: "..." },
  { id: 137, name: "...", url: "..." },
  { id: 138, name: "...", url: "..." },
  { id: 139, name: "...", url: "..." },
  { id: 140, name: "...", url: "..." },
  { id: 141, name: "...", url: "..." },
  { id: 142, name: "...", url: "..." },
  { id: 143, name: "...", url: "..." },
  { id: 144, name: "...", url: "..." },
  { id: 145, name: "...", url: "..." },
  { id: 146, name: "...", url: "..." },
  { id: 147, name: "...", url: "..." },
  { id: 148, name: "...", url: "..." },
  { id: 149, name: "...", url: "..." },
  { id: 150, name: "...", url: "..." },
  { id: 151, name: "...", url: "..." },
  { id: 152, name: "...", url: "..." },
  { id: 153, name: "...", url: "..." },
  { id: 154, name: "...", url: "..." },
  { id: 155, name: "...", url: "..." },
  { id: 156, name: "...", url: "..." },
  { id: 157, name: "...", url: "..." },
  { id: 158, name: "...", url: "..." },
  { id: 159, name: "...", url: "..." },
  { id: 160, name: "...", url: "..." },
  { id: 161, name: "...", url: "..." },
  { id: 162, name: "...", url: "..." },
  { id: 163, name: "...", url: "..." },
  { id: 164, name: "...", url: "..." },
  { id: 165, name: "...", url: "..." },
  { id: 166, name: "...", url: "..." },
  { id: 167, name: "...", url: "..." },
  { id: 168, name: "...", url: "..." },
  { id: 169, name: "...", url: "..." },
  { id: 170, name: "...", url: "..." },
  { id: 171, name: "...", url: "..." },
  { id: 172, name: "...", url: "..." },
  { id: 173, name: "...", url: "..." },
  { id: 174, name: "...", url: "..." },
  { id: 175, name: "...", url: "..." },
  { id: 176, name: "...", url: "..." },
  { id: 177, name: "...", url: "..." },
  { id: 178, name: "...", url: "..." },
  { id: 179, name: "...", url: "..." },
  { id: 180, name: "...", url: "..." },
  { id: 181, name: "...", url: "..." },
  { id: 182, name: "...", url: "..." },
  { id: 183, name: "...", url: "..." },
  { id: 184, name: "...", url: "..." },
  { id: 185, name: "...", url: "..." },
  { id: 186, name: "...", url: "..." },
  { id: 187, name: "...", url: "..." },
  { id: 188, name: "...", url: "..." },
  { id: 189, name: "...", url: "..." },
  { id: 190, name: "...", url: "..." },
  { id: 191, name: "...", url: "..." },
  { id: 192, name: "...", url: "..." },
  { id: 193, name: "...", url: "..." },
  { id: 194, name: "...", url: "..." },
  { id: 195, name: "...", url: "..." },
  { id: 196, name: "...", url: "..." },
  { id: 197, name: "...", url: "..." },
  { id: 198, name: "...", url: "..." },
  { id: 199, name: "...", url: "..." },
  { id: 200, name: "...", url: "..." },
  { id: 201, name: "...", url: "..." },
  { id: 202, name: "...", url: "..." },
  { id: 203, name: "...", url: "..." },
  { id: 204, name: "...", url: "..." },
  { id: 205, name: "...", url: "..." },
  { id: 206, name: "...", url: "..." },
  { id: 207, name: "...", url: "..." },
  { id: 208, name: "...", url: "..." },
  { id: 209, name: "...", url: "..." },
  // Add more airlines here to reach 200...
];

const AirlineTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAirlines = useMemo(() => {
    if (!searchTerm) return airlines;
    return airlines.filter(airline =>
      airline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <main className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="text-blue-600 hover:text-blue-800 underline mb-4 inline-block bg-none border-none cursor-pointer"
          >
            &larr; Back to tools
          </button>
          <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
            <span className="text-4xl">✈️</span>
            Airline Tracking
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search airlines by code or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 pr-10 border-2 border-blue-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-black"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{airlines.length}</div>
            <div className="text-sm text-blue-500">Total Airlines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredAirlines.length}</div>
            <div className="text-sm text-blue-500">Visible</div>
          </div>
        </div>

        {/* Airlines Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          {filteredAirlines.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>No airlines found matching your search.</p>
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div 
              className="grid gap-1 max-h-80 overflow-y-auto p-2"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
              }}
            >
              {filteredAirlines.map((airline) => (
                <a
                  key={airline.id}
                  href={airline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 flex items-center min-h-10"
                >
                  <div className="flex-1 truncate">
                    <div className="font-bold text-xs text-blue-800 mb-0.5">
                      {airline.name.split(' ')[0]} {airline.name.split(' ')[1]}
                    </div>
                    <div className="text-xs text-blue-600 truncate">
                      {airline.name.split(' ').slice(2).join(' ')}
                    </div>
                  </div>
                  <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-blue-600">
          <p>Click on any airline to visit their cargo tracking page</p>
        </div>
      </div>
    </main>
  );
};

export default AirlineTracking;