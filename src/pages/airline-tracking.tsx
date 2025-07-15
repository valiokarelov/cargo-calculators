import React from 'react';

// Sample airline data
const airlines = [
  { id: 1, name: "001 AA American Airlines", url: "https://www.aa.com" },
  { id: 2, name: "Delta Air Lines", url: "https://www.delta.com" },
  { id: 3, name: "United Airlines", url: "https://www.united.com" },
  { id: 4, name: "Southwest Airlines", url: "https://www.southwest.com" },
  { id: 5, name: "JetBlue Airways", url: "https://www.jetblue.com" },
  { id: 6, name: "Alaska Airlines", url: "https://www.alaskaair.com" }
];

const AirlineTracking = () => {
  return (
    <main className="min-h-screen p-6 bg-blue-50 flex flex-col items-start">
      <button 
        onClick={() => window.history.back()} 
        className="text-blue-600 underline mb-4 bg-transparent border-none cursor-pointer"
      >
        &larr; Back to tools
      </button>
      
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">✈️ Airline Tracking</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airlines.map((airline, idx) => (
            <a
              key={idx}
              href={airline.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-blue-300 text-blue-700 py-4 px-6 rounded-lg shadow hover:bg-blue-100 hover:shadow-md transition-all duration-200"
            >
              {airline.name}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AirlineTracking;