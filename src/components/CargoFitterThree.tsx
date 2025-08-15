// src/components/CargoFitterThree.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { twoPassPack, PlacedItem, Container } from "@/lib/packing";

// Types for local UI state
interface CargoItem extends PlacedItem {
  weight: number; // kg
  name: string;
  quantity: number; // always 1 after expansion
}

interface ContainerPreset {
  length: number;
  width: number;
  height: number;
  name: string;
  units: string;
}

interface OrbitControls {
  update: () => void;
  dispose: () => void;
}

interface ContainerDimensions {
  length: string;
  width: string;
  height: string;
}

interface ItemInput {
  length: string;
  width: string;
  height: string;
  weight: string;
  name: string;
  quantity: string;
}

interface LoadingStats {
  totalItems: number;
  fitted: number;
  unfitted: number;
  efficiency: number;
  totalWeight: number;
  fittedWeight: number;
}

interface ConversionFactors { [unit: string]: number; }

const uid = () => `${Date.now()}-${Math.random()}`;

// Unit conversions (dimensions in cm; weight in kg)
const conversionFactors: ConversionFactors = { cm: 1, m: 100, in: 2.54, ft: 30.48 };
const weightConversion: ConversionFactors = { kg: 1, g: 1 / 1000, lb: 0.45359237, oz: 0.0283495231 };

const containerPresets: Record<string, ContainerPreset> = {
  "53-truck": { length: 1600, width: 256, height: 279, name: "53' Truck", units: "cm" },
  "48-truck": { length: 1455, width: 256, height: 279, name: "48' Truck", units: "cm" },
  sprinter:    { length: 360,  width: 170, height: 180, name: "Sprinter Van", units: "cm" },
};

function toCm(value: number, unit: string) { return value * (conversionFactors[unit] ?? 1); }
function fromCm(valueCm: number, unit: string) { return valueCm / (conversionFactors[unit] ?? 1); }
function weightToKg(value: number, unit: string) { return value * (weightConversion[unit] ?? 1); }
function weightFromKg(valueKg: number, unit: string) { return valueKg / (weightConversion[unit] ?? 1); }

