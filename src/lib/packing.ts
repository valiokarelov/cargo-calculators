export interface Item {
  id: string;
  length: number; // same unit as container (we'll pass cm)
  width: number;
  height: number;
}

export interface PlacedItem extends Item {
  x: number; // along container length
  y: number; // along container width
  z: number; // vertical
  fitted: boolean;
}

export interface Container {
  length: number;
  width: number;
  height: number;
}

/**
 * Two-pass stacking-aware packer:
 * Pass 1: lay a tight floor grid with tallest items (yaw rotation allowed).
 * Pass 2: stack remaining items cell-by-cell up to container height.
 * Keeps height upright (no roll/pitch).
 */
export function twoPassPack(container: Container, itemsIn: PlacedItem[]): PlacedItem[] {
  const cL = container.length, cW = container.width, cH = container.height;
  const items = itemsIn.map(i => ({ ...i, fitted: false, x: 0, y: 0, z: 0 }));
  if (cL <= 0 || cW <= 0 || cH <= 0 || items.length === 0) return items;

  type Cell = { x: number; y: number; l: number; w: number; usedH: number };

  const tallestH = Math.max(...items.map(i => i.height));
  const tall = items.filter(i => i.height === tallestH);
  const baseSample = tall[0] ?? items.slice().sort((a, b) => b.height - a.height)[0];

  const baseOrients = [
    { l: baseSample.length, w: baseSample.width },
    { l: baseSample.width,  w: baseSample.length }
  ];

  let best = { cap: -1, nL: 0, nW: 0, orient: baseOrients[0] };
  for (const o of baseOrients) {
    const nL = Math.floor(cL / o.l);
    const nW = Math.floor(cW / o.w);
    const cap = nL * nW;
    if (cap > best.cap) best = { cap, nL, nW, orient: o };
  }

  const cells: Cell[] = [];
  for (let yI = 0; yI < best.nW; yI++) {
    for (let xI = 0; xI < best.nL; xI++) {
      cells.push({ x: xI * best.orient.l, y: yI * best.orient.w, l: best.orient.l, w: best.orient.w, usedH: 0 });
    }
  }

  const tryPlaceInCell = (it: PlacedItem, cell: Cell): boolean => {
    if (cell.usedH + it.height > cH) return false;
    // as-is
    if (it.length <= cell.l && it.width <= cell.w) {
      it.x = cell.x; it.y = cell.y; it.z = cell.usedH; it.fitted = true; cell.usedH += it.height;
      return true;
    }
    // yaw (swap L/W)
    if (it.width <= cell.l && it.length <= cell.w) {
      const tmp = it.length; it.length = it.width; it.width = tmp;
      it.x = cell.x; it.y = cell.y; it.z = cell.usedH; it.fitted = true; cell.usedH += it.height;
      return true;
    }
    return false;
  };

  // Pass 1: tallest items on floor only
  const tallestByVol = tall.slice().sort((a, b) => (b.length * b.width) - (a.length * a.width));
  for (const it of tallestByVol) {
    let placed = false;
    for (const cell of cells) {
      if (cell.usedH > 0) continue; // floor only
      if (tryPlaceInCell(it, cell)) { placed = true; break; }
    }
    if (!placed && cells.every(c => c.usedH > 0)) break;
  }

  // Pass 2: stack remaining by height desc, then footprint desc
  const remaining = items
    .filter(i => !i.fitted)
    .sort((a, b) => b.height - a.height || (b.length * b.width) - (a.length * a.width));

  for (const it of remaining) {
    for (const cell of cells) {
      if (tryPlaceInCell(it, cell)) { break; }
    }
  }

  return items;
}
