import { asNumber, decimal, measurement } from './calculator';
import { axisPiece, planLayout, type StartPoint } from './layout';

// Shared with build-time diagrams; the article's actual links are verified against these inputs.
export const startingPointInput = {
  roomWidth: measurement('3200', 'mm'), roomLength: measurement('4100', 'mm'),
  tileWidth: measurement('600', 'mm'), tileLength: measurement('600', 'mm'),
  waste: '10', tilesPerBox: '4', pricePerBox: '',
};
export const startingPointGrout = decimal('2');

export function startingPointSvg(start: StartPoint): string {
  const plan = planLayout(startingPointInput, startingPointGrout, '0', start);
  const width = asNumber(startingPointInput.roomWidth), height = asNumber(startingPointInput.roomLength);
  const name = start === 'corner' ? 'Corner start' : 'Centered start';
  const pieces: string[] = [];
  for (let row = 0; row < plan.y.count; row++) {
    const y = axisPiece(plan.y, row);
    for (let col = 0; col < plan.x.count; col++) {
      const x = axisPiece(plan.x, col), cut = x.cut || y.cut;
      pieces.push(`<rect data-piece="${col},${row}" x="${x.offset}" y="${y.offset}" width="${x.size}" height="${y.size}" fill="${cut ? '#a8d9db' : '#e1e9e7'}" stroke="${cut ? '#087d92' : '#718c96'}" stroke-width="0.65" vector-effect="non-scaling-stroke"${cut ? ' stroke-dasharray="3 2"' : ''}><title>${cut ? 'Cut piece' : 'Full tile'}: ${x.size} × ${y.size} mm</title></rect>`);
    }
  }
  // Geometry is in millimeters, transformed uniformly to preserve room and piece proportions.
  const scale = 0.085, x = 104, y = 80, w = width * scale, h = height * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 565" width="480" height="565" role="img" aria-labelledby="title description">
  <title id="title">${name}: 3200 × 4100 mm room</title>
  <desc id="description">${plan.x.count} columns and ${plan.y.count} rows; ${plan.full} full tiles and ${plan.cut} cut pieces. Left/right edge widths: ${asNumber(plan.x.first)} / ${asNumber(plan.x.last)} mm. Top/bottom edge heights: ${asNumber(plan.y.first)} / ${asNumber(plan.y.last)} mm. Dashed teal pieces need cuts.</desc>
  <rect width="480" height="565" rx="18" fill="#f2f6f8"/>
  <g fill="#112842" font-family="Segoe UI,Arial,sans-serif" text-anchor="middle">
    <text x="240" y="31" font-size="21" font-weight="700">${name}</text>
    <text x="240" y="64" font-size="17">3200 mm wide</text>
    <text x="75" y="255" font-size="17" transform="rotate(-90 75 255)">4100 mm long</text>
  </g>
  <g transform="translate(${x} ${y}) scale(${scale})">${pieces.join('')}</g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#173b4a" stroke-width="1.5"/>
  <g fill="#112842" font-family="Segoe UI,Arial,sans-serif" text-anchor="middle" font-size="17">
    <text x="240" y="457">Left / right: ${asNumber(plan.x.first)} / ${asNumber(plan.x.last)} mm</text>
    <text x="240" y="484">Top / bottom: ${asNumber(plan.y.first)} / ${asNumber(plan.y.last)} mm</text>
    <text x="240" y="515">${plan.full} full tiles · ${plan.cut} cut pieces</text>
    <text x="240" y="543" font-size="14">Teal + dashed = cut · gray + solid = full</text>
  </g>
</svg>`;
}
