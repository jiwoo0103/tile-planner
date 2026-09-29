import { describe, expect, it } from 'vitest';
import { calculate, displayMeasurement, measurement, type EstimateInput } from './calculator';
const base = (): EstimateInput => ({ roomWidth: measurement('10','ft'), roomLength: measurement('12','ft'), tileWidth: measurement('12','in'), tileLength: measurement('12','in'), waste:'10', tilesPerBox:'10', pricePerBox:'' });
describe('tile purchase estimates', () => {
  it('matches the roadmap example and optional box cost', () => { const r=calculate({...base(),pricePerBox:'30'}); expect(r).toMatchObject({baseTiles:120,requiredTiles:132,boxes:14,purchasedTiles:140,extraTiles:8,cost:420}); });
  it('produces identical estimates for equivalent metric dimensions', () => { expect(calculate({...base(),roomWidth:measurement('3.048','m'),roomLength:measurement('3.6576','m'),tileWidth:measurement('30.48','cm'),tileLength:measurement('30.48','cm')})).toEqual(calculate(base())); });
  it('keeps real dimensions when display units switch repeatedly', () => { const exact=measurement('7','in'); for(let i=0;i<100;i++){expect(displayMeasurement(exact,'cm')).toBe('17.78'); expect(displayMeasurement(exact,'in')).toBe('7');} });
  it('applies allowance before rounding fractional area ratio', () => { const r=calculate({...base(),roomWidth:measurement('3.5','m'),roomLength:measurement('4.2','m'),tileWidth:measurement('60','cm'),tileLength:measurement('60','cm'),tilesPerBox:'4'}); expect(r).toMatchObject({baseTiles:41,requiredTiles:45,boxes:12,purchasedTiles:48}); });
  it('does not add a tile at an exact decimal rounding boundary', () => { expect(calculate({...base(),roomWidth:measurement('0.3','m'),roomLength:measurement('0.3','m'),tileWidth:measurement('0.1','m'),tileLength:measurement('0.1','m'),waste:'0'}).requiredTiles).toBe(9); });
  it('rounds quantities immediately above a whole-tile boundary', () => { expect(calculate({...base(),roomWidth:measurement('10.00000001','ft'),waste:'0'}).requiredTiles).toBe(121); });
  it('handles tile larger than room and zero allowance', () => { const r=calculate({...base(),roomWidth:measurement('1','in'),roomLength:measurement('1','in'),waste:'0'}); expect(r.requiredTiles).toBe(1); expect(r.boxes).toBe(1); });
  it.each(['','-1','NaN','Infinity','1e3','0.123456789'])('rejects invalid dimension text %s', value => expect(()=>measurement(value,'ft')).toThrow());
  it.each(['0','0.5','10001','-1'])('rejects invalid box count %s', tilesPerBox => expect(()=>calculate({...base(),tilesPerBox})).toThrow());
  it.each(['101','-1',''])('rejects invalid allowance %s', waste => expect(()=>calculate({...base(),waste})).toThrow());
  it('distinguishes free boxes from an omitted cost', () => { expect(calculate(base()).cost).toBeNull(); expect(calculate({...base(),pricePerBox:'0'}).cost).toBe(0); });
  it.each(['1.234','1000001','-2'])('rejects invalid price %s', pricePerBox => expect(()=>calculate({...base(),pricePerBox})).toThrow());
  it('rejects zero, extreme dimensions and enormous quantities', () => { expect(()=>calculate({...base(),roomWidth:measurement('0','m')})).toThrow(); expect(()=>calculate({...base(),roomWidth:measurement('1001','m')})).toThrow(); expect(()=>calculate({...base(),tileWidth:measurement('0.1','mm'),tileLength:measurement('0.1','mm')})).toThrow(); });
});
