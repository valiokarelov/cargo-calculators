import { twoPassPack, Container, PlacedItem } from "./packing";

const mk = (n: number, l: number, w: number, h: number): PlacedItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `i${i}`, length: l, width: w, height: h, x: 0, y: 0, z: 0, fitted: false }));

test("6 × 48×40×56 fit in 124×96×96 (3×2 floor)", () => {
  const c: Container = { length: 124, width: 96, height: 96 };
  const placed = twoPassPack(c, mk(6, 48, 40, 56));
  expect(placed.filter(p => p.fitted)).toHaveLength(6);
});

test("6 tall + 3 short (48×40×20) all fit via stacking", () => {
  const c: Container = { length: 124, width: 96, height: 96 };
  const placed = twoPassPack(c, [...mk(6, 48, 40, 56), ...mk(3, 48, 40, 20)]);
  expect(placed.filter(p => p.fitted)).toHaveLength(9);
});

test("overflow tall: cap is 6 on the floor", () => {
  const c: Container = { length: 124, width: 96, height: 96 };
  const placed = twoPassPack(c, mk(14, 48, 40, 56));
  expect(placed.filter(p => p.fitted)).toHaveLength(6);
});

test("height too low prevents fit", () => {
  const c: Container = { length: 120, width: 80, height: 59 };
  const placed = twoPassPack(c, mk(4, 60, 40, 60));
  expect(placed.filter(p => p.fitted)).toHaveLength(0);
});

test("exact fill: 4 × 60×40×60 in 120×80×60", () => {
  const c: Container = { length: 120, width: 80, height: 60 };
  const placed = twoPassPack(c, mk(4, 60, 40, 60));
  expect(placed.filter(p => p.fitted)).toHaveLength(4);
});
