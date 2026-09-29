import { displayMeasurement, measurement, unitMillimeters, type Fraction, type LengthUnit } from './calculator';
export const dimensionKeys = ['roomWidth','roomLength','tileWidth','tileLength'] as const;
export type DimensionKey = typeof dimensionKeys[number];
// Bounded exact values prevent a rounded unit display from altering a return trip.
export function readQueryDimension(params: URLSearchParams, key: DimensionKey, value: string, unit: LengthUnit): Fraction {
  const fallback = measurement(value,unit);
  const encoded = params.get(`${key}Exact`);
  if(!encoded || !/^\d{1,40}\/\d{1,40}$/.test(encoded)) return fallback;
  const [n,d] = encoded.split('/').map(BigInt);
  if(d === 0n) return fallback;
  const exact = {n,d};
  return displayMeasurement(exact,unit) === value ? exact : fallback;
}
export function projectUrl(path: string, dimensions: Record<DimensionKey,Fraction>, units: Record<DimensionKey,LengthUnit>, values: Record<string,string>) {
  const params = new URLSearchParams(values);
  for(const key of dimensionKeys) {
    const unit = Object.hasOwn(unitMillimeters,units[key]) ? units[key] : 'mm';
    params.set(key,displayMeasurement(dimensions[key],unit)); params.set(`${key}Unit`,unit);
    params.set(`${key}Exact`,`${dimensions[key].n}/${dimensions[key].d}`);
  }
  return `${path}?${params}`;
}
