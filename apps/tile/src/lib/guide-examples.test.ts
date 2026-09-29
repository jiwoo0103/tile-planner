import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { calculate, measurement, type LengthUnit } from './calculator';

it('reproduces the measuring guide purchase quantities from its actual calculator link', () => {
  const guide = readFileSync(new URL('../content/guides/how-to-measure-a-room-for-tile.md', import.meta.url), 'utf8');
  const link = guide.match(/\]\((\/calculator\/\?[^)]+)\)/)?.[1];
  expect(link).toBeDefined();
  const params = new URL(link!, 'https://test.invalid').searchParams;
  const dimension = (name: string) => measurement(params.get(name)!, params.get(`${name}Unit`)! as LengthUnit);
  expect(calculate({
    roomWidth: dimension('roomWidth'), roomLength: dimension('roomLength'),
    tileWidth: dimension('tileWidth'), tileLength: dimension('tileLength'),
    waste: params.get('waste')!, tilesPerBox: params.get('tilesPerBox')!, pricePerBox: params.get('pricePerBox') ?? '',
  })).toMatchObject({ baseTiles: 120, requiredTiles: 132, boxes: 14, purchasedTiles: 140, extraTiles: 8, cost: null });
});

it('reproduces every waste guide comparison row from its actual calculator link', () => {
  const guide = readFileSync(new URL('../content/guides/tile-waste-allowance.md', import.meta.url), 'utf8');
  const rows = [...guide.matchAll(/\| \[(\d+)%\]\((\/calculator\/\?[^)]+)\) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|/g)];
  expect(rows.map(row => Number(row[1]))).toEqual([0, 5, 10, 15, 20]);
  for (const [, allowance, link, required, boxes, purchased, extras] of rows) {
    const params = new URL(link, 'https://test.invalid').searchParams;
    const dimension = (name: string) => measurement(params.get(name)!, params.get(`${name}Unit`)! as LengthUnit);
    expect(params.get('waste')).toBe(allowance);
    const result = calculate({
      roomWidth: dimension('roomWidth'), roomLength: dimension('roomLength'),
      tileWidth: dimension('tileWidth'), tileLength: dimension('tileLength'),
      waste: params.get('waste')!, tilesPerBox: params.get('tilesPerBox')!, pricePerBox: params.get('pricePerBox') ?? '',
    });
    expect(result).toMatchObject({
      rawTiles: 120, baseTiles: 120, requiredTiles: Number(required), boxes: Number(boxes),
      purchasedTiles: Number(purchased), extraTiles: Number(extras), cost: null,
    });
  }
});

it('reproduces the box purchase guide inputs, result table and hypothetical budget from its actual link', () => {
  const guide = readFileSync(new URL('../content/guides/tile-box-purchase-example.md', import.meta.url), 'utf8');
  const link = guide.match(/\]\((\/calculator\/\?[^)]+)\)/)?.[1];
  expect(link).toBeDefined();
  const params = new URL(link!, 'https://test.invalid').searchParams;
  expect(Object.fromEntries(params)).toEqual({
    roomWidth: '3.5', roomWidthUnit: 'm', roomLength: '4.2', roomLengthUnit: 'm',
    tileWidth: '60', tileWidthUnit: 'cm', tileLength: '60', tileLengthUnit: 'cm',
    waste: '10', tilesPerBox: '4', pricePerBox: '32.50',
  });
  const dimension = (name: string) => measurement(params.get(name)!, params.get(`${name}Unit`)! as LengthUnit);
  const result = calculate({
    roomWidth: dimension('roomWidth'), roomLength: dimension('roomLength'),
    tileWidth: dimension('tileWidth'), tileLength: dimension('tileLength'),
    waste: params.get('waste')!, tilesPerBox: params.get('tilesPerBox')!, pricePerBox: params.get('pricePerBox')!,
  });
  expect(result).toMatchObject({
    areaMm2: 14_700_000, tileAreaMm2: 360_000, baseTiles: 41, requiredTiles: 45,
    boxes: 12, purchasedTiles: 48, extraTiles: 3, cost: 390,
  });
  expect(result.rawTiles).toBeCloseTo(40.8333333333);
  expect(Math.ceil(result.baseTiles * 1.10)).toBe(46);
  expect(result.purchasedTiles - result.baseTiles).toBe(7);
  const rows = Object.fromEntries([...guide.matchAll(/^\| ([^|]+) \| ([^|]+) \|$/gm)].map(([, key, value]) => [key, value]));
  expect(rows).toMatchObject({
    'Floor area': `${result.areaMm2 / 1_000_000} m²`,
    'Base tiles': `${result.baseTiles} tiles`, 'Required tiles': `${result.requiredTiles} tiles`,
    'Full boxes': `${result.boxes} boxes`, 'Purchased tiles': `${result.purchasedTiles} tiles`,
    'Box surplus': `${result.extraTiles} tiles`, 'Tile subtotal': `$${result.cost!.toFixed(2)} USD`,
  });
});
