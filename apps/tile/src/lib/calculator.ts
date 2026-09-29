/** Exact rational arithmetic keeps unit conversions and purchase rounding separate. */
export type Fraction = { n: bigint; d: bigint };
export type LengthUnit = 'ft' | 'in' | 'm' | 'cm' | 'mm';
export const unitMillimeters: Record<LengthUnit, Fraction> = {
  ft: { n: 1524n, d: 5n }, in: { n: 127n, d: 5n },
  m: { n: 1000n, d: 1n }, cm: { n: 10n, d: 1n }, mm: { n: 1n, d: 1n },
};
export const multiply = (a: Fraction, b: Fraction): Fraction => ({ n: a.n * b.n, d: a.d * b.d });
export const divide = (a: Fraction, b: Fraction): Fraction => ({ n: a.n * b.d, d: a.d * b.n });
export const asNumber = (a: Fraction) => Number(a.n) / Number(a.d);
const ceil = (a: Fraction) => Number((a.n + a.d - 1n) / a.d);

export function decimal(value: string): Fraction {
  if (!/^(?:\d{1,10})(?:\.\d{1,8})?$/.test(value.trim())) {
    throw new Error('Enter a positive number with up to 8 decimal places.');
  }
  const [whole, part = ''] = value.trim().split('.');
  return { n: BigInt(whole + part), d: 10n ** BigInt(part.length) };
}

export function measurement(value: string, unit: LengthUnit): Fraction {
  if (!Object.hasOwn(unitMillimeters, unit)) throw new Error('Choose a supported unit.');
  return multiply(decimal(value), unitMillimeters[unit]);
}

export function displayMeasurement(value: Fraction, unit: LengthUnit): string {
  return asNumber(divide(value, unitMillimeters[unit])).toFixed(8).replace(/\.?0+$/, '');
}

export interface EstimateInput {
  roomWidth: Fraction; roomLength: Fraction; tileWidth: Fraction; tileLength: Fraction;
  waste: string; tilesPerBox: string; pricePerBox: string;
}
export interface Estimate {
  areaMm2: number; tileAreaMm2: number; rawTiles: number; baseTiles: number;
  requiredTiles: number; boxes: number; purchasedTiles: number; extraTiles: number;
  cost: number | null; waste: number; tilesPerBox: number;
}
export function calculate(input: EstimateInput): Estimate {
  for (const [key, value] of Object.entries({ roomWidth: input.roomWidth, roomLength: input.roomLength, tileWidth: input.tileWidth, tileLength: input.tileLength })) {
    const max = key.startsWith('room') ? 1_000_000 : 10_000;
    if (value.d <= 0n || !Number.isFinite(asNumber(value)) || asNumber(value) < 0.1 || asNumber(value) > max) {
      throw new Error(key.startsWith('room') ? 'Room dimensions must be between 0.1 mm and 1,000 m.' : 'Tile dimensions must be between 0.1 mm and 10 m.');
    }
  }
  const waste = decimal(input.waste);
  if (asNumber(waste) > 100) throw new Error('Waste allowance must be between 0% and 100%.');
  const perBox = decimal(input.tilesPerBox);
  if (perBox.n % perBox.d || asNumber(perBox) < 1 || asNumber(perBox) > 10000) throw new Error('Tiles per box must be a whole number from 1 to 10,000.');
  const price = input.pricePerBox.trim() ? decimal(input.pricePerBox) : null;
  if (price && (asNumber(price) > 1_000_000 || price.n * 100n % price.d)) throw new Error('Price must be between $0 and $1,000,000, with up to 2 decimal places.');
  const area = multiply(input.roomWidth, input.roomLength);
  const tileArea = multiply(input.tileWidth, input.tileLength);
  const raw = divide(area, tileArea);
  const withWaste = multiply(raw, { n: 100n * waste.d + waste.n, d: 100n * waste.d });
  if (asNumber(withWaste) > 10_000_000) throw new Error('This estimate exceeds the 10 million tile limit. Check your dimensions and units.');
  const requiredTiles = ceil(withWaste);
  const boxes = Math.ceil(requiredTiles / asNumber(perBox));
  const purchasedTiles = boxes * asNumber(perBox);
  return {
    areaMm2: asNumber(area), tileAreaMm2: asNumber(tileArea), rawTiles: asNumber(raw),
    baseTiles: ceil(raw), requiredTiles, boxes, purchasedTiles,
    extraTiles: purchasedTiles - requiredTiles, cost: price ? boxes * asNumber(price) : null,
    waste: asNumber(waste), tilesPerBox: asNumber(perBox),
  };
}
