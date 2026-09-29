import { calculate, decimal, displayMeasurement, measurement, unitMillimeters, type Fraction, type LengthUnit } from '../lib/calculator';
import { projectUrl, readQueryDimension } from '../lib/project-url';

const form = document.querySelector<HTMLFormElement>('#calculator-form')!;
const dimensionKeys = ['roomWidth', 'roomLength', 'tileWidth', 'tileLength'] as const;
type DimensionKey = typeof dimensionKeys[number];
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
const unit = (key: string) => document.getElementById(`${key}-unit`) as HTMLSelectElement;
const text = (id: string, value: string) => { document.getElementById(id)!.textContent = value; };
const dimensions = {} as Record<DimensionKey, Fraction | null>;
const format = (value: number, digits = 0) => value > 0 && value < 10 ** -digits ? value.toExponential(2) : new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
let areaUnit: 'us' | 'metric' = 'us';
let showErrors = false;

function readDimension(key: DimensionKey) {
  try { dimensions[key] = measurement(input(key).value, unit(key).value as LengthUnit); }
  catch { dimensions[key] = null; }
}
function fieldError(key: string, message: string | null) {
  input(key).setAttribute('aria-invalid', message ? 'true' : 'false');
  const element = document.getElementById(`${key}-error`)!;
  element.hidden = !message || !showErrors;
  element.textContent = message || '';
}
function clearResults(message: string) {
  const link = document.getElementById('open-layout')!;
  link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true');
  for (const key of ['area','base','required','boxes','purchased','cost']) {
    text(`result-${key}`, '—'); text(`unit-${key}`, ''); text(`note-${key}`, '');
  }
  text('box-surplus', ''); text('result-status', message);
}
function update(): boolean {
  const missing: string[] = [];
  for (const key of dimensionKeys) {
    const error = !dimensions[key] ? 'Enter a valid dimension.' : null;
    fieldError(key, error); if (error) missing.push(key);
  }
  for (const key of ['waste', 'tilesPerBox', 'pricePerBox']) {
    let error: string | null = null;
    try { if (key !== 'pricePerBox' || input(key).value.trim()) decimal(input(key).value); }
    catch { error = 'Enter a valid number.'; }
    fieldError(key, error); if (error) missing.push(key);
  }
  const errorElement = document.getElementById('form-error')!;
  errorElement.hidden = true;
  if (missing.length) {
    clearResults('Complete the highlighted inputs to see your estimate.');
    if (showErrors) { errorElement.textContent = 'Check the fields marked below. All measurements, allowance and tiles per box are required.'; errorElement.hidden = false; }
    return false;
  }
  try {
    const result = calculate({
      roomWidth: dimensions.roomWidth!, roomLength: dimensions.roomLength!,
      tileWidth: dimensions.tileWidth!, tileLength: dimensions.tileLength!,
      waste: input('waste').value, tilesPerBox: input('tilesPerBox').value, pricePerBox: input('pricePerBox').value,
    });
    const fields = {
      area: [format(result.areaMm2 / (areaUnit === 'us' ? 92903.04 : 1_000_000), 4), areaUnit === 'us' ? 'sq ft' : 'm²', 'Total floor area'],
      base: [format(result.baseTiles), 'tiles', 'Before waste allowance'],
      required: [format(result.requiredTiles), 'tiles', `Including ${format(result.waste, 8)}% allowance`],
      boxes: [format(result.boxes), 'boxes', 'Rounded up to full boxes'],
      purchased: [format(result.purchasedTiles), 'tiles', `${format(result.boxes)} boxes × ${format(result.tilesPerBox)} tiles`],
      cost: [result.cost === null ? '—' : new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(result.cost), '', result.cost === null ? 'Add a price per box' : 'Tile materials only · USD'],
    };
    for (const [key, [value, suffix, note]] of Object.entries(fields)) {
      text(`result-${key}`, value); text(`unit-${key}`, suffix); text(`note-${key}`, note);
    }
    text('box-surplus', `${format(result.extraTiles)} extra ${result.extraTiles === 1 ? 'tile' : 'tiles'} from rounding up to full boxes.`);
    text('result-status', 'Up to date with your measurements.');
    const link = document.getElementById('open-layout') as HTMLAnchorElement;
    const options = new URLSearchParams(location.search);
    link.href = projectUrl('/layout/', dimensions as Record<DimensionKey, Fraction>, Object.fromEntries(dimensionKeys.map(key => [key, unit(key).value])) as Record<DimensionKey, LengthUnit>, {
      waste: input('waste').value, tilesPerBox: input('tilesPerBox').value, pricePerBox: input('pricePerBox').value,
      grout: options.get('grout') || '2', orientation: options.get('orientation') === '90' ? '90' : '0', start: options.get('start') === 'center' ? 'center' : 'corner',
    });
    link.removeAttribute('aria-disabled');
    return true;
  } catch (error) {
    clearResults('Check your inputs to calculate a new estimate.');
    errorElement.textContent = error instanceof Error ? error.message : 'Please check your inputs.';
    errorElement.hidden = false;
    return false;
  }
}

