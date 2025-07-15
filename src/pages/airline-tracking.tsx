import React, { useState, useMemo } from 'react';

// Sample airline data - you can expand this to 200 airlines
const airlines = [
  { id: 1, name: "001 AA American Airlines", url: "https://www.aa.com" },
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
  { id: 14, name: "...", url: "https://www.singaporeair.com/en_UK/us/cargo/" },
  { id: 15, name: "...", url: "https://www.airfranceklm-martinair.com/" },
  { id: 16, name: "...", url: "https://www.china-airlines.com/cargo" },
  { id: 17, name: "...", url: "https://www.qantas.com/au/en/freight.html" },
  { id: 18, name: "...", url: "https://www.afklmp.com/" },
  { id: 19, name: "...", url: "https://www.alitalia.com/" },
  { id: 20, name: "...", url: "https://www.jal.com/en/cargo/" },
  { id: 21, name: "...", url: "https://www.saudia.com/cargo" },
  { id: 22, name: "...", url: "https://www.emirates.com/cargo/" },
  { id: 23, name: "...", url: "https://www.turkishcargo.com.tr/" },
  { id: 24, name: "...", url: "https://www.britishairways.com/cargo/" },
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

  const handleSearchChange = (e) => {
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
              className="w-full px-4 py-3 pl-10 pr-10 border-2 border-blue-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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