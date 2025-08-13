import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// Types
interface Item {
  id: string;
  length: number; // in cm (internal canonical unit)
  width: number;
  height: number;
  weight: number; // in kg
  name: string;
  quantity?: number;
  fitted?: boolean;
  x?: number;
  y?: number;
  z?: number;
}

interface Preset {
  length: number;
  width: number;
  height: number;
  name: string;
  units: string;
}

// Helper utilities
const uid = () => `${Date.now()}-${Math.random()}`;

// Conversion factors (all internal dimensions use cm, weight uses kg)
const conversionFactors: Record<string, number> = {
  cm: 1,
  m: 100,
  in: 2.54,
  ft: 30.48,
};

const weightConversion: Record<string, number> = {
  kg: 1,
  g: 1 / 1000,
  lb: 0.45359237,
  oz: 0.0283495231,
};

const containerPresets: Record<string, Preset> = {
  "53-truck": { length: 1600, width: 256, height: 279, name: "53' Truck", units: "cm" },
  "48-truck": { length: 1455, width: 256, height: 279, name: "48' Truck", units: "cm" },
  sprinter: { length: 360, width: 170, height: 180, name: "Sprinter Van", units: "cm" },
};

function toCm(value: number, unit: string) {
  return value * (conversionFactors[unit] ?? 1);
}

function fromCm(valueCm: number, unit: string) {
  return valueCm / (conversionFactors[unit] ?? 1);
}

function weightToKg(value: number, unit: string) {
  return value * (weightConversion[unit] ?? 1);
}

function weightFromKg(valueKg: number, unit: string) {
  return valueKg / (weightConversion[unit] ?? 1);
}

