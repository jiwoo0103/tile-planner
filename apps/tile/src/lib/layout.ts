import { asNumber, calculate, divide, type EstimateInput, type Fraction } from './calculator';
export type StartPoint = 'corner' | 'center';
export const RENDER_LIMIT = 2500;
const zero: Fraction = { n: 0n, d: 1n };
const add = (a: Fraction, b: Fraction): Fraction => ({ n: a.n*b.d+b.n*a.d, d: a.d*b.d });
const sub = (a: Fraction, b: Fraction): Fraction => ({ n: a.n*b.d-b.n*a.d, d: a.d*b.d });
const times = (a: Fraction, n: number): Fraction => ({ n: a.n*BigInt(n), d:a.d });
const less = (a: Fraction, b: Fraction) => a.n*b.d < b.n*a.d;
const equal = (a: Fraction, b: Fraction) => a.n*b.d === b.n*a.d;
const ceil = (a: Fraction) => Number((a.n+a.d-1n)/a.d);
export interface Axis { count: number; full: number; first: Fraction; last: Fraction; trailingGap: Fraction; tile: Fraction; grout: Fraction; }
/** Center uses the smallest number of pieces spanning both walls with equal edge widths. */
export function axisLayout(room: Fraction, tile: Fraction, grout: Fraction, start: StartPoint): Axis {
  if (room.n <= 0n || tile.n <= 0n || grout.n < 0n || room.d <= 0n || tile.d <= 0n || grout.d <= 0n || !less(grout,tile)) throw new Error('Use positive dimensions and grout smaller than each tile dimension.');
  if (!less(tile,room)) return { count:1, full:equal(tile,room)?1:0, first:room, last:room, trailingGap:zero,tile,grout };
  const pitch = add(tile,grout);
  if(start === 'center') {
    const count = ceil(divide(add(room,grout),pitch));
    const edge = divide(sub(sub(room,times(tile,count-2)),times(grout,count-1)),{n:2n,d:1n});
    return {count,full:equal(edge,tile)?count:count-2,first:edge,last:edge,trailingGap:zero,tile,grout};
  }
  const count = ceil(divide(room,pitch));
  const remaining = sub(room,times(pitch,count-1));
  const last = less(tile,remaining)?tile:remaining;
  return {count,full:count-(less(last,tile)?1:0),first:tile,last,trailingGap:sub(remaining,last),tile,grout};
}
export function axisPiece(axis: Axis, index: number) {
  const size = index === 0 ? axis.first : index === axis.count-1 ? axis.last : axis.tile;
  const offset = index === 0 ? zero : add(add(axis.first,axis.grout),times(add(axis.tile,axis.grout),index-1));
  return { offset:asNumber(offset), size:asNumber(size), cut:!equal(size,axis.tile) };
}
export function planLayout(input: EstimateInput, grout: Fraction, orientation: '0'|'90', start: StartPoint) {
  const estimate = calculate(input);
  if (!Number.isFinite(asNumber(grout)) || asNumber(grout)>25) throw new Error('Grout spacing must be from 0 to 25 mm and smaller than each tile dimension.');
  const x = axisLayout(input.roomWidth,orientation==='90'?input.tileLength:input.tileWidth,grout,start);
  const y = axisLayout(input.roomLength,orientation==='90'?input.tileWidth:input.tileLength,grout,start);
  const total = x.count*y.count;
  const full = x.full*y.full;
  return { x,y,total,full,cut:total-full,limited:total>RENDER_LIMIT,estimate };
}
