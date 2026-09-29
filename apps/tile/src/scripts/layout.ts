import { asNumber,decimal,displayMeasurement,measurement,unitMillimeters,type Fraction,type LengthUnit } from '../lib/calculator';
import { axisPiece,planLayout,RENDER_LIMIT,type StartPoint } from '../lib/layout';
import { dimensionKeys,projectUrl,readQueryDimension,type DimensionKey } from '../lib/project-url';
const form=document.querySelector<HTMLFormElement>('#layout-form')!;
const field=(id:string)=>document.getElementById(id) as HTMLInputElement;
const unit=(key:string)=>document.getElementById(`${key}-unit`) as HTMLSelectElement;
const text=(id:string,value:string)=>{document.getElementById(id)!.textContent=value;};
const dimensions={} as Record<DimensionKey,Fraction|null>;
const format=(value:number,digits=2)=>value>0&&value<0.01?value.toExponential(2):new Intl.NumberFormat('en-US',{maximumFractionDigits:digits}).format(value);
const drawing=document.getElementById('drawing')!;
const link=document.getElementById('open-calculator') as HTMLAnchorElement;
function read(key:DimensionKey){try{dimensions[key]=measurement(field(key).value,unit(key).value as LengthUnit);}catch{dimensions[key]=null;}}
function draw(plan:ReturnType<typeof planLayout>){
  const width=asNumber(dimensions.roomWidth!),height=asNumber(dimensions.roomLength!);
  const scale=Math.min(540/width,390/height),w=width*scale,h=height*scale,x=90+(540-w)/2,y=65+(390-h)/2;
  const roomLabel=(key:DimensionKey)=>`${format(asNumber(dimensions[key]!)/asNumber(unitMillimeters[unit(key).value as LengthUnit]),4)} ${unit(key).value}`;
  const ns='http://www.w3.org/2000/svg';
  const element=(tag:string,attrs:Record<string,string|number>,content?:string)=>{const node=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,String(value));if(content)node.textContent=content;return node;};
  const svg=element('svg',{viewBox:'0 0 710 530',role:'img','aria-labelledby':'plan-title plan-description',width:'100%'});
  svg.append(element('title',{id:'plan-title'},'Scaled tile layout'),element('desc',{id:'plan-description'},`${plan.x.count} columns and ${plan.y.count} rows, ${plan.full} full tiles and ${plan.cut} cut pieces. Room width ${roomLabel('roomWidth')}; length ${roomLabel('roomLength')}.${plan.limited?' Individual tiles are hidden because the render limit was exceeded.':''}`));
  svg.append(element('rect',{x,y,width:w,height:h,fill:'#fff',stroke:'#173b4a','stroke-width':2}));
  if(!plan.limited){for(let row=0;row<plan.y.count;row++){const py=axisPiece(plan.y,row);for(let col=0;col<plan.x.count;col++){const px=axisPiece(plan.x,col),cut=px.cut||py.cut;const rect=element('rect',{x:x+px.offset*scale,y:y+py.offset*scale,width:px.size*scale,height:py.size*scale,fill:cut?'#a8d9db':'#e1e9e7',stroke:cut?'#087d92':'#718c96','stroke-width':0.55,...(cut?{'stroke-dasharray':'3 2'}:{})});rect.append(element('title',{},`${cut?'Cut piece':'Full tile'}: ${format(px.size,4)} × ${format(py.size,4)} mm`));svg.append(rect);}}}
  else svg.append(element('text',{x:x+w/2,y:y+h/2,'text-anchor':'middle',fill:'#617489','font-size':15},'Tile detail hidden'));
  // Fixed-size dimension annotations around a scaled, undistorted room.
  for(const [x1,y1,x2,y2]of [[x,y-20,x+w,y-20],[x-20,y,x-20,y+h],[x,y-25,x,y-15],[x+w,y-25,x+w,y-15],[x-25,y,x-15,y],[x-25,y+h,x-15,y+h]])svg.append(element('line',{x1,y1,x2,y2,stroke:'#617489','stroke-width':1}));
  svg.append(element('text',{x:x+w/2,y:y-32,'text-anchor':'middle',fill:'#112842','font-size':15},roomLabel('roomWidth')));
  svg.append(element('text',{x:x-34,y:y+h/2,transform:`rotate(-90 ${x-34} ${y+h/2})`,'text-anchor':'middle',fill:'#112842','font-size':15},roomLabel('roomLength')));
  svg.append(element('text',{x:355,y:505,'text-anchor':'middle',fill:'#617489','font-size':12},'WIDTH →   ·   LENGTH ↓'));
  drawing.replaceChildren(svg);
}
function update(){
  const error=document.getElementById('layout-error')!;
  error.hidden=true;
  try{
    for(const key of dimensionKeys){field(key).setAttribute('aria-invalid',String(!dimensions[key]));if(!dimensions[key])throw new Error('Enter a valid value for every room and tile dimension.');}
    const plan=planLayout({roomWidth:dimensions.roomWidth!,roomLength:dimensions.roomLength!,tileWidth:dimensions.tileWidth!,tileLength:dimensions.tileLength!,waste:field('waste').value,tilesPerBox:field('tilesPerBox').value,pricePerBox:field('pricePerBox').value},decimal(field('grout').value),field('orientation').value as '0'|'90',field('start').value as StartPoint);
    draw(plan);
    const edge=(a:Fraction)=>`${format(asNumber(a),4)} mm`;
    text('edge-x',`${edge(plan.x.first)} / ${edge(plan.x.last)}`);text('edge-y',`${edge(plan.y.first)} / ${edge(plan.y.last)}`);
    const gaps=[asNumber(plan.x.trailingGap)>0?`${edge(plan.x.trailingGap)} grout at the right wall`:'',asNumber(plan.y.trailingGap)>0?`${edge(plan.y.trailingGap)} grout at the bottom wall`:''].filter(Boolean);
    text('layout-status',`${format(plan.x.count,0)} columns × ${format(plan.y.count,0)} rows · ${format(plan.total,0)} placed pieces.${plan.limited?` Over the ${format(RENDER_LIMIT,0)}-piece drawing limit; only the room outline is shown. Choose larger tiles or a smaller room to see individual pieces.`:' Edge piece dimensions are listed below.'}${gaps.length?' '+gaps.join('; ')+'.':''}`);
    const us=['ft','in'].includes(unit('roomWidth').value);
    text('summary-full',format(plan.full,0));text('summary-cut',format(plan.cut,0));text('summary-area',`${format(plan.estimate.areaMm2/(us?92903.04:1e6))} ${us?'sq ft':'m²'}`);text('summary-boxes',format(plan.estimate.boxes,0));
    text('purchase-note',`${format(plan.estimate.requiredTiles,0)} area-estimated tiles with ${format(plan.estimate.waste)}% allowance · ${format(plan.estimate.purchasedTiles,0)} tiles in full boxes. Grout and cutting reuse do not reduce this estimate.${plan.estimate.cost!==null?` Tile cost: ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(plan.estimate.cost)}.`:''}`);
    const units=Object.fromEntries(dimensionKeys.map(k=>[k,unit(k).value])) as Record<DimensionKey,LengthUnit>;
    link.href=projectUrl('/calculator/',dimensions as Record<DimensionKey,Fraction>,units,Object.fromEntries(['waste','tilesPerBox','pricePerBox','grout','orientation','start'].map(k=>[k,field(k).value])));link.removeAttribute('aria-disabled');
    text('compare-start',field('start').value==='center'?'Try corner start →':'Try centered edges →');
    return true;
  }catch(reason){error.textContent=reason instanceof Error?reason.message:'Check the inputs.';error.hidden=false;drawing.replaceChildren(Object.assign(document.createElement('p'),{className:'p-10 text-center text-sm text-muted',textContent:'Check your inputs to generate a new plan.'}));for(const key of ['full','cut','area','boxes'])text(`summary-${key}`,'—');for(const key of ['edge-x','edge-y'])text(key,'—');text('layout-status','No current layout. The previous drawing has been cleared.');text('purchase-note','Check your inputs to see the purchase estimate.');link.removeAttribute('href');link.setAttribute('aria-disabled','true');return false;}
}
for(const key of dimensionKeys){read(key);field(key).addEventListener('input',()=>{read(key);update();});unit(key).addEventListener('change',()=>{if(dimensions[key])field(key).value=displayMeasurement(dimensions[key]!,unit(key).value as LengthUnit);update();});}
for(const key of ['grout','waste','tilesPerBox','pricePerBox'])field(key).addEventListener('input',update);
for(const key of ['orientation','start'])field(key).addEventListener('change',update);
form.addEventListener('submit',event=>{event.preventDefault();if(update())document.getElementById('layout-preview')!.focus();});
form.addEventListener('reset',event=>{
  // Reset values explicitly: a microtask can run before the native reset default action.
  event.preventDefault();
  for(const control of form.elements){
    if(control instanceof HTMLInputElement) control.value=control.defaultValue;
    else if(control instanceof HTMLSelectElement) control.value=Array.from(control.options).find(option=>option.defaultSelected)?.value??control.options[0].value;
  }
  for(const key of dimensionKeys)read(key);
  update();
});
document.getElementById('compare-start')!.addEventListener('click',()=>{field('start').value=field('start').value==='center'?'corner':'center';update();});
const params=new URLSearchParams(location.search);
for(const key of dimensionKeys){const u=params.get(`${key}Unit`);if(u&&Object.hasOwn(unitMillimeters,u))unit(key).value=u;if(params.has(key))field(key).value=params.get(key)!;try{dimensions[key]=readQueryDimension(params,key,field(key).value,unit(key).value as LengthUnit);}catch{dimensions[key]=null;}}
for(const key of ['waste','tilesPerBox','pricePerBox','grout'])if(params.has(key))field(key).value=params.get(key)!;
if(['0','90'].includes(params.get('orientation')||''))field('orientation').value=params.get('orientation')!;
if(['corner','center'].includes(params.get('start')||''))field('start').value=params.get('start')!;
update();
