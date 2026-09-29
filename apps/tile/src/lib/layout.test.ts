import { describe,expect,it } from 'vitest';
import { asNumber,measurement,calculate,type EstimateInput } from './calculator';
import { axisLayout,axisPiece,planLayout } from './layout';
import { dimensionKeys,projectUrl,readQueryDimension } from './project-url';
const mm=(value:number)=>measurement(String(value),'mm');
const input=():EstimateInput=>({roomWidth:mm(1000),roomLength:mm(900),tileWidth:mm(300),tileLength:mm(300),waste:'10',tilesPerBox:'10',pricePerBox:'30'});
describe('scaled straight grid',()=>{
  it('divides exactly without false edge cuts',()=>{const p=planLayout({...input(),roomWidth:mm(1200)},mm(0),'0','center');expect(p).toMatchObject({total:12,full:12,cut:0});});
  it('centers with symmetrical edges and no artificial slivers',()=>{const a=axisLayout(mm(1000),mm(300),mm(2),'center');expect(a.count).toBe(4);expect(asNumber(a.first)).toBe(197);expect(asNumber(a.last)).toBe(197);expect(a.full).toBe(2);expect(axisPiece(a,3)).toMatchObject({offset:803,size:197,cut:true});});
  it('corner starts full and measures the actual final cut',()=>{const a=axisLayout(mm(1000),mm(300),mm(2),'corner');expect(a.full).toBe(3);expect(asNumber(a.last)).toBe(94);expect(axisPiece(a,3).offset).toBe(906);});
  it('reports a room ending inside a grout joint without a negative tile',()=>{const a=axisLayout(mm(301),mm(300),mm(2),'corner');expect(a.count).toBe(1);expect(a.full).toBe(1);expect(asNumber(a.trailingGap)).toBe(1);expect(axisPiece(a,0).size).toBe(300);});
  it('clips oversized tiles to one cut piece',()=>{expect(planLayout({...input(),roomWidth:mm(200),roomLength:mm(100)},mm(0),'0','center')).toMatchObject({total:1,full:0,cut:1});});
  it('rotates a rectangular tile without changing its purchase estimate',()=>{const i={...input(),tileLength:mm(200)};const a=planLayout(i,mm(2),'0','corner');const b=planLayout(i,mm(2),'90','corner');expect(a.x.count).toBe(4);expect(b.x.count).toBe(5);expect(a.estimate).toEqual(b.estimate);expect(a.estimate).toEqual(calculate(i));});
  it('stops rendering large counts before allocating any piece arrays',()=>{const p=planLayout({...input(),roomWidth:mm(10000),roomLength:mm(10000),tileWidth:mm(10),tileLength:mm(10)},mm(0),'0','corner');expect(p.total).toBe(1_000_000);expect(p.limited).toBe(true);});
  it('keeps equivalent US and metric geometry identical',()=>{expect(axisLayout(measurement('10','ft'),measurement('12','in'),mm(2),'center')).toMatchObject({count:10,full:8});expect(asNumber(axisLayout(measurement('3.048','m'),measurement('30.48','cm'),mm(2),'center').first)).toBe(asNumber(axisLayout(measurement('10','ft'),measurement('12','in'),mm(2),'center').first));});
  it('rejects invalid or oversized grout',()=>{expect(()=>planLayout(input(),mm(26),'0','corner')).toThrow();expect(()=>axisLayout(mm(100),mm(1),mm(2),'center')).toThrow();});
  it('all piece extents account for the room with grout',()=>{for(const start of ['corner','center'] as const)for(const length of [1,299,300,301,302,599,600,602,1000]){const a=axisLayout(mm(length),mm(300),mm(2),start);const widths=Array.from({length:a.count},(_,i)=>axisPiece(a,i).size);expect(widths.every(w=>w>0&&w<=300)).toBe(true);expect(widths.reduce((a,b)=>a+b,0)+(a.count-1)*2+asNumber(a.trailingGap)).toBe(length);}});
});
describe('calculator/layout URL handoff',()=>{
  it('preserves exact measurements and all options after rounded unit display',()=>{const i=input();i.roomWidth=measurement('0.10000001','mm');const dimensions={roomWidth:i.roomWidth,roomLength:i.roomLength,tileWidth:i.tileWidth,tileLength:i.tileLength};const units={roomWidth:'ft',roomLength:'ft',tileWidth:'in',tileLength:'in'} as const;const params=new URL(projectUrl('/layout/',dimensions,units,{waste:'12',tilesPerBox:'8',pricePerBox:'45',grout:'2',orientation:'90',start:'center'}),'https://example.com').searchParams;for(const key of dimensionKeys)expect(asNumber(readQueryDimension(params,key,params.get(key)!,units[key]))).toBe(asNumber(dimensions[key]));expect(params.get('start')).toBe('center');expect(params.get('pricePerBox')).toBe('45');});
  it('ignores exact values that conflict with displayed inputs',()=>{expect(asNumber(readQueryDimension(new URLSearchParams('roomWidthExact=999/1'),'roomWidth','100','mm'))).toBe(100);});
});