export default function CargoFitterThree() {
  // UI state
  const [units, setUnits] = useState<string>("cm");
  const [weightUnits, setWeightUnits] = useState<string>("kg");

  const [container, setContainer] = useState<ContainerDimensions>({
    length: "1200", width: "240", height: "200",
  });

  const [itemInput, setItemInput] = useState<ItemInput>({
    length: "120", width: "100", height: "140", weight: "300", name: "Pallet", quantity: "1",
  });

  // Items kept in a ref so three.js can mutate without re-renders
  const itemsRef = useRef<CargoItem[]>([]);
  const [, forceRerender] = useState<number>(0);

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);

  // Stats
  const [stats, setStats] = useState<LoadingStats>({
    totalItems: 0, fitted: 0, unfitted: 0, efficiency: 0, totalWeight: 0, fittedWeight: 0,
  });

  // Helper to get container in cm (internal canonical)
  const getContainerCm = useCallback((): Container => {
    const cL = toCm(Number(container.length || 0), units);
    const cW = toCm(Number(container.width || 0), units);
    const cH = toCm(Number(container.height || 0), units);
    return { length: cL, width: cW, height: cH };
  }, [container.length, container.width, container.height, units]);

  const hashString = (s: string): number => { 
    let h = 0; 
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); 
    return Math.abs(h); 
  };

  // Visual rebuild from itemsRef
  const rebuildBoxes = useCallback(() => {
    if (!boxesGroupRef.current) return;
    const group = boxesGroupRef.current;
    while (group.children.length) group.remove(group.children[0]);

    const { length: cL, width: cW, height: cH } = getContainerCm();

    // container base plane
    const containerGeo = new THREE.BoxGeometry(cL, 2, cW);
    const containerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    const containerMesh = new THREE.Mesh(containerGeo, containerMat);
    containerMesh.position.set(cL / 2, -1, cW / 2);
    group.add(containerMesh);

    // walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, transparent: true, opacity: 0.1, side: THREE.DoubleSide });

    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(cL, cH), wallMaterial);
    backMesh.position.set(cL/2, cH/2, 0); group.add(backMesh);

    const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(cW, cH), wallMaterial);
    leftMesh.rotation.y = Math.PI / 2; leftMesh.position.set(0, cH/2, cW/2); group.add(leftMesh);

    const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(cW, cH), wallMaterial);
    rightMesh.rotation.y = -Math.PI / 2; rightMesh.position.set(cL, cH/2, cW/2); group.add(rightMesh);

    // lay unfitted "outside" to the right
    let outsideOffsetX = 50; // start 50 cm to the right of container
    const outsideGap = 20;

    for (const item of itemsRef.current) {
      const color = new THREE.Color().setHSL((hashString(item.name) % 360) / 360, 0.6, item.fitted ? 0.55 : 0.3);
      const mat = new THREE.MeshStandardMaterial({ color, transparent: !item.fitted, opacity: item.fitted ? 1.0 : 0.5 });
      const geo = new THREE.BoxGeometry(item.length, item.height, item.width);
      const mesh = new THREE.Mesh(geo, mat);

      // drawing coordinates (store uses x,y,z with z vertical)
      let dx = item.x, dy = item.y, dz = item.z;

      if (!item.fitted) {
        // place outside: after container along +X
        dx = cL + outsideOffsetX;
        dy = 0;
        dz = 0;
        outsideOffsetX += item.length + outsideGap;

        const wireframe = new THREE.LineSegments(
          new THREE.WireframeGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0xff0000 })
        );
        wireframe.position.set(dx + item.length/2, dz + item.height/2, dy + item.width/2);
        group.add(wireframe);
      }

      mesh.position.set(dx + item.length/2, dz + item.height/2, dy + item.width/2);
      group.add(mesh);
    }
  }, [getContainerCm]);

  // Recompute stats + rebuild visuals
  const updateStatsAndRender = useCallback((): void => {
    const totals = itemsRef.current;
    const fittedItems = totals.filter(i => i.fitted);
    const unfittedCount = totals.length - fittedItems.length;

    const totalWeight = totals.reduce((s, i) => s + i.weight, 0);
    const fittedWeight = fittedItems.reduce((s, i) => s + i.weight, 0);

    const { length: cL, width: cW, height: cH } = getContainerCm();
    const containerVolume = cL * cW * cH;
    const usedVolume = fittedItems.reduce((s, i) => s + i.length * i.width * i.height, 0);
    const efficiency = containerVolume > 0 ? Math.round((usedVolume / containerVolume) * 100) : 0;

    setStats({
      totalItems: totals.length,
      fitted: fittedItems.length,
      unfitted: unfittedCount,
      efficiency,
      totalWeight: Math.round(totalWeight * 100) / 100,
      fittedWeight: Math.round(fittedWeight * 100) / 100,
    });

    rebuildBoxes();
    forceRerender(v => v + 1);
  }, [getContainerCm, rebuildBoxes]);

  // Simple custom orbit controls - now using useCallback to prevent re-creation
  const setupOrbitControls = useCallback((camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): OrbitControls => {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetX = 600, targetY = 400, targetZ = 800;
    let currentX = targetX, currentY = targetY, currentZ = targetZ;

    const onMouseDown = (e: MouseEvent) => { 
      isMouseDown = true; 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
      renderer.domElement.style.cursor = "grabbing"; 
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mouseX; 
      const dy = e.clientY - mouseY;
      targetX = Math.max(200, Math.min(1500, targetX - dx * 1));
      targetY = Math.max(100, Math.min(800,  targetY + dy * 1));
      mouseX = e.clientX; 
      mouseY = e.clientY;
    };
    
    const onMouseUp = () => { 
      isMouseDown = false; 
      renderer.domElement.style.cursor = "grab"; 
    };
    
    const onWheel = (e: WheelEvent) => { 
      targetZ = Math.max(300, Math.min(2000, targetZ + e.deltaY * 0.5)); 
      e.preventDefault(); 
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    return {
      update: () => {
        const { length: cL, width: cW } = getContainerCm();
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentZ += (targetZ - currentZ) * 0.08;
        camera.position.set(currentX, currentY, currentZ);
        camera.lookAt(cL / 2, 0, cW / 2);
      },
      dispose: () => {
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        renderer.domElement.removeEventListener("mousemove", onMouseMove);
        renderer.domElement.removeEventListener("mouseup", onMouseUp);
        renderer.domElement.removeEventListener("mouseleave", onMouseUp);
        renderer.domElement.removeEventListener("wheel", onWheel);
        renderer.domElement.style.cursor = "default";
      }
    };
  }, [getContainerCm]);

  // Init Three.js - now properly depends on setupOrbitControls
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;
    const width = 800, height = 560;

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

    const boxesGroup = new THREE.Group(); 
    scene.add(boxesGroup);

    const controls = setupOrbitControls(camera, renderer);
    currentMount.appendChild(renderer.domElement);

    sceneRef.current = scene; 
    rendererRef.current = renderer; 
    cameraRef.current = camera;
    controlsRef.current = controls; 
    boxesGroupRef.current = boxesGroup;

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
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      sceneRef.current = null; 
      rendererRef.current = null; 
      cameraRef.current = null; 
      controlsRef.current = null;
    };
  }, [setupOrbitControls]); // Now properly includes setupOrbitControls in dependencies

  // Add items (expands quantity)
  const addItem = useCallback((): void => {
    const l = Number(itemInput.length), w = Number(itemInput.width), h = Number(itemInput.height);
    const wt = Number(itemInput.weight);
    const qty = Math.max(1, Math.floor(Number(itemInput.quantity) || 1));
    const nm = itemInput.name.trim() || "Item";

    if (!(l > 0 && w > 0 && h > 0 && wt > 0 && qty > 0)) return;

    const lcm = toCm(l, units), wcm = toCm(w, units), hcm = toCm(h, units), kg = weightToKg(wt, weightUnits);

    const newItems: CargoItem[] = Array.from({ length: qty }, (_, i) => ({
      id: uid(),
      name: qty > 1 ? `${nm} #${i + 1}` : nm,
      length: lcm, width: wcm, height: hcm,
      x: 0, y: 0, z: 0, fitted: false,
      weight: kg, quantity: 1,
    }));

    itemsRef.current.push(...newItems);
    updateStatsAndRender();
  }, [itemInput, units, weightUnits, updateStatsAndRender]);

  const clearItems = useCallback(() => { 
    itemsRef.current = []; 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

  const removeItem = useCallback((id: string) => { 
    itemsRef.current = itemsRef.current.filter(i => i.id !== id); 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

  // NEW: Stacking-aware two-pass optimizer using the pure function
  const fitItems = useCallback((): void => {
    const { length: cL, width: cW, height: cH } = getContainerCm();
    if (cL <= 0 || cW <= 0 || cH <= 0) {
      alert("Please enter valid container dimensions");
      return;
    }

    const placed = twoPassPack(
      { length: cL, width: cW, height: cH },
      itemsRef.current.map<CargoItem>(i => ({ ...i }))
    );

    // commit results (positions, fitted) back to itemsRef
    const placedById = new Map(placed.map(p => [p.id, p]));
    itemsRef.current = itemsRef.current.map(i => {
      const p = placedById.get(i.id);
      return p ? { ...i, x: p.x, y: p.y, z: p.z, length: p.length, width: p.width, height: p.height, fitted: p.fitted } : i;
    });

    updateStatsAndRender();
  }, [getContainerCm, updateStatsAndRender]);

  // Apply preset
  const applyPreset = useCallback((key: string) => {
    const preset = containerPresets[key]; 
    if (!preset) return;
    setContainer({
      length: String(fromCm(preset.length, preset.units)),
      width:  String(fromCm(preset.width,  preset.units)),
      height: String(fromCm(preset.height, preset.units)),
    });
  }, []);

  // Initial draw & when deps change
  useEffect(() => { 
    updateStatsAndRender(); 
  }, [updateStatsAndRender]);

  // JSX (unchanged UI, trimmed for brevity)
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* header */}
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Length ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.length} onChange={e => setContainer({ ...container, length: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Width ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.width} onChange={e => setContainer({ ...container, width: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Height ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={container.height} onChange={e => setContainer({ ...container, height: e.target.value })} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Units</label>
            <select className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={units} onChange={e => setUnits(e.target.value)}>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
              <option value="in">Inches (in)</option>
              <option value="ft">Feet (ft)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quick Presets</label>
            <select className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              onChange={(e) => { if (e.target.value) { applyPreset(e.target.value); e.target.value = ""; } }} defaultValue="">
              <option value="">-- Select Preset --</option>
              <option value="53-truck">53&apos; Truck Trailer</option>
              <option value="48-truck">48&apos; Truck Trailer</option>
              <option value="sprinter">Mercedes Sprinter Van</option>
            </select>
          </div>
        </div>

        {/* Item Input */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Add Cargo Item</h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Length ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.length} onChange={e => setItemInput({ ...itemInput, length: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Width ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.width} onChange={e => setItemInput({ ...itemInput, width: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Height ({units})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.height} onChange={e => setItemInput({ ...itemInput, height: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Weight ({weightUnits})</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.weight} onChange={e => setItemInput({ ...itemInput, weight: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Weight Units</label>
              <select className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={weightUnits} onChange={e => setWeightUnits(e.target.value)}>
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
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.quantity} onChange={e => setItemInput({ ...itemInput, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={itemInput.name} onChange={e => setItemInput({ ...itemInput, name: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">Add Item</button>
            <button onClick={clearItems} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">Clear All</button>
            <button onClick={fitItems} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Optimize Fit</button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Loading Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-gray-600">Total Items:</span><span className="font-semibold text-gray-800">{stats.totalItems}</span></div>
            <div className="flex justify-between items-center"><span className="text-green-600">✅ Fitted:</span><span className="font-semibold text-green-600">{stats.fitted}</span></div>
            <div className="flex justify-between items-center"><span className="text-red-600">❌ Unfitted:</span><span className="font-semibold text-red-600">{stats.unfitted}</span></div>
            <div className="flex justify-between items-center"><span className="text-blue-600">Space Efficiency:</span><span className="font-semibold text-blue-600">{stats.efficiency}%</span></div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center"><span className="text-gray-600">Total Weight:</span>
                <span className="font-semibold">{(weightFromKg(stats.totalWeight, weightUnits) || 0).toFixed(2)} {weightUnits}</span></div>
              <div className="flex justify-between items-center mt-1"><span className="text-gray-600">Fitted Weight:</span>
                <span className="font-semibold text-green-600">{(weightFromKg(stats.fittedWeight, weightUnits) || 0).toFixed(2)} {weightUnits}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">3D Cargo Visualization</h4>
            <p className="text-sm text-gray-600"><span className="font-medium">Controls:</span> Drag to rotate • Scroll to zoom • <span className="text-green-600">Green = Fitted</span> • <span className="text-red-600">Red wireframe = Unfitted</span></p>
          </div>
          <div ref={mountRef} className="w-full" style={{ height: "560px", background: "#f8fafc" }} />
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b"><h4 className="text-lg font-semibold text-gray-800">Items List</h4></div>
          <div className="max-h-96 overflow-y-auto p-4">
            {itemsRef.current.length === 0 ? (
              <div className="text-center py-8 text-gray-500"><p>No items added yet</p><p className="text-sm">Add items to see them here</p></div>
            ) : (
              <div className="space-y-2">
                {itemsRef.current.map(item => (
                  <div key={item.id} className={`p-3 border rounded-md ${item.fitted ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {fromCm(item.length, units).toFixed(1)} × {fromCm(item.width, units).toFixed(1)} × {fromCm(item.height, units).toFixed(1)} {units}
                        </div>
                        <div className="text-sm text-gray-600">{(weightFromKg(item.weight, weightUnits) || 0).toFixed(2)} {weightUnits}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg">{item.fitted ? "✅" : "❌"}</div>
                        <button onClick={() => removeItem(item.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Remove</button>
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
          <div><h5 className="font-semibold text-gray-800 mb-2">1. Set Container</h5><p>Define your container dimensions or choose a preset. All units are converted to centimeters internally.</p></div>
          <div><h5 className="font-semibold text-gray-800 mb-2">2. Add Items</h5><p>Add items with dimensions, weight, and quantity. Items appear in the 3D view and are color coded.</p></div>
          <div><h5 className="font-semibold text-gray-800 mb-2">3. Optimize</h5><p>Click &quot;Optimize Fit&quot; to run the packing algorithm. Fitted items are solid green; unfitted are red wireframes placed outside.</p></div>
        </div>
      </div>
    </div>
  );
}