function setSystem(system: 'us' | 'metric') {
  areaUnit = system;
  for (const key of dimensionKeys) {
    const target = system === 'us' ? (key.startsWith('room') ? 'ft' : 'in') : (key.startsWith('room') ? 'm' : 'cm');
    unit(key).value = target;
    if (dimensions[key]) input(key).value = displayMeasurement(dimensions[key]!, target);
  }
  document.querySelectorAll<HTMLButtonElement>('[data-system]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.system === system)));
  update();
}
for (const key of dimensionKeys) {
  readDimension(key);
  input(key).addEventListener('input', () => { readDimension(key); showErrors = true; update(); });
  unit(key).addEventListener('change', () => {
    if (dimensions[key]) input(key).value = displayMeasurement(dimensions[key]!, unit(key).value as LengthUnit);
    areaUnit = ['ft','in'].includes(unit('roomWidth').value) ? 'us' : 'metric';
    document.querySelectorAll<HTMLButtonElement>('[data-system]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    update();
  });
}
for (const key of ['waste', 'tilesPerBox', 'pricePerBox']) input(key).addEventListener('input', () => { showErrors = true; update(); });
document.querySelectorAll<HTMLButtonElement>('[data-system]').forEach(button => button.addEventListener('click', () => setSystem(button.dataset.system as 'us' | 'metric')));
form.addEventListener('submit', event => {
  event.preventDefault(); showErrors = true;
  if (update()) document.getElementById('estimate-results')!.focus({preventScroll: false});
  else { const first = form.querySelector<HTMLInputElement>('[aria-invalid="true"]'); (first || document.getElementById('form-error'))?.focus(); }
});
function reset(examplePrice = '') {
  for (const [index, key] of dimensionKeys.entries()) { input(key).value = index === 0 ? '10' : '12'; unit(key).value = index < 2 ? 'ft' : 'in'; readDimension(key); }
  input('waste').value = '10'; input('tilesPerBox').value = '10'; input('pricePerBox').value = examplePrice;
  showErrors = false; setSystem('us');
}
form.addEventListener('reset', event => { event.preventDefault(); reset(); });
document.getElementById('load-example')!.addEventListener('click', () => { reset('30'); form.scrollIntoView({behavior:'smooth',block:'start'}); input('roomWidth').focus({preventScroll:true}); });

// Documented query values reproduce worked examples without browser storage.
const params = new URLSearchParams(location.search);
for (const key of dimensionKeys) {
  const value = params.get(key); const lengthUnit = params.get(`${key}Unit`);
  if (lengthUnit && Object.hasOwn(unitMillimeters, lengthUnit)) unit(key).value = lengthUnit;
  if (value !== null) input(key).value = value;
  try { dimensions[key] = readQueryDimension(params, key, input(key).value, unit(key).value as LengthUnit); }
  catch { dimensions[key] = null; }
}
for (const key of ['waste','tilesPerBox','pricePerBox']) if (params.has(key)) input(key).value = params.get(key)!;
areaUnit = ['ft','in'].includes(unit('roomWidth').value) ? 'us' : 'metric';
if (params.size) document.querySelectorAll<HTMLButtonElement>('[data-system]').forEach(button => button.setAttribute('aria-pressed', 'false'));
update();
