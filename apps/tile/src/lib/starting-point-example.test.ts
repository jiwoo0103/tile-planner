import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { asNumber, decimal, measurement, type LengthUnit } from './calculator';
import { axisPiece, planLayout, type StartPoint } from './layout';
import { startingPointSvg } from './starting-point-example';

it('reproduces both article URLs, its comparison table and every diagram rectangle with the live engine', () => {
  const guide = readFileSync(new URL('../content/guides/tile-layout-starting-point.md', import.meta.url), 'utf8');
  const links = [...guide.matchAll(/\]\((\/layout\/\?[^)]+)\)/g)].map(match => match[1]);
  expect(links).toHaveLength(2);
  const diagrams = [...guide.matchAll(/src="\/diagrams\/starting-point\/(corner|center)\.svg"/g)].map(match => match[1]);
  expect(diagrams).toEqual(['corner', 'center']);
  const rows = Object.fromEntries([...guide.matchAll(/^\| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)].map(([, label, corner, center]) => [label, [corner, center]]));

  links.forEach((link, index) => {
    const params = new URL(link, 'https://test.invalid').searchParams;
    const start = diagrams[index] as StartPoint;
    expect(Object.fromEntries(params)).toEqual({
      roomWidth: '3200', roomWidthUnit: 'mm', roomLength: '4100', roomLengthUnit: 'mm',
      tileWidth: '600', tileWidthUnit: 'mm', tileLength: '600', tileLengthUnit: 'mm',
      grout: '2', orientation: '0', start, waste: '10', tilesPerBox: '4',
    });
    const dimension = (name: string) => measurement(params.get(name)!, params.get(`${name}Unit`)! as LengthUnit);
    const plan = planLayout({
      roomWidth: dimension('roomWidth'), roomLength: dimension('roomLength'),
      tileWidth: dimension('tileWidth'), tileLength: dimension('tileLength'),
      waste: params.get('waste')!, tilesPerBox: params.get('tilesPerBox')!, pricePerBox: '',
    }, decimal(params.get('grout')!), params.get('orientation') as '0', start);
    expect([asNumber(plan.x.first), asNumber(plan.x.last), asNumber(plan.y.first), asNumber(plan.y.last)])
      .toEqual(start === 'corner' ? [600, 190, 600, 488] : [395, 395, 544, 544]);
    expect([plan.x.count, plan.y.count, plan.total, plan.full, plan.cut])
      .toEqual(start === 'corner' ? [6, 7, 42, 30, 12] : [6, 7, 42, 20, 22]);
    for (const [label, value] of Object.entries({
      'Left edge': `${asNumber(plan.x.first)} mm`, 'Right edge': `${asNumber(plan.x.last)} mm`,
      'Top edge': `${asNumber(plan.y.first)} mm`, 'Bottom edge': `${asNumber(plan.y.last)} mm`,
      Columns: `${plan.x.count}`, Rows: `${plan.y.count}`, 'Full tiles': `${plan.full}`,
      'Cut pieces': `${plan.cut}`, 'Total placed pieces': `${plan.total}`,
    })) expect(rows[label]?.[index]).toBe(value);

    const svg = startingPointSvg(start);
    const rectangles = [...svg.matchAll(/<rect data-piece="(\d+),(\d+)" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"[^>]*>/g)];
    expect(rectangles).toHaveLength(plan.total);
    for (const [rect, col, row, x, y, width, height] of rectangles) {
      const px = axisPiece(plan.x, Number(col)), py = axisPiece(plan.y, Number(row));
      expect([+x, +y, +width, +height]).toEqual([px.offset, py.offset, px.size, py.size]);
      expect(rect.includes('stroke-dasharray')).toBe(px.cut || py.cut);
    }
    expect(svg).toContain('scale(0.085)');
    expect(svg).toContain(`Left / right: ${asNumber(plan.x.first)} / ${asNumber(plan.x.last)} mm`);
    expect(svg).toContain(`Top / bottom: ${asNumber(plan.y.first)} / ${asNumber(plan.y.last)} mm`);
    expect(svg).toContain(`${plan.full} full tiles · ${plan.cut} cut pieces`);
    expect(plan.limited).toBe(false);
  });
});
