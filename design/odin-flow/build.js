const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

const FD = '/mnt/skills/examples/canvas-design/canvas-fonts/';
const LOGO = `data:image/png;base64,${fs.readFileSync('/tmp/odinsvg/logo.png').toString('base64')}`;

const W = 2000, H = 1125, Cy = 600;

// ---- light, modern palette ----
const C = {
  ink:'#16243C', sub:'#5C6E89', mono:'#2563EB',
  card:'#FFFFFF', cardStroke:'#D6DFEC',
  sherpaFill:'#EAF2FF', sherpaStroke:'#2F6BF0', sherpaTitle:'#143A86',
  amberFill:'#FFF4E1', amberStroke:'#E0902A', amberTitle:'#9A5A00',
  arrow:'#8DA0BA', divider:'#D9E1EC', muted:'#7C8DA8',
};

let S=[]; const push=s=>S.push(s);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rrect=(x,y,w,h,rx,fill,stroke,sw,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''} ${extra}/>`;
const txt=(x,y,t,{size=26,fill=C.ink,weight=400,family='Outfit',anchor='middle',ls=''}={})=>`<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${ls?`letter-spacing="${ls}"`:''}>${esc(t)}</text>`;
const arrow=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.arrow}" stroke-width="2.8" marker-end="url(#ah)"/>`;
const line=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.arrow}" stroke-width="2.8"/>`;
const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="${C.arrow}"/>`;
function chip(x,y,t){
  const w=t.length*9.6+46, h=36;
  const g=[rrect(x,y,w,h,18,C.sherpaFill,'#C4D6F2',1.4)];
  g.push(`<circle cx="${x+19}" cy="${y+h/2}" r="4" fill="${C.sherpaStroke}"/>`);
  g.push(txt(x+32,y+h/2+6,t,{size:18,anchor:'start',fill:'#1E3A6B'}));
  return {svg:g.join(''),w};
}

function node(cx,cy,w,h,o){
  const {title,subs=[],code,kind='plain',logo=false}=o;
  const x=cx-w/2,y=cy-h/2;
  let fill=C.card,stroke=C.cardStroke,sw=1.6,tcol=C.ink;
  if(kind==='sherpa'){fill=C.sherpaFill;stroke=C.sherpaStroke;sw=2.4;tcol=C.sherpaTitle;}
  if(kind==='amber'){fill=C.amberFill;stroke=C.amberStroke;sw=2.2;tcol=C.amberTitle;}
  let g=[rrect(x,y,w,h,16,fill,stroke,sw,'filter="url(#sh)"')];
  const lines=[{t:title,size:25,weight:700,fill:tcol,lh:34}];
  subs.forEach(s=>lines.push({t:s,size:20,weight:400,fill:C.sub,lh:27}));
  if(code) lines.push({t:code,size:19,weight:400,fill:C.mono,lh:27,family:'JetBrains Mono'});
  const tot=lines.reduce((a,l)=>a+l.lh,0); let yy=cy-tot/2;
  lines.forEach(l=>{yy+=l.lh; g.push(txt(cx,yy-7,l.t,{size:l.size,weight:l.weight,fill:l.fill,family:l.family||'Outfit'}));});
  if(logo) g.push(`<image href="${LOGO}" x="${x-13}" y="${y-13}" width="44" height="44"/>`);
  return g.join('');
}

// defs
push(`<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F8FBFF"/><stop offset="1" stop-color="#E9F0F9"/>
  </linearGradient>
  <marker id="ah" markerWidth="11" markerHeight="11" refX="8.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L9,4 L0,8 z" fill="${C.arrow}"/>
  </marker>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#1B2C46" flood-opacity="0.14"/>
  </filter>
