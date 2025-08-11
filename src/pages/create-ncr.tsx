import React, { useState, useMemo } from 'react';
import { Search, Filter, Package, Truck, Plane, Ship, Palette, Info, ChevronDown, ChevronUp } from 'lucide-react';

const CargoEquipmentNavigator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    'sea-containers': true,
    'road-transport': false,
    'air-cargo': false,
    'pallets': false,
    'aircraft': false,
    'vessels': false
  });

  const equipmentData = {
    'sea-containers': {
      name: 'Sea Containers',
      icon: <Package className="w-5 h-5" />,
      items: [
        {
          id: '20ft-dv',
          name: '20ft Dry Van (DV)',
          type: 'Container',
          dimensions: { length: 5850, width: 2350, height: 2395 },
          volume: 33,
          payload: 20000,
          tare: 2300,
          door: { width: 2340, height: 2290 },
          description: 'Most common sea container for safe and dry transportation'
        },
        {
          id: '20ft-rf',
          name: '20ft Refrigerated (RF)',
          type: 'Container',
          dimensions: { length: 5450, width: 2280, height: 2159 },
          volume: 27,
          payload: 22000,
          tare: 3080,
          door: { width: 2290, height: 2260 },
          description: 'Temperature-controlled transport container'
        },
        {
          id: '40ft-dv',
          name: '40ft Dry Van (DV)',
          type: 'Container',
          dimensions: { length: 12032, width: 2350, height: 2395 },
          volume: 68,
          payload: 22000,
          tare: 3750,
          door: { width: 2340, height: 2290 },
          description: 'Most common large sea container for safe and dry transportation'
        },
        {
          id: '40ft-hc',
          name: '40ft High Cube (HC)',
          type: 'Container',
          dimensions: { length: 12032, width: 2350, height: 2700 },
          volume: 76,
          payload: 25000,
          tare: 3940,
          door: { width: 2340, height: 2590 },
          description: 'Taller version of 40ft DV for increased volume'
        },
        {
          id: '40ft-rf',
          name: '40ft Refrigerated (RF)',
          type: 'Container',
          payload: 27700,
          tare: 4800,
          description: 'Temperature-controlled 40ft container'
        },
        {
          id: '40ft-rf-hc',
          name: '40ft Refrigerated High Cube (RF HC)',
          type: 'Container',
          payload: 29400,
          tare: 4480,
          description: 'High cube refrigerated container'
        },
        {
          id: '40ft-ot-hc',
          name: '40ft Open Top High Cube (OT HC)',
          type: 'Container',
          payload: 22000,
          tare: 3980,
          description: 'Container with removable roof for oversized cargo'
        }
      ]
    },
    'road-transport': {
      name: 'Road Transport',
      icon: <Truck className="w-5 h-5" />,
      items: [
        {
          id: 'truck',
          name: 'Standard Truck',
          type: 'Truck',
          dimensions: { length: 7200, width: 2440, height: 3100 },
          volume: 54,
          payload: 20000,
          axles: { front: -1000, rear: 5200 },
          description: 'Standard truck for road transport'
        },
        {
          id: '53ft-semi-us',
          name: '53ft Semi (US)',
          type: 'Trailer',
          dimensions: { length: 16000, width: 2560, height: 2790 },
          volume: 114,
          payload: 18141,
          door: { width: 2560, height: 2790 },
          description: 'Standard US semi-trailer'
        },
        {
          id: '53ft-hc-rail-us',
          name: '53ft High Cube Rail Container (US)',
          type: 'Rail Container',
          dimensions: { length: 16015, width: 2502, height: 2781 },
          volume: 111,
          payload: 19731,
          description: 'High cube rail container for US market'
        },
        {
          id: '53ft-flatbed-us',
          name: '53ft Flatbed Trailer (US)',
          type: 'Flatbed',
          payload: 20408,
          description: 'Standard US flatbed trailer'
        },
        {
          id: '40ft-mafi',
          name: '40ft MAFI Trailer',
          type: 'MAFI',
          payload: 120000,
          description: 'Heavy-duty MAFI trailer for terminal operations'
        },
        {
          id: '60ft-mafi',
          name: '60ft MAFI Trailer (2.79m wide)',
          type: 'MAFI',
          payload: 120000,
          description: 'Extended MAFI trailer for large cargo'
        }
      ]
    },
    'air-cargo': {
      name: 'Air Cargo (ULDs)',
      icon: <Plane className="w-5 h-5" />,
      items: [
        {
          id: 'pmc-p6p-ld',
          name: 'PMC/P6P - LD',
          type: 'ULD',
          payload: 5000,
          tare: 120,
          description: 'Standard air cargo pallet'
        },
        {
          id: 'pag-p1p-ld7',
          name: 'PAG/P1P - LD-7',
          type: 'ULD',
          dimensions: { length: 2240, width: 3170, height: 1630 },
          volume: 12,
          payload: 5000,
          tare: 100,
          description: 'General purpose PAG pallet for lower deck, loading up to 64"/163cm'
        },
        {
          id: 'pla-half',
          name: 'PLA Half Pallet',
          type: 'ULD',
          dimensions: { length: 3170, width: 1530, height: 2440 },
          volume: 12,
          payload: 1588,
          tare: 80,
          description: 'PLA half pallet with net'
        },
        {
          id: 'pla-half-ld',
          name: 'PLA Half Pallet (LD)',
          type: 'ULD',
          dimensions: { length: 3170, width: 1530, height: 1630 },
          volume: 8,
          payload: 1588,
          tare: 80,
          description: 'Lower deck version with net'
        },
        {
          id: 'pra-16ft',
          name: 'PRA/MDP - 16ft Pallet (B767-300F)',
          type: 'ULD',
          dimensions: { length: 4970, width: 2440, height: 2440 },
          volume: 25,
          payload: 6804,
          tare: 410,
          description: '16ft pallet with net for B767-300F positions P1-P5'
        }
      ]
    },
    'pallets': {
      name: 'Pallets',
      icon: <Palette className="w-5 h-5" />,
      items: [
        {
          id: 'euro-pallet',
          name: 'Euro Pallet',
          type: 'Pallet',
          dimensions: { length: 1200, width: 800, height: 2100, floor: 144 },
          volume: 2,
          payload: 660,
          tare: 25,
          description: 'Standard European pallet'
        },
        {
          id: 'gma-pallet',
          name: 'GMA Standard Pallet',
          type: 'Pallet',
          dimensions: { length: 1219, width: 1016, height: 2100, floor: 165 },
          volume: 3,
          payload: 2086,
          tare: 20,
          description: 'Standard North American pallet'
        }
      ]
    },
    'aircraft': {
      name: 'Aircraft',
      icon: <Plane className="w-5 h-5" />,
      items: [
        { id: 'b727-200f', name: '727-200F (Main Deck)', type: 'Aircraft', description: 'Boeing 727-200 Freighter main deck' },
        { id: 'b737-300f', name: '737-300F (Main Deck)', type: 'Aircraft', description: 'Boeing 737-300 Freighter main deck' },
        { id: 'b737-400f', name: '737-400F (Main Deck)', type: 'Aircraft', description: 'Boeing 737-400 Freighter main deck' },
        { id: 'b747-400bcf', name: '747-400BCF', type: 'Aircraft', description: 'Boeing 747-400 Boeing Converted Freighter' },
        { id: 'b747-400f', name: '747-400F', type: 'Aircraft', description: 'Boeing 747-400 Freighter' },
        { id: 'b757-200f', name: '757-200F (Main Deck)', type: 'Aircraft', description: 'Boeing 757-200 Freighter main deck' },
        { id: 'b767-200f', name: '767-200F', type: 'Aircraft', description: 'Boeing 767-200 Freighter' },
        { id: 'b767-300f', name: '767-300F', type: 'Aircraft', description: 'Boeing 767-300 Freighter' },
        { id: 'a300-600f', name: 'A300-600F', type: 'Aircraft', description: 'Airbus A300-600 Freighter' },
        { id: 'a300-b4-200f', name: 'A300 B4-200F', type: 'Aircraft', description: 'Airbus A300 B4-200 Freighter' },
        { id: 'a321f', name: 'A321F', type: 'Aircraft', description: 'Airbus A321 Freighter' },
        { id: 'a330-200-p2f', name: 'A330-200 P2F', type: 'Aircraft', description: 'Airbus A330-200 Passenger to Freighter' },
        { id: 'a330-300-ld', name: 'A330-300 Lower Deck', type: 'Aircraft', description: 'Airbus A330-300 Lower Deck cargo' },
        { id: 'b737-800f', name: 'B737-800F', type: 'Aircraft', description: 'Boeing 737-800 Freighter' },
        { id: 'b747-8f', name: 'B747-8F', type: 'Aircraft', description: 'Boeing 747-8 Freighter' },
        { id: 'b777-200f', name: 'B777-200F', type: 'Aircraft', description: 'Boeing 777-200 Freighter' }
      ]
    },
    'vessels': {
      name: 'Sea Vessels',
      icon: <Ship className="w-5 h-5" />,
      items: [
        { id: 'bbc-12k-300a', name: 'BBC-12K-300A', type: 'Vessel', description: 'Breakbulk cargo vessel' },
        { id: 'bbc-31k-500a', name: 'BBC-31K-500A', type: 'Vessel', description: 'Breakbulk cargo vessel' },
        { id: 'bbc-7k-500a', name: 'BBC-7K-500A', type: 'Vessel', description: 'Breakbulk cargo vessel' },
        { id: 'bbc-9k-700a', name: 'BBC-9K-700A', type: 'Vessel', description: 'Breakbulk cargo vessel' }
      ]
    }
  };

  const categories = Object.keys(equipmentData);

  const filteredEquipment = useMemo(() => {
    let items = [];
    
    if (selectedCategory === 'all') {
      categories.forEach(cat => {
        items = [...items, ...equipmentData[cat].items];
      });
    } else {
      items = equipmentData[selectedCategory]?.items || [];
    }

    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  }, [searchTerm, selectedCategory, categories, equipmentData]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const formatDimensions = (dims) => {
    if (!dims) return 'N/A';
    return `${dims.length}×${dims.width}×${dims.height}mm`;
  };

  const formatWeight = (weight) => {
    if (!weight) return 'N/A';
    return `${weight.toLocaleString()}kg`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cargo Equipment Library Navigator
              </h1>
              <p className="text-gray-600">
                Browse 70+ equipment types for sea, air, and road transport
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Powered by</div>
              <div className="text-lg font-bold text-blue-600">cargosier.com</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {equipmentData[cat].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat} className="border rounded-lg">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        {equipmentData[cat].icon}
                        <span className="font-medium">{equipmentData[cat].name}</span>
                      </div>
                      {expandedCategories[cat] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedCategories[cat] && (
                      <div className="px-3 pb-3">
                        <div className="text-sm text-gray-600 mb-2">
                          {equipmentData[cat].items.length} items
                        </div>
                        <div className="space-y-1">
                          {equipmentData[cat].items.slice(0, 5).map(item => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedEquipment(item)}
                              className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                            >
                              {item.name}
                            </button>
                          ))}
                          {equipmentData[cat].items.length > 5 && (
                            <div className="text-xs text-gray-500 p-1">
                              +{equipmentData[cat].items.length - 5} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment List */}
          <div className="lg:col-span-2">
            {selectedEquipment ? (
              /* Equipment Detail View */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEquipment.name}</h2>
                    <p className="text-gray-600">{selectedEquipment.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    ← Back to List
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                    <div className="space-y-3">
                      {selectedEquipment.dimensions && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Dimensions (L×W×H)</div>
                          <div className="text-lg font-mono">{formatDimensions(selectedEquipment.dimensions)}</div>
                        </div>
                      )}
                      {selectedEquipment.volume && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Loading Volume</div>
                          <div className="text-lg font-mono">{selectedEquipment.volume} m³</div>
                        </div>
                      )}
                      {selectedEquipment.payload && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Maximum Payload</div>
                          <div className="text-lg font-mono">{formatWeight(selectedEquipment.payload)}</div>
                        </div>
                      )}
                      {selectedEquipment.tare && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Tare Weight</div>
                          <div className="text-lg font-mono">{formatWeight(selectedEquipment.tare)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
                    <div className="space-y-3">
                      {selectedEquipment.door && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Door Dimensions (W×H)</div>
                          <div className="text-lg font-mono">
                            {selectedEquipment.door.width}×{selectedEquipment.door.height}mm
                          </div>
                        </div>
                      )}
                      {selectedEquipment.axles && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Axle Positions</div>
                          <div className="text-sm">
                            Front: {selectedEquipment.axles.front}mm<br/>
                            Rear: {selectedEquipment.axles.rear}mm
                          </div>
                        </div>
                      )}
                      {selectedEquipment.dimensions?.floor && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Floor Height</div>
                          <div className="text-lg font-mono">{selectedEquipment.dimensions.floor}mm</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Description</div>
                      <div className="text-blue-700">{selectedEquipment.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Equipment Grid View */
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      Equipment List ({filteredEquipment.length} items)
                    </h2>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {filteredEquipment.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEquipment(item)}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {item.dimensions && (
                              <span className="text-gray-700">
                                📏 {formatDimensions(item.dimensions)}
                              </span>
                            )}
                            {item.volume && (
                              <span className="text-gray-700">
                                📦 {item.volume} m³
                              </span>
                            )}
                            {item.payload && (
                              <span className="text-gray-700">
                                ⚖️ {formatWeight(item.payload)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEquipment.length === 0 && (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
          <p className="text-gray-600 mb-2">
            Data source: <a href="https://cargo-planner.com/equipment-library/" className="text-blue-600 hover:underline">Cargo-Planner Equipment Library</a>
          </p>
          <p className="text-sm text-gray-500">
            All specifications are customizable within the Cargo-Planner platform. Contact cargosier.com for integration assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CargoEquipmentNavigator;