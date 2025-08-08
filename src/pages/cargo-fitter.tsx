import { useEffect, useRef, useState, useCallback } from 'react';

interface Item {
  id: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  name: string;
  fitted?: boolean;
  x?: number;
  y?: number;
  z?: number;
}

interface Stats {
  totalItems: number;
  totalPallets: number;
  fittedItems: number;
  fittedPallets: number;
  unfittedItems: number;
  unfittedPallets: number;
  efficiency: number;
  totalWeight: number;
  fittedWeight: number;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CargoFitterRef {
  items: Item[];
  addItem: (length: number, width: number, height: number, weight: number, name: string, quantity: number) => number[];
  removeItem: (id: number) => boolean;
  clearItems: () => void;
  fitItems: (containerLength: number, containerWidth: number, containerHeight: number) => {
    totalItems: number;
    fittedItems: number;
    unfittedItems: number;
  };
  calculateEfficiency: (containerLength: number, containerWidth: number, containerHeight: number) => number;
}

export default function CargoFitter() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalPallets: 0,
    fittedItems: 0,
    fittedPallets: 0,
    unfittedItems: 0,
    unfittedPallets: 0,
    efficiency: 0,
    totalWeight: 0,
    fittedWeight: 0
  });
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'dual'>('top');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fullScreenView, setFullScreenView] = useState<'none' | 'top' | 'side'>('none');
  const [containerDims, setContainerDims] = useState<{
    length: string | number;
    width: string | number;
    height: string | number;
  }>({
    length: '',
    width: '',
    height: ''
  });
  const [itemInput, setItemInput] = useState({
    length: '',
    width: '',
    height: '',
    weight: '',
    name: '',
    quantity: '1'
  });
  const [units, setUnits] = useState('cm');
  const [weightUnits, setWeightUnits] = useState('kg');

  // Unit conversion factors (all conversions from cm)
  const conversionFactors = {
    cm: 1,
    m: 0.01,
    in: 0.393701,
    ft: 0.0328084
  };

  // Weight conversion factors (all conversions from kg)
  const weightConversionFactors = {
    kg: 1,
    g: 1000,
    lb: 2.20462,
    oz: 35.274
  };

  // Convert dimensions from one unit to another
  const convertDimension = (value: number, fromUnit: string, toUnit: string): number => {
    const inCm = value / conversionFactors[fromUnit as keyof typeof conversionFactors];
    return parseFloat((inCm * conversionFactors[toUnit as keyof typeof conversionFactors]).toFixed(2));
  };

  // Convert weight from one unit to another
  const convertWeight = (value: number, fromUnit: string, toUnit: string): number => {
    const inKg = value / weightConversionFactors[fromUnit as keyof typeof weightConversionFactors];
    return parseFloat((inKg * weightConversionFactors[toUnit as keyof typeof weightConversionFactors]).toFixed(2));
  };

  // Handle unit change with conversion
  const handleUnitsChange = (newUnits: string) => {
    if (newUnits !== units) {
      // Convert container dimensions
      setContainerDims({
        length: containerDims.length ? convertDimension(Number(containerDims.length), units, newUnits).toString() : '',
        width: containerDims.width ? convertDimension(Number(containerDims.width), units, newUnits).toString() : '',
        height: containerDims.height ? convertDimension(Number(containerDims.height), units, newUnits).toString() : ''
      });

      // Convert item input values if they exist
      if (itemInput.length || itemInput.width || itemInput.height) {
        setItemInput({
          ...itemInput,
          length: itemInput.length ? convertDimension(Number(itemInput.length), units, newUnits).toString() : '',
          width: itemInput.width ? convertDimension(Number(itemInput.width), units, newUnits).toString() : '',
          height: itemInput.height ? convertDimension(Number(itemInput.height), units, newUnits).toString() : ''
        });
      }

      // Convert existing items
      if (cargoFitterRef.current && cargoFitterRef.current.items.length > 0) {
        cargoFitterRef.current.items.forEach((item: Item) => {
          item.length = convertDimension(item.length, units, newUnits);
          item.width = convertDimension(item.width, units, newUnits);
          item.height = convertDimension(item.height, units, newUnits);
          if (item.x !== undefined) item.x = convertDimension(item.x, units, newUnits);
          if (item.y !== undefined) item.y = convertDimension(item.y, units, newUnits);
          if (item.z !== undefined) item.z = convertDimension(item.z, units, newUnits);
        });
        updateItemsList();
        updateStats();
        drawVisualization();
      }

      setUnits(newUnits);
    }
  };

  // Handle weight unit change with conversion
  const handleWeightUnitsChange = (newWeightUnits: string) => {
    if (newWeightUnits !== weightUnits) {
      // Convert item input weight if it exists
      if (itemInput.weight) {
        setItemInput({
          ...itemInput,
          weight: convertWeight(Number(itemInput.weight), weightUnits, newWeightUnits).toString()
        });
      }

      // Convert existing items weights
      if (cargoFitterRef.current && cargoFitterRef.current.items.length > 0) {
        cargoFitterRef.current.items.forEach((item: Item) => {
          item.weight = convertWeight(item.weight, weightUnits, newWeightUnits);
        });
        updateItemsList();
        updateStats();
      }

      setWeightUnits(newWeightUnits);
    }
  };

  const containerPresets = {
    '53-truck': { length: 1600, width: 256, height: 279, name: "53&apos; Truck", units: 'cm' },
    '48-truck': { length: 1455, width: 256, height: 279, name: "48&apos; Truck", units: 'cm' },
    'sprinter': { length: 360, width: 170, height: 180, name: "Sprinter Van", units: 'cm' },
    'pmc-q6': { length: 244, width: 317, height: 294, name: "PMC MD (Q6)", units: 'cm' },
    'pmc-q7': { length: 317, width: 244, height: 300, name: "PMC MD (Q7)", units: 'cm' },
    'pmc-j4': { length: 223.5, width: 317.5, height: 243.84, name: "PMC MD (J4)", units: 'cm' },
    'pmc-ld': { length: 224, width: 317, height: 163, name: "PMC LD", units: 'cm' }
  };

  const applyPreset = (presetKey: string) => {
    const preset = containerPresets[presetKey as keyof typeof containerPresets];
    if (preset) {
      const convertedDims = {
        length: convertDimension(preset.length, preset.units, units),
        width: convertDimension(preset.width, preset.units, units),
        height: convertDimension(preset.height, preset.units, units)
      };
      
      setContainerDims(convertedDims);
    }
  };

  const cargoFitterRef = useRef<CargoFitterRef | null>(null);
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideCanvasRef = useRef<HTMLCanvasElement>(null);

  const boxesOverlap3D = useCallback((x1: number, y1: number, z1: number, l1: number, w1: number, h1: number, x2: number, y2: number, z2: number, l2: number, w2: number, h2: number): boolean => {
    return !(x1 + l1 <= x2 || x2 + l2 <= x1 || 
            y1 + w1 <= y2 || y2 + w2 <= y1 || 
            z1 + h1 <= z2 || z2 + h2 <= z1);
  }, []);

  const canPlaceItem3D = useCallback((item: Item, x: number, y: number, z: number, fittedItems: Item[], containerLength: number, containerWidth: number, containerHeight: number): boolean => {
    if (x + item.length > containerLength || 
        y + item.width > containerWidth || 
        z + item.height > containerHeight) {
      return false;
    }

    for (const placedItem of fittedItems) {
      if (boxesOverlap3D(
        x, y, z, item.length, item.width, item.height,
        placedItem.x!, placedItem.y!, placedItem.z!, 
        placedItem.length, placedItem.width, placedItem.height
      )) {
        return false;
      }
    }
    return true;
  }, [boxesOverlap3D]);

  // 3D positioning algorithm
  const findBestPosition3D = useCallback((item: Item, fittedItems: Item[], containerLength: number, containerWidth: number, containerHeight: number): Position | null => {
    for (let z = 0; z <= containerHeight - item.height; z++) {
      for (let y = 0; y <= containerWidth - item.width; y++) {
        for (let x = 0; x <= containerLength - item.length; x++) {
          if (canPlaceItem3D(item, x, y, z, fittedItems, containerLength, containerWidth, containerHeight)) {
            return { x, y, z };
          }
        }
      }
    }
    return null;
  }, [canPlaceItem3D]);

  const updateItemsList = useCallback(() => {
    if (cargoFitterRef.current) {
      setItems([...cargoFitterRef.current.items]);
    }
  }, []);

  const updateStats = useCallback(() => {
    if (cargoFitterRef.current) {
      const totalItems = cargoFitterRef.current.items.length;
      const fittedCount = cargoFitterRef.current.items.filter((item: Item) => item.fitted).length;
      const unfittedCount = totalItems - fittedCount;
      
      // Calculate unique pallet names for count
      const uniquePalletNames = new Set(cargoFitterRef.current.items.map((item: Item) => item.name));
      const totalPallets = uniquePalletNames.size;
      
      const fittedPalletNames = new Set(cargoFitterRef.current.items.filter((item: Item) => item.fitted).map((item: Item) => item.name));
      const fittedPallets = fittedPalletNames.size;
      const unfittedPallets = totalPallets - fittedPallets;
      
      // Calculate weights
      const totalWeight = cargoFitterRef.current.items.reduce((sum: number, item: Item) => sum + item.weight, 0);
      const fittedWeight = cargoFitterRef.current.items
        .filter((item: Item) => item.fitted)
        .reduce((sum: number, item: Item) => sum + item.weight, 0);
      
      const efficiency = containerDims.length && containerDims.width && containerDims.height 
        ? cargoFitterRef.current.calculateEfficiency(
            Number(containerDims.length),
            Number(containerDims.width),
            Number(containerDims.height)
          )
        : 0;

      setStats({
        totalItems,
        totalPallets,
        fittedItems: fittedCount,
        fittedPallets,
        unfittedItems: unfittedCount,
        unfittedPallets,
        efficiency: Math.round(efficiency),
        totalWeight: Math.round(totalWeight * 100) / 100,
        fittedWeight: Math.round(fittedWeight * 100) / 100
      });
    }
  }, [containerDims.length, containerDims.width, containerDims.height]);

  const drawTopView = useCallback(() => {
    if (!topCanvasRef.current) return;

    const canvas = topCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if container dimensions are provided
    if (!containerDims.length || !containerDims.width) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#4a5568';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Enter container dimensions to see visualization', canvas.width / 2, canvas.height / 2);
      return;
    }

    const containerLength = Number(containerDims.length);
    const containerWidth = Number(containerDims.width);

    const maxWidth = (canvas.width - 80) * zoomLevel;
    const maxHeight = (canvas.height - 80) * zoomLevel;
    const scale = Math.min(maxWidth / containerLength, maxHeight / containerWidth);
    
    const scaledLength = containerLength * scale;
    const scaledWidth = containerWidth * scale;
    const offsetX = (canvas.width - scaledLength) / 2;
    const offsetY = (canvas.height - scaledWidth) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, scaledLength, scaledWidth);
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(offsetX, offsetY, scaledLength, scaledWidth);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f4a261', '#ff9f43', '#6c5ce7', '#fd79a8', '#00b894'];
    
    // Group items by name to assign same color to same pallet type
    const palletColors: { [key: string]: string } = {};
    let colorIndex = 0;
    
    items.forEach((item) => {
      if (!palletColors[item.name]) {
        palletColors[item.name] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      
      if (item.fitted && item.x !== undefined && item.y !== undefined) {
        const x = offsetX + item.x * scale;
        const y = offsetY + item.y * scale;
        const width = item.length * scale;
        const height = item.width * scale;

        ctx.fillStyle = palletColors[item.name];
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        if (width > 30 && height > 20) {
          ctx.fillStyle = '#2d3748';
          ctx.font = `${Math.max(8, 10 * zoomLevel)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(item.name, x + width/2, y + height/2 - 5);
          ctx.fillText(`${item.weight}${weightUnits}`, x + width/2, y + height/2 + 8);
        }
      }
    });

    ctx.fillStyle = '#4a5568';
    ctx.font = `${Math.max(10, 12 * zoomLevel)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `Container: ${containerLength}×${containerWidth}${units}`, 
      canvas.width / 2, 
      offsetY + scaledWidth + 20
    );
  }, [containerDims, units, weightUnits, items, zoomLevel]);

  const drawSideView = useCallback(() => {
    if (!sideCanvasRef.current) return;

    const canvas = sideCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if container dimensions are provided
    if (!containerDims.length || !containerDims.height) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#4a5568';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Enter container dimensions to see visualization', canvas.width / 2, canvas.height / 2);
      return;
    }

    const containerLength = Number(containerDims.length);
    const containerHeight = Number(containerDims.height);

    const maxWidth = (canvas.width - 80) * zoomLevel;
    const maxHeight = (canvas.height - 80) * zoomLevel;
    const scale = Math.min(maxWidth / containerLength, maxHeight / containerHeight);
    
    const scaledLength = containerLength * scale;
    const scaledHeight = containerHeight * scale;
    const offsetX = (canvas.width - scaledLength) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, scaledLength, scaledHeight);
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(offsetX, offsetY, scaledLength, scaledHeight);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f4a261', '#ff9f43', '#6c5ce7', '#fd79a8', '#00b894'];
    
    // Group items by name to assign same color to same pallet type
    const palletColors: { [key: string]: string } = {};
    let colorIndex = 0;
    
    items.forEach((item) => {
      if (!palletColors[item.name]) {
        palletColors[item.name] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      
      if (item.fitted && item.x !== undefined && item.z !== undefined) {
        const x = offsetX + item.x * scale;
        const y = offsetY + (containerHeight - item.z! - item.height) * scale;
        const width = item.length * scale;
        const height = item.height * scale;

        ctx.fillStyle = palletColors[item.name];
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        if (width > 30 && height > 20) {
          ctx.fillStyle = '#2d3748';
          ctx.font = `${Math.max(8, 10 * zoomLevel)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(item.name, x + width/2, y + height/2 - 5);
          ctx.fillText(`${item.weight}${weightUnits}`, x + width/2, y + height/2 + 8);
        }
      }
    });

    ctx.fillStyle = '#4a5568';
    ctx.font = `${Math.max(10, 12 * zoomLevel)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `Container: ${containerLength}×${containerHeight}${units}`, 
      canvas.width / 2, 
      offsetY + scaledHeight + 20
    );
  }, [containerDims, units, weightUnits, items, zoomLevel]);

  const drawVisualization = useCallback(() => {
    drawTopView();
    if (viewMode === 'side' || viewMode === 'dual') {
      drawSideView();
    }
  }, [drawTopView, drawSideView, viewMode]);

  useEffect(() => {
    cargoFitterRef.current = {
      items: [],
      addItem: (length: number, width: number, height: number, weight: number, name: string, quantity: number) => {
        const ids: number[] = [];
        for (let i = 0; i < quantity; i++) {
          const item: Item = {
            id: Date.now() + Math.random() + i,
            length,
            width, 
            height,
            weight,
            name: quantity > 1 ? `${name} #${i + 1}` : name,
            fitted: false,
            x: 0,
            y: 0,
            z: 0
          };
          cargoFitterRef.current!.items.push(item);
          ids.push(item.id);
        }
        return ids;
      },
      removeItem: (id: number) => {
        cargoFitterRef.current!.items = cargoFitterRef.current!.items.filter((item: Item) => item.id !== id);
        return true;
      },
      clearItems: () => {
        cargoFitterRef.current!.items = [];
      },
      fitItems: (containerLength: number, containerWidth: number, containerHeight: number) => {
        cargoFitterRef.current!.items.forEach((item: Item) => {
          item.fitted = false;
          item.x = 0;
          item.y = 0;
          item.z = 0;
        });
        
        const sortedItems = [...cargoFitterRef.current!.items].sort((a: Item, b: Item) => 
          (b.length * b.width * b.height) - (a.length * a.width * a.height)
        );

        const fittedItems: Item[] = [];

        for (const item of sortedItems) {
          const position = findBestPosition3D(item, fittedItems, containerLength, containerWidth, containerHeight);
          if (position) {
            item.x = position.x;
            item.y = position.y;
            item.z = position.z;
            item.fitted = true;
            fittedItems.push(item);
          }
        }

        return {
          totalItems: cargoFitterRef.current!.items.length,
          fittedItems: fittedItems.length,
          unfittedItems: cargoFitterRef.current!.items.length - fittedItems.length
        };
      },
      calculateEfficiency: (containerLength: number, containerWidth: number, containerHeight: number) => {
        const containerVolume = containerLength * containerWidth * containerHeight;
        const usedVolume = cargoFitterRef.current!.items
          .filter((item: Item) => item.fitted)
          .reduce((sum: number, item: Item) => sum + (item.length * item.width * item.height), 0);
        
        return containerVolume > 0 ? (usedVolume / containerVolume) * 100 : 0;
      }
    };
  }, [findBestPosition3D]);

  const addItem = () => {
    const length = Number(itemInput.length);
    const width = Number(itemInput.width);
    const height = Number(itemInput.height);
    const weight = Number(itemInput.weight);
    const quantity = Number(itemInput.quantity);
    
    if (cargoFitterRef.current && length > 0 && width > 0 && height > 0 && weight > 0 && quantity > 0 && itemInput.name.trim()) {
      cargoFitterRef.current.addItem(
        length,
        width,
        height,
        weight,
        itemInput.name.trim(),
        quantity
      );
      
      setItemInput({
        length: '',
        width: '',
        height: '',
        weight: '',
        name: '',
        quantity: '1'
      });
      
      updateItemsList();
      updateStats();
    }
  };

  const removeItem = (id: number) => {
    if (cargoFitterRef.current) {
      cargoFitterRef.current.removeItem(id);
      updateItemsList();
      updateStats();
      drawVisualization();
    }
  };

  const clearItems = () => {
    if (cargoFitterRef.current) {
      cargoFitterRef.current.clearItems();
      updateItemsList();
      updateStats();
      drawVisualization();
    }
  };

  const fitItems = () => {
    if (cargoFitterRef.current && containerDims.length && containerDims.width && containerDims.height) {
      cargoFitterRef.current.fitItems(
        Number(containerDims.length),
        Number(containerDims.width),
        Number(containerDims.height)
      );
      updateItemsList();
      updateStats();
      drawVisualization();
    }
  };

  const handleViewChange = (mode: 'top' | 'side' | 'dual') => {
    setViewMode(mode);
  };

  useEffect(() => {
    drawVisualization();
  }, [drawVisualization]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50 min-h-screen">
      <style jsx>{`
        .cargo-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .cargo-section { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .cargo-section h3 { color: #2d3748; margin-bottom: 20px; font-size: 1.3rem; font-weight: 600; }
        .cargo-dimension-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .cargo-dimension-group { display: flex; flex-direction: column; gap: 5px; }
        .cargo-dimension-group label { font-size: 12px; font-weight: 600; color: #4a5568; text-transform: uppercase; }
        .cargo-input-group { display: flex; gap: 15px; margin-bottom: 15px; align-items: center; }
        .cargo-input-group label { min-width: 80px; font-weight: 500; color: #4a5568; }
        .cargo-input { padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; flex: 1; font-size: 14px; transition: all 0.3s ease; }
        .cargo-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .cargo-btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
        .cargo-btn:hover { background: #5a67d8; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); }
        .cargo-btn-success { background: #38a169; width: 100%; margin-top: 15px; padding: 15px; font-size: 16px; }
        .cargo-btn-danger { background: #e53e3e; margin-left: 10px; }
        .cargo-items-list { max-height: 200px; overflow-y: auto; border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px; }
        .cargo-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 5px 0; background: #f7fafc; border-radius: 6px; font-size: 14px; }
        .cargo-item button { background: #e53e3e; padding: 4px 8px; font-size: 12px; border: none; border-radius: 4px; color: white; cursor: pointer; }
        .cargo-canvas { border: 2px solid #e2e8f0; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        .cargo-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px; }
        .cargo-stat-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 10px; text-align: center; }
        .cargo-stat-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 5px; }
        .cargo-stat-label { font-size: 0.8rem; opacity: 0.9; }
        .cargo-view-selector { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
        .cargo-view-btn { background: #e2e8f0; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: 600; color: #4a5568; transition: all 0.3s ease; }
        .cargo-view-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; transform: scale(1.05); }
        .cargo-canvas-container { display: flex; justify-content: center; margin-top: 20px; flex-wrap: wrap; gap: 30px; }
        .cargo-canvas-wrapper { display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; }
        .cargo-canvas-title { font-weight: 600; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .cargo-canvas-controls { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
        .zoom-control { display: flex; align-items: center; gap: 10px; background: white; padding: 8px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .zoom-btn { background: #667eea; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; }
        .zoom-btn:hover { background: #5a67d8; }
        .zoom-btn:disabled { background: #cbd5e0; cursor: not-allowed; }
        .zoom-level { font-size: 14px; font-weight: 600; color: #4a5568; min-width: 50px; text-align: center; }
        .fullscreen-btn { background: #38a169; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .fullscreen-btn:hover { background: #2f855a; }
        .fullscreen-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .fullscreen-content { background: white; padding: 20px; border-radius: 10px; max-width: 95vw; max-height: 95vh; overflow: auto; }
        .fullscreen-close { position: absolute; top: 20px; right: 20px; background: #e53e3e; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: bold; }
        .fullscreen-close:hover { background: #c53030; }
        .units-container { display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
        .units-group { display: flex; gap: 10px; align-items: center; }
        @media (max-width: 768px) {
          .cargo-controls { grid-template-columns: 1fr; }
          .cargo-dimension-inputs { grid-template-columns: 1fr; }
          .cargo-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
      
      <h1 className="text-center text-3xl font-bold mb-8 text-gray-800">📦 3D Cargo Fitter with Pallets</h1>
      
      <div className="units-container">
        <div className="units-group">
          <label className="font-semibold text-gray-600">Units:</label>
          <select 
            className="p-2 border-2 border-gray-300 rounded-md"
            value={units} 
            onChange={(e) => handleUnitsChange(e.target.value)}
          >
            <option value="cm">Centimeters (cm)</option>
            <option value="m">Meters (m)</option>
            <option value="in">Inches (in)</option>
            <option value="ft">Feet (ft)</option>
          </select>
        </div>
        
        <div className="units-group">
          <label className="font-semibold text-gray-600">Weight Units:</label>
          <select 
            className="p-2 border-2 border-gray-300 rounded-md"
            value={weightUnits} 
            onChange={(e) => handleWeightUnitsChange(e.target.value)}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="oz">Ounces (oz)</option>
          </select>
        </div>
        
        <div className="units-group">
          <label className="font-semibold text-gray-600">Container Presets:</label>
          <select 
            className="p-2 border-2 border-gray-300 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onChange={(e) => {
              if (e.target.value) {
                applyPreset(e.target.value);
                e.target.value = '';
              }
            }} 
            defaultValue=""
          >
            <option value="">Select a preset...</option>
            <option value="53-truck">🚛 53&apos; Truck</option>
            <option value="48-truck">🚚 48&apos; Truck</option>
            <option value="sprinter">🚐 Sprinter Van</option>
            <option value="pmc-q6">📦 PMC MD (Q6)</option>
            <option value="pmc-q7">📦 PMC MD (Q7)</option>
            <option value="pmc-j4">📦 PMC MD (J4)</option>
            <option value="pmc-ld">📦 PMC LD</option>
          </select>
        </div>
      </div>
      
      <div className="cargo-controls">
        <div className="cargo-section">
          <h3>Container Dimensions</h3>
          <div className="cargo-dimension-inputs">
            <div className="cargo-dimension-group">
              <label>Length ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={containerDims.length}
                placeholder="Enter length"
                onChange={(e) => setContainerDims({
                  ...containerDims,
                  length: e.target.value
                })}
                min="1"
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Width ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={containerDims.width}
                placeholder="Enter width"
                onChange={(e) => setContainerDims({
                  ...containerDims,
                  width: e.target.value
                })}
                min="1"
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Height ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={containerDims.height}
                placeholder="Enter height"
                onChange={(e) => setContainerDims({
                  ...containerDims,
                  height: e.target.value
                })}
                min="1"
              />
            </div>
          </div>
        </div>
        
        <div className="cargo-section">
          <h3>Add Pallet</h3>
          <div className="cargo-dimension-inputs">
            <div className="cargo-dimension-group">
              <label>Length ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={itemInput.length}
                placeholder="Enter length"
                onChange={(e) => setItemInput({
                  ...itemInput,
                  length: e.target.value
                })}
                min="0.1"
                step="0.1"
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Width ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={itemInput.width}
                placeholder="Enter width"
                onChange={(e) => setItemInput({
                  ...itemInput,
                  width: e.target.value
                })}
                min="0.1"
                step="0.1"
              />
            </div>
            <div className="cargo-dimension-group">
              <label>Height ({units})</label>
              <input
                type="number"
                className="cargo-input"
                value={itemInput.height}
                placeholder="Enter height"
                onChange={(e) => setItemInput({
                  ...itemInput,
                  height: e.target.value
                })}
                min="0.1"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="cargo-input-group">
            <label>Weight ({weightUnits}):</label>
            <input
              type="number"
              className="cargo-input"
              value={itemInput.weight}
              placeholder="Enter weight"
              onChange={(e) => setItemInput({
                ...itemInput,
                weight: e.target.value
              })}
              min="0.1"
              step="0.1"
            />
          </div>
          
          <div className="cargo-input-group">
            <label>Name:</label>
            <input
              type="text"
              className="cargo-input"
              value={itemInput.name}
              placeholder="Pallet name"
              onChange={(e) => setItemInput({
                ...itemInput,
                name: e.target.value
              })}
            />
          </div>
          
          <div className="cargo-input-group">
            <label>Quantity:</label>
            <input
              type="number"
              className="cargo-input"
              value={itemInput.quantity}
              onChange={(e) => setItemInput({
                ...itemInput,
                quantity: e.target.value
              })}
              min="1"
              step="1"
            />
          </div>
          
          <button className="cargo-btn" onClick={addItem}>Add Pallet(s)</button>
          <button className="cargo-btn cargo-btn-danger" onClick={clearItems}>Clear All</button>
        </div>
      </div>
      
      <div className="cargo-section">
        <h3>Pallets to Pack ({items.length} total items)</h3>
        <div className="cargo-items-list">
          {items.map((item) => (
            <div key={item.id} className="cargo-item">
              <span>
                {item.name} ({item.length}×{item.width}×{item.height}{units}, {item.weight}{weightUnits})
                {item.fitted && <span style={{color: 'green', fontWeight: 'bold'}}> ✓ Fitted</span>}
                {item.fitted === false && <span style={{color: 'red', fontWeight: 'bold'}}> ✗ Not Fitted</span>}
              </span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>
        <button className="cargo-btn cargo-btn-success" onClick={fitItems}>
          🎯 Fit All Pallets
        </button>
      </div>
      
      <div className="cargo-section mt-8">
        <h3>3D Packing Visualization</h3>
        <div className="cargo-view-selector">
          <button 
            className={`cargo-view-btn ${viewMode === 'top' ? 'active' : ''}`}
            onClick={() => handleViewChange('top')}
          >
            🔍 Top View
          </button>
          <button 
            className={`cargo-view-btn ${viewMode === 'side' ? 'active' : ''}`}
            onClick={() => handleViewChange('side')}
          >
            🔍 Side View
          </button>
          <button 
            className={`cargo-view-btn ${viewMode === 'dual' ? 'active' : ''}`}
            onClick={() => handleViewChange('dual')}
          >
            🔍 Dual View
          </button>
        </div>
        
        <div className={`cargo-canvas-container ${viewMode === 'dual' ? 'dual-view' : 'single-view'}`}>
          {(viewMode === 'top' || viewMode === 'dual') && (
            <div className="cargo-canvas-wrapper">
              <div className="cargo-canvas-title">Top View (Length × Width)</div>
              <div className="cargo-canvas-controls">
                <div className="zoom-control">
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                    disabled={zoomLevel <= 0.5}
                  >
                    −
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    disabled={zoomLevel >= 3}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="fullscreen-btn" 
                  onClick={() => setFullScreenView('top')}
                >
                  🔍 Full Screen
                </button>
              </div>
              <canvas 
                ref={topCanvasRef}
                className="cargo-canvas"
                width={viewMode === 'dual' ? 400 : 600}
                height={viewMode === 'dual' ? 300 : 400}
              />
            </div>
          )}
          
          {(viewMode === 'side' || viewMode === 'dual') && (
            <div className="cargo-canvas-wrapper">
              <div className="cargo-canvas-title">Side View (Length × Height)</div>
              <div className="cargo-canvas-controls">
                <div className="zoom-control">
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                    disabled={zoomLevel <= 0.5}
                  >
                    −
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    disabled={zoomLevel >= 3}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="fullscreen-btn" 
                  onClick={() => setFullScreenView('side')}
                >
                  🔍 Full Screen
                </button>
              </div>
              <canvas 
                ref={sideCanvasRef}
                className="cargo-canvas"
                width={viewMode === 'dual' ? 400 : 600}
                height={viewMode === 'dual' ? 300 : 400}
              />
            </div>
          )}
        </div>
        
        <div className="cargo-stats">
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.totalPallets}</div>
            <div className="cargo-stat-label">Pallet Types</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.totalItems}</div>
            <div className="cargo-stat-label">Total Pallets</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.fittedItems}</div>
            <div className="cargo-stat-label">Fitted Pallets</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.unfittedItems}</div>
            <div className="cargo-stat-label">Unfitted Pallets</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.efficiency}%</div>
            <div className="cargo-stat-label">Space Efficiency</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.totalWeight}</div>
            <div className="cargo-stat-label">Total Weight ({weightUnits})</div>
          </div>
          <div className="cargo-stat-card">
            <div className="cargo-stat-value">{stats.fittedWeight}</div>
            <div className="cargo-stat-label">Fitted Weight ({weightUnits})</div>
          </div>
        </div>
      </div>
      
      {/* Full Screen Overlay */}
      {fullScreenView !== 'none' && (
        <div className="fullscreen-overlay">
          <button 
            className="fullscreen-close"
            onClick={() => setFullScreenView('none')}
          >
            ×
          </button>
          <div className="fullscreen-content">
            <div className="cargo-canvas-wrapper">
              <div className="cargo-canvas-title">
                {fullScreenView === 'top' ? 'Top View (Length × Width) - Full Screen' : 'Side View (Length × Height) - Full Screen'}
              </div>
              <div className="cargo-canvas-controls">
                <div className="zoom-control">
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                    disabled={zoomLevel <= 0.5}
                  >
                    −
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    className="zoom-btn" 
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    disabled={zoomLevel >= 3}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="fullscreen-btn" 
                  onClick={() => setZoomLevel(1)}
                >
                  Reset Zoom
                </button>
              </div>
              <canvas 
                ref={fullScreenView === 'top' ? topCanvasRef : sideCanvasRef}
                className="cargo-canvas"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}