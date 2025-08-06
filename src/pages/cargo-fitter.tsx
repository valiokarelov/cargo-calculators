import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';

interface Item {
  id: number;
  length: number;
  width: number;
  height: number;
  name: string;
  fitted?: boolean;
  x?: number;
  y?: number;
  z?: number;
}

interface Stats {
  totalItems: number;
  fittedItems: number;
  unfittedItems: number;
  efficiency: number;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CargoFitterRef {
  items: Item[];
  addItem: (length: number, width: number, height: number, name: string) => number;
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
    fittedItems: 0,
    unfittedItems: 0,
    efficiency: 0
  });
  const [viewMode, setViewMode] = useState<'top' | 'side' | 'dual'>('top');
  const [containerDims, setContainerDims] = useState({
    length: 100,
    width: 80,
    height: 60
  });
  const [itemInput, setItemInput] = useState({
    length: 20,
    width: 15,
    height: 10,
    name: 'Item'
  });
  const [units, setUnits] = useState('cm');

  const cargoFitterRef = useRef<CargoFitterRef | null>(null);
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideCanvasRef = useRef<HTMLCanvasElement>(null);

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
  }, []);

  const boxesOverlap3D = useCallback((x1: number, y1: number, z1: number, l1: number, w1: number, h1: number, x2: number, y2: number, z2: number, l2: number, w2: number, h2: number): boolean => {
    return !(x1 + l1 <= x2 || x2 + l2 <= x1 || 
            y1 + w1 <= y2 || y2 + w2 <= y1 || 
            z1 + h1 <= z2 || z2 + h2 <= z1);
  }, []);

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
      const efficiency = cargoFitterRef.current.calculateEfficiency(
        containerDims.length,
        containerDims.width,
        containerDims.height
      );

      setStats({
        totalItems,
        fittedItems: fittedCount,
        unfittedItems: unfittedCount,
        efficiency: Math.round(efficiency)
      });
    }
  }, [containerDims.length, containerDims.width, containerDims.height]);

  const addSampleItems = useCallback(() => {
    if (cargoFitterRef.current) {
      cargoFitterRef.current.addItem(30, 20, 15, 'Box A');
      cargoFitterRef.current.addItem(25, 25, 10, 'Box B');
      cargoFitterRef.current.addItem(20, 15, 20, 'Box C');
      cargoFitterRef.current.addItem(15, 10, 8, 'Box D');
      updateItemsList();
      updateStats();
    }
  }, [updateItemsList, updateStats]);

  const drawTopView = useCallback(() => {
    if (!topCanvasRef.current) return;

    const canvas = topCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = canvas.width - 80;
    const maxHeight = canvas.height - 80;
    const scale = Math.min(maxWidth / containerDims.length, maxHeight / containerDims.width);
    
    const scaledLength = containerDims.length * scale;
    const scaledWidth = containerDims.width * scale;
    const offsetX = (canvas.width - scaledLength) / 2;
    const offsetY = (canvas.height - scaledWidth) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, scaledLength, scaledWidth);
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(offsetX, offsetY, scaledLength, scaledWidth);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f4a261'];
    items.forEach((item, index) => {
      if (item.fitted && item.x !== undefined && item.y !== undefined) {
        const x = offsetX + item.x * scale;
        const y = offsetY + item.y * scale;
        const width = item.length * scale;
        const height = item.width * scale;

        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        if (width > 30 && height > 20) {
          ctx.fillStyle = '#2d3748';
          ctx.font = '11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.name, x + width/2, y + height/2);
        }
      }
    });

    ctx.fillStyle = '#4a5568';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Container: ${containerDims.length}×${containerDims.width}${units}`, 
      canvas.width / 2, 
      offsetY + scaledWidth + 20
    );
  }, [containerDims, units, items]);

  const drawSideView = useCallback(() => {
    if (!sideCanvasRef.current) return;

    const canvas = sideCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = canvas.width - 80;
    const maxHeight = canvas.height - 80;
    const scale = Math.min(maxWidth / containerDims.length, maxHeight / containerDims.height);
    
    const scaledLength = containerDims.length * scale;
    const scaledHeight = containerDims.height * scale;
    const offsetX = (canvas.width - scaledLength) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, scaledLength, scaledHeight);
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(offsetX, offsetY, scaledLength, scaledHeight);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f4a261'];
    items.forEach((item, index) => {
      if (item.fitted && item.x !== undefined && item.z !== undefined) {
        const x = offsetX + item.x * scale;
        const y = offsetY + (containerDims.height - item.z! - item.height) * scale;
        const width = item.length * scale;
        const height = item.height * scale;

        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        if (width > 30 && height > 20) {
          ctx.fillStyle = '#2d3748';
          ctx.font = '11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.name, x + width/2, y + height/2);
        }
      }
    });

    ctx.fillStyle = '#4a5568';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Container: ${containerDims.length}×${containerDims.height}${units}`, 
      canvas.width / 2, 
      offsetY + scaledHeight + 20
    );
  }, [containerDims, units, items]);

  const drawVisualization = useCallback(() => {
    drawTopView();
    if (viewMode === 'side' || viewMode === 'dual') {
      drawSideView();
    }
  }, [drawTopView, drawSideView, viewMode]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .cargo-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .cargo-title { text-align: center; font-size: 2rem; margin-bottom: 30px; color: #2d3748; }
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
      .cargo-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
      .cargo-stat-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
      .cargo-stat-value { font-size: 2rem; font-weight: 700; margin-bottom: 5px; }
      .cargo-stat-label { font-size: 0.9rem; opacity: 0.9; }
      .cargo-view-selector { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
      .cargo-view-btn { background: #e2e8f0; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-size: 14px; font-weight: 600; color: #4a5568; transition: all 0.3s ease; }
      .cargo-view-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; transform: scale(1.05); }
      .cargo-canvas-container { display: flex; justify-content: center; margin-top: 20px; flex-wrap: wrap; gap: 30px; }
      .cargo-canvas-wrapper { display: flex; flex-direction: column; align-items: center; gap: 10px; }
      .cargo-canvas-title { font-weight: 600; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .cargo-visualization { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); margin-top: 30px; }
      .cargo-visualization h3 { color: #2d3748; margin-bottom: 20px; font-size: 1.3rem; font-weight: 600; }
      .units-selector { display: flex; gap: 10px; align-items: center; margin-bottom: 15px; }
      .units-selector select { padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
      .dual-view .cargo-canvas { width: 400px; height: 300px; }
      .single-view .cargo-canvas { width: 600px; height: 400px; }
      
      @media (max-width: 768px) {
        .cargo-controls { grid-template-columns: 1fr; }
        .cargo-dimension-inputs { grid-template-columns: 1fr; }
        .cargo-stats { grid-template-columns: 1fr; }
        .cargo-canvas-container { flex-direction: column; align-items: center; }
        .dual-view .cargo-canvas { width: 350px; height: 250px; }
        .single-view .cargo-canvas { width: 350px; height: 250px; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    cargoFitterRef.current = {
      items: [],
      addItem: (length: number, width: number, height: number, name: string) => {
        const item: Item = {
          id: Date.now() + Math.random(),
          length,
          width, 
          height,
          name,
          fitted: false,
          x: 0,
          y: 0,
          z: 0
        };
        cargoFitterRef.current!.items.push(item);
        return item.id;
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
    
    addSampleItems();
  }, [addSampleItems, findBestPosition3D]);

  const addItem = () => {
    if (cargoFitterRef.current && itemInput.length > 0 && itemInput.width > 0 && itemInput.height > 0) {
      cargoFitterRef.current.addItem(
        itemInput.length,
        itemInput.width,
        itemInput.height,
        itemInput.name
      );
      
      setItemInput({
        length: 20,
        width: 15,
        height: 10,
        name: 'Item'
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
    if (cargoFitterRef.current) {
      cargoFitterRef.current.fitItems(
        containerDims.length,
        containerDims.width,
        containerDims.height
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
    <>
      <Head>
        <title>3D Cargo Fitter | Cargo Calculators</title>
        <meta name="description" content="Advanced 3D bin packing algorithm with dual-view visualization" />
      </Head>

      <div className="cargo-fitter">
        <div className="cargo-container">
          <h1 className="cargo-title">📦 3D Cargo Fitter</h1>
          
          <div className="units-selector">
            <label><strong>Units:</strong></label>
            <select value={units} onChange={(e) => setUnits(e.target.value)}>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
              <option value="in">Inches (in)</option>
              <option value="ft">Feet (ft)</option>
            </select>
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
                    onChange={(e) => setContainerDims({
                      ...containerDims,
                      length: Number(e.target.value)
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
                    onChange={(e) => setContainerDims({
                      ...containerDims,
                      width: Number(e.target.value)
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
                    onChange={(e) => setContainerDims({
                      ...containerDims,
                      height: Number(e.target.value)
                    })}
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="cargo-section">
              <h3>Add Item</h3>
              <div className="cargo-dimension-inputs">
                <div className="cargo-dimension-group">
                  <label>Length ({units})</label>
                  <input
                    type="number"
                    className="cargo-input"
                    value={itemInput.length}
                    onChange={(e) => setItemInput({
                      ...itemInput,
                      length: Number(e.target.value)
                    })}
                    min="1"
                  />
                </div>
                <div className="cargo-dimension-group">
                  <label>Width ({units})</label>
                  <input
                    type="number"
                    className="cargo-input"
                    value={itemInput.width}
                    onChange={(e) => setItemInput({
                      ...itemInput,
                      width: Number(e.target.value)
                    })}
                    min="1"
                  />
                </div>
                <div className="cargo-dimension-group">
                  <label>Height ({units})</label>
                  <input
                    type="number"
                    className="cargo-input"
                    value={itemInput.height}
                    onChange={(e) => setItemInput({
                      ...itemInput,
                      height: Number(e.target.value)
                    })}
                    min="1"
                  />
                </div>
              </div>
              <div className="cargo-input-group">
                <label>Name:</label>
                <input
                  type="text"
                  className="cargo-input"
                  value={itemInput.name}
                  onChange={(e) => setItemInput({
                    ...itemInput,
                    name: e.target.value
                  })}
                />
              </div>
              <button className="cargo-btn" onClick={addItem}>Add Item</button>
              <button className="cargo-btn cargo-btn-danger" onClick={clearItems}>Clear All</button>
            </div>
          </div>
          
          <div className="cargo-section">
            <h3>Items to Pack</h3>
            <div className="cargo-items-list">
              {items.map((item) => (
                <div key={item.id} className="cargo-item">
                  <span>
                    {item.name} ({item.length}×{item.width}×{item.height}{units})
                    {item.fitted && <span style={{color: 'green', fontWeight: 'bold'}}> ✓ Fitted</span>}
                    {item.fitted === false && <span style={{color: 'red', fontWeight: 'bold'}}> ✗ Not Fitted</span>}
                  </span>
                  <button onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="cargo-btn cargo-btn-success" onClick={fitItems}>
              🎯 Fit Items
            </button>
          </div>
          
          <div className="cargo-visualization">
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
                <div className="cargo-stat-value">{stats.totalItems}</div>
                <div className="cargo-stat-label">Total Items</div>
              </div>
              <div className="cargo-stat-card">
                <div className="cargo-stat-value">{stats.fittedItems}</div>
                <div className="cargo-stat-label">Fitted Items</div>
              </div>
              <div className="cargo-stat-card">
                <div className="cargo-stat-value">{stats.efficiency}%</div>
                <div className="cargo-stat-label">Space Efficiency</div>
              </div>
              <div className="cargo-stat-card">
                <div className="cargo-stat-value">{stats.unfittedItems}</div>
                <div className="cargo-stat-label">Unfitted Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}