</defs>`);
push(rrect(0,0,W,H,0,'url(#bg)','',0));

// header
push(txt(82,64,'AGENTIC RESEARCH ORCHESTRATOR',{size:18,weight:700,anchor:'start',fill:C.sherpaStroke,ls:'3'}));
push(txt(80,124,'Odin',{size:68,weight:700,anchor:'start',fill:C.ink,ls:'1'}));
push(txt(86,162,'Agentic GTM deep research for Claude Code',{size:28,weight:400,anchor:'start',fill:C.sub}));
// spec chips
let cx0=84; const chy=180;
['6 phases · 3 human gates','4 engines · parallel','provenance-tracked · MCP','open source · MIT'].forEach(t=>{const c=chip(cx0,chy,t);push(c.svg);cx0+=c.w+13;});
push(`<line x1="80" y1="236" x2="1920" y2="236" stroke="${C.divider}" stroke-width="1.5"/>`);
// legend
push(rrect(1532,74,388,90,14,C.card,C.cardStroke,1.4,'filter="url(#sh)"'));
push(`<image href="${LOGO}" x="1552" y="86" width="28" height="28"/>`);
push(txt(1592,108,'PMM Sherpa touchpoint',{size:22,anchor:'start',fill:C.ink}));
push(rrect(1554,124,24,24,6,C.amberFill,C.amberStroke,2));
push(txt(1592,144,'Human approval gate',{size:22,anchor:'start',fill:C.ink}));

// EXECUTE container (centered on Cy)
push(rrect(635,300,530,600,22,'#EEF4FB','#C4D2E4',1.6,'stroke-dasharray="7 7"'));
push(txt(663,290,'EXECUTE · runs in parallel',{size:23,weight:700,anchor:'start',fill:C.sub}));
push(txt(900,940,'every finding tagged with its origin  (web / internal)',{size:21,fill:C.muted}));

// LEFT spine (pitch 150, centered Cy)
const LX=210,LW=250,LH_=92;
const lY=[300,450,600,750,900];
push(node(LX,lY[0],LW,LH_,{title:'USER QUERY',subs:['“Should we reposition','against Competitor X?”']}));
push(node(LX,lY[1],LW,LH_,{title:'CLASSIFY',subs:['GTM / technical / mixed']}));
push(node(LX,lY[2],LW,LH_,{title:'GATE 1 · HUMAN',kind:'amber',subs:['Intake + vault','memory check']}));
push(node(LX,lY[3],LW,LH_,{title:'SCOPE',kind:'sherpa',logo:true,subs:['Sherpa reframes into GTM facets'],code:'scope_pmm_research'}));
push(node(LX,lY[4],LW,LH_,{title:'GATE 2 · HUMAN',kind:'amber',subs:['Approve routing','table + cost']}));
for(let i=0;i<4;i++) push(arrow(LX,lY[i]+LH_/2,LX,lY[i+1]-LH_/2));

// MIDDLE lanes (pitch 150, centered Cy)
const MX=900,MW=470,MH=92;
const mY=[375,525,675,825];
push(node(MX,mY[0],MW,MH,{title:'hyperresearch',subs:['deep web & academic research']}));
push(node(MX,mY[1],MW,MH,{title:'Deep-Research-skills',subs:['structured comparison matrices']}));
push(node(MX,mY[2],MW,MH,{title:'PMM Sherpa',kind:'sherpa',logo:true,subs:['GTM expert reasoning'],code:'ask_sherpa'}));
push(node(MX,mY[3],MW,MH,{title:'Internal ravens',subs:['Slack · M365 · Granola · Atlassian']}));

// fan-out (mirror offset 100 from lane edge)
const G2R=LX+LW/2, boX=565, mL=MX-MW/2, mR=MX+MW/2;
push(line(G2R,900,boX,900)); push(line(boX,mY[0],boX,900)); push(dot(boX,900));
mY.forEach(cy=>push(arrow(boX,cy,mL,cy)));
// fan-in
const biX=1235;
mY.forEach(cy=>push(line(mR,cy,biX,cy)));
push(line(biX,mY[0],biX,mY[3])); push(dot(biX,Cy));

// right: synth -> gate3 -> report
const SX=1500;
push(node(SX,Cy,350,170,{title:'SYNTHESIZE',kind:'sherpa',logo:true,subs:['blend evidence · hunt internal-','vs-external contradictions'],code:'get_feedback · draft_artifact'}));
push(arrow(biX,Cy,SX-175,Cy));
push(node(1785,Cy,190,92,{title:'GATE 3',kind:'amber',subs:['Human sign-off']}));
push(arrow(SX+175,Cy,1785-95,Cy));
push(node(1785,790,300,110,{title:'CITED REPORT',subs:['→ your vault & notes','every claim sourced']}));
push(arrow(1785,Cy+46,1785,790-55));

// footer
push(`<line x1="80" y1="1050" x2="1920" y2="1050" stroke="${C.divider}" stroke-width="1.5"/>`);
push(txt(80,1094,'github.com/boommark/odin',{size:25,anchor:'start',fill:C.ink,family:'JetBrains Mono'}));
push(txt(1000,1090,'Engines: hyperresearch · Deep-Research-skills · PMM Sherpa',{size:21,anchor:'middle',fill:C.muted}));
push(txt(1920,1094,'Abhishek Ratna   ·   www.pmmsherpa.com',{size:25,anchor:'end',fill:C.sub}));

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${S.join('\n')}</svg>`;
fs.writeFileSync('/tmp/odinsvg/odin-flow.svg',svg);
const resvg=new Resvg(svg,{fitTo:{mode:'width',value:3200},font:{loadSystemFonts:false,fontFiles:[FD+'Outfit-Regular.ttf',FD+'Outfit-Bold.ttf',FD+'JetBrainsMono-Regular.ttf',FD+'JetBrainsMono-Bold.ttf'],defaultFontFamily:'Outfit'}});
fs.writeFileSync('/tmp/odinsvg/odin-flow.png',resvg.render().asPng());
console.log('done');