// Component
export default function CargoFitterThree() {
  // UI states
  const [units, setUnits] = useState<string>("cm");
  const [weightUnits, setWeightUnits] = useState<string>("kg");

  const [container, setContainer] = useState({ length: "1200", width: "240", height: "200" }); // default cm

  const [itemInput, setItemInput] = useState({ 
    length: "120", 
    width: "100", 
    height: "140", 
    weight: "300", 
    name: "Pallet", 
    quantity: "1" 
  });

  // Items held in a ref (so Three.js and algorithm can mutate without excessive rerenders)
  const itemsRef = useRef<Item[]>([]);
  const [, forceRerender] = useState(0); // quick rerender trigger when needed

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<unknown>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);

  // Stats
  const [stats, setStats] = useState({ 
    totalItems: 0, 
    fitted: 0, 
    unfitted: 0, 
    efficiency: 0, 
    totalWeight: 0, 
    fittedWeight: 0 
  });

  // Simple orbit controls implementation
  const setupOrbitControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 600;
    let targetY = 400;
    let targetZ = 800;
    let currentX = targetX;
    let currentY = targetY;
    let currentZ = targetZ;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      targetX = Math.max(200, Math.min(1500, targetX - deltaX * 2));
      targetY = Math.max(100, Math.min(800, targetY + deltaY * 2));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (event: WheelEvent) => {
      targetZ = Math.max(300, Math.min(2000, targetZ + event.deltaY));
      event.preventDefault();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    return {
      update: () => {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        currentZ += (targetZ - currentZ) * 0.05;
        camera.position.set(currentX, currentY, currentZ);
        camera.lookAt(600, 0, 200);
      },
      dispose: () => {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
      }
    };
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const width = 800;
    const height = 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7fb);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 5000);
    camera.position.set(600, 400, 800);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(500, 1000, 500);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const grid = new THREE.GridHelper(2000, 40, 0xcccccc, 0xeeeeee);
    scene.add(grid);

    // group to hold box meshes
    const boxesGroup = new THREE.Group();
    scene.add(boxesGroup);

    // Simple orbit controls
    const controls = setupOrbitControls(camera, renderer);

    // Attach
    currentMount.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;
    boxesGroupRef.current = boxesGroup;

    // animation
    let frameId: number;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && currentMount?.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // Utility to rebuild visual boxes from items array
  const rebuildBoxes = useCallback(() => {
    if (!boxesGroupRef.current) return;
    const group = boxesGroupRef.current;
    // clear
    while (group.children.length) group.remove(group.children[0]);

    const containerL = Number(container.length);
    const containerW = Number(container.width);
    const containerH = Number(container.height);

    // container base plane
    const containerGeo = new THREE.BoxGeometry(containerL, 2, containerW);
    const containerMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.2 
    });
    const containerMesh = new THREE.Mesh(containerGeo, containerMat);
    containerMesh.position.set(containerL / 2, -1, containerW / 2);
    group.add(containerMesh);

    // Container walls for visualization
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });

    // Back wall
    const backWall = new THREE.PlaneGeometry(containerL, containerH);
    const backMesh = new THREE.Mesh(backWall, wallMaterial);
    backMesh.position.set(containerL/2, containerH/2, 0);
    group.add(backMesh);

    // Left wall
    const leftWall = new THREE.PlaneGeometry(containerW, containerH);
    const leftMesh = new THREE.Mesh(leftWall, wallMaterial);
    leftMesh.rotation.y = Math.PI / 2;
    leftMesh.position.set(0, containerH/2, containerW/2);
    group.add(leftMesh);

    // Right wall
    const rightWall = new THREE.PlaneGeometry(containerW, containerH);
    const rightMesh = new THREE.Mesh(rightWall, wallMaterial);
    rightMesh.rotation.y = -Math.PI / 2;
    rightMesh.position.set(containerL, containerH/2, containerW/2);
    group.add(rightMesh);

    for (const it of itemsRef.current) {
      const color = new THREE.Color().setHSL((hashString(it.name) % 360) / 360, 0.6, it.fitted ? 0.55 : 0.3);
      const mat = new THREE.MeshStandardMaterial({ 
        color,
        transparent: !it.fitted,
        opacity: it.fitted ? 1.0 : 0.5
      });
      const geo = new THREE.BoxGeometry(it.length, it.height, it.width);
      const mesh = new THREE.Mesh(geo, mat);
      
      // Three.js Y is up — we place box center at z=height/2 + its z offset
      const x = (it.x ?? 0) + it.length / 2;
      const y = (it.z ?? 0) + it.height / 2; // vertical
      const z = (it.y ?? 0) + it.width / 2;
      mesh.position.set(x, y, z);
      
      // Add wireframe for unfitted items
      if (!it.fitted) {
        const wireframe = new THREE.WireframeGeometry(geo);
        const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        line.position.copy(mesh.position);
        group.add(line);
      }
      
      group.add(mesh);
    }
  }, [container.length, container.width, container.height]);

  // small hash to get consistent color per name
  function hashString(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  }

  // Add items (supports quantity)
  const addItem = () => {
    const length = Number(itemInput.length);
    const width = Number(itemInput.width);
    const height = Number(itemInput.height);
    const weight = Number(itemInput.weight);
    const quantity = Math.max(1, Math.floor(Number(itemInput.quantity) || 1));
    const name = itemInput.name.trim() || "Pallet";

    if (!(length > 0 && width > 0 && height > 0 && weight > 0 && quantity > 0)) return;

    for (let i = 0; i < quantity; i++) {
      itemsRef.current.push({
        id: uid(),
        length: toCm(length, units),
        width: toCm(width, units),
        height: toCm(height, units),
        weight: weightToKg(weight, weightUnits),
        name: quantity > 1 ? `${name} #${i + 1}` : name,
        quantity: 1,
        fitted: false,
        x: 0,
        y: 0,
        z: 0,
      });
    }

    updateStatsAndRender();
  };

  // Clear
  const clearItems = () => {
    itemsRef.current = [];
    updateStatsAndRender();
  };

  // Remove single
  const removeItem = (id: string) => {
    itemsRef.current = itemsRef.current.filter((it) => it.id !== id);
    updateStatsAndRender();
  };

  // Fit algorithm: simple greedy grid + stacking algorithm
  const fitItems = () => {
    // Work on a copy, sort descending by volume
    const sorted = [...itemsRef.current].sort((a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height));

    const cL = Number(container.length);
    const cW = Number(container.width);
    const cH = Number(container.height);

    // reset positions
    for (const it of sorted) {
      it.fitted = false;
      it.x = 0; it.y = 0; it.z = 0;
    }

    const placed: Item[] = [];

    // We place in a layered grid
    for (const item of sorted) {
      let placedFlag = false;
      // iterate over layers (z)
      for (let z = 0; z + item.height <= cH && !placedFlag; z += 20) {
        // iterate over y rows
        for (let y = 0; y + item.width <= cW && !placedFlag; y += 20) {
          for (let x = 0; x + item.length <= cL && !placedFlag; x += 20) {
            // quick overlap check with placed
            const overlap = placed.some(p => boxesOverlap3D(
              x, y, z, item.length, item.width, item.height, 
              p.x!, p.y!, p.z!, p.length, p.width, p.height
            ));
            if (!overlap) {
              // place here
              item.x = x;
              item.y = y;
              item.z = z;
              item.fitted = true;
              placed.push(item);
              placedFlag = true;
            }
          }
        }
      }
    }

    // Apply fitted flags & positions back to itemsRef
    const idToPlaced = new Map(placed.map(p => [p.id, p]));
    itemsRef.current = itemsRef.current.map(it => idToPlaced.get(it.id) ?? ({ ...it, fitted: false }));

    updateStatsAndRender();
  };

  function boxesOverlap3D(x1: number,y1: number,z1: number,l1: number,w1: number,h1: number,x2: number,y2: number,z2: number,l2: number,w2: number,h2: number){
    return !(x1 + l1 <= x2 || x2 + l2 <= x1 || y1 + w1 <= y2 || y2 + w2 <= y1 || z1 + h1 <= z2 || z2 + h2 <= z1);
  }

  // update stats and render visuals
  const updateStatsAndRender = useCallback(() => {
    const total = itemsRef.current.length;
    const fitted = itemsRef.current.filter(i => i.fitted).length;
    const unfitted = total - fitted;
    const totalWeight = itemsRef.current.reduce((s, it) => s + (it.weight || 0), 0);
    const fittedWeight = itemsRef.current.filter(i => i.fitted).reduce((s, it) => s + (it.weight || 0), 0);

    // efficiency by volume
    const cVol = Number(container.length) * Number(container.width) * Number(container.height);
    const usedVol = itemsRef.current.filter(i => i.fitted).reduce((s, it) => s + (it.length * it.width * it.height), 0);
    const eff = cVol > 0 ? Math.round((usedVol / cVol) * 100) : 0;

    setStats({ 
      totalItems: total, 
      fitted, 
      unfitted, 
      efficiency: eff, 
      totalWeight: Math.round(totalWeight*100)/100, 
      fittedWeight: Math.round(fittedWeight*100)/100 
    });

    // rebuild visuals
    rebuildBoxes();
    // force small rerender so UI list updates
    forceRerender(v => v + 1);
  }, [container.length, container.width, container.height, rebuildBoxes]);

  // apply preset
  const applyPreset = (key: string) => {
    const p = containerPresets[key];
    if (!p) return;
    const l = fromCm(p.length, p.units);
    const w = fromCm(p.width, p.units);
    const h = fromCm(p.height, p.units);
    setContainer({ length: String(l), width: String(w), height: String(h) });
  };

  // initial render of boxes when container or items change
  useEffect(() => {
    updateStatsAndRender();
  }, [updateStatsAndRender]);

  // UI JSX
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Cargo Fitter 3D</h2>
        <p className="text-gray-600">Interactive 3D cargo loading optimization with Next.js and Three.js</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Container Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Container Dimensions</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Length</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.length} 
                onChange={e => setContainer({...container, length: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Width</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.width} 
                onChange={e => setContainer({...container, width: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Height</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.height} 
                onChange={e => setContainer({...container, height: e.target.value})} 
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Units</label>
            <select 
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={units} 
              onChange={e => setUnits(e.target.value)}
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
              <option value="in">Inches (in)</option>
              <option value="ft">Feet (ft)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quick Presets</label>
            <select 
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              onChange={e => { if(e.target.value) applyPreset(e.target.value); e.target.value=''; }} 
              defaultValue=""
            >
              <option value="">-- Select Preset --</option>
              <option value="53-truck">53&#39; Truck Trailer</option>
              <option value="48-truck">48&#39; Truck Trailer</option>
              <option value="sprinter">Mercedes Sprinter Van</option>
            </select>
          </div>
        </div>

        {/* Item Input */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Add Cargo Item</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Length</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="L" 
                value={itemInput.length} 
                onChange={e=>setItemInput({...itemInput,length:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Width</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="W" 
                value={itemInput.width} 
                onChange={e=>setItemInput({...itemInput,width:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Height</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="H" 
                value={itemInput.height} 
                onChange={e=>setItemInput({...itemInput,height:e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Weight</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="Weight" 
                value={itemInput.weight} 
                onChange={e=>setItemInput({...itemInput,weight:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Weight Units</label>
              <select 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={weightUnits} 
                onChange={e=>setWeightUnits(e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="g">Grams (g)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="Quantity" 
                value={itemInput.quantity} 
                onChange={e=>setItemInput({...itemInput,quantity:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                placeholder="Item Name" 
                value={itemInput.name} 
                onChange={e=>setItemInput({...itemInput,name:e.target.value})} 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addItem} 
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Add Item
            </button>
            <button 
              onClick={clearItems} 
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={fitItems} 
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Optimize Fit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Loading Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold text-gray-800">{stats.totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">✅ Fitted:</span>
              <span className="font-semibold text-green-600">{stats.fitted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">❌ Unfitted:</span>
              <span className="font-semibold text-red-600">{stats.unfitted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-600">Space Efficiency:</span>
              <span className="font-semibold text-blue-600">{stats.efficiency}%</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-semibold">{(weightFromKg(stats.totalWeight, weightUnits) || 0).toFixed(2)} {weightUnits}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Fitted Weight:</span>
                <span className="font-semibold text-green-600">{(weightFromKg(stats.fittedWeight, weightUnits) || 0).toFixed(2)} {weightUnits}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">3D Cargo Visualization</h4>
            <p className="text-sm text-gray-600">Drag to rotate • Scroll to zoom • Fitted items are solid, unfitted are transparent with red wireframe</p>
          </div>
          <div 
            ref={mountRef} 
            className="w-full" 
            style={{ height: '560px', background: '#f8fafc' }}
          />
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">Items List</h4>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            {itemsRef.current.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items added yet</p>
                <p className="text-sm">Add items to see them here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {itemsRef.current.map(it => (
                  <div key={it.id} className={`p-3 border rounded-md ${it.fitted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{it.name}</div>
                        <div className="text-sm text-gray-600">
                          {fromCm(it.length, units).toFixed(1)} × {fromCm(it.width, units).toFixed(1)} × {fromCm(it.height, units).toFixed(1)} {units}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(weightFromKg(it.weight, weightUnits) || 0).toFixed(2)} {weightUnits}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg">
                          {it.fitted ? '✅' : '❌'}
                        </div>
                        <button 
                          onClick={() => removeItem(it.id)} 
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">How to Use</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">1. Set Container</h5>
            <p>Define your container dimensions or choose from presets like truck trailers and vans. All units are automatically converted internally.</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">2. Add Items</h5>
            <p>Add cargo items with dimensions, weight, and quantity. Items appear in the 3D view and can be individually managed.</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">3. Optimize</h5>
            <p>Click &#34;Optimize Fit&#34; to run the packing algorithm. Fitted items are solid green, unfitted items are red wireframes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}