const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');
const FD = '/mnt/skills/examples/canvas-design/canvas-fonts/';
const LOGO = `data:image/png;base64,${fs.readFileSync('/tmp/odinsvg/logo.png').toString('base64')}`;
const W=2000,H=1125;
const C={ink:'#1A2A45',sub:'#5E6E89',mono:'#2D6BE8',sherpaStroke:'#2F6BF0',divider:'#DCE4EF',muted:'#7E8DA6'};

let S=[];const push=s=>S.push(s);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rrect=(x,y,w,h,rx,fill,stroke,sw,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''} ${extra}/>`;
const txt=(x,y,t,{size=26,fill=C.ink,weight=400,family='Outfit',anchor='start',ls=''}={})=>`<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${ls?`letter-spacing="${ls}"`:''}>${esc(t)}</text>`;
const hline=(x1,x2,y,col=C.divider)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width="1.4"/>`;
function typMark(x,y){return `<circle cx="${x}" cy="${y}" r="11" fill="#FFFFFF" stroke="#B7C2D4" stroke-width="2"/><line x1="${x-5}" y1="${y}" x2="${x+5}" y2="${y}" stroke="#B7C2D4" stroke-width="2" stroke-linecap="round"/>`;}
function odinMark(x,y){return `<circle cx="${x}" cy="${y}" r="12" fill="url(#chipgrad)"/><path d="M${x-5} ${y} L${x-1} ${y+5} L${x+6} ${y-5}" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}

push(`<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFE"/><stop offset="1" stop-color="#E7EFF8"/></linearGradient>
  <linearGradient id="chipgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D8BFF"/><stop offset="1" stop-color="#2461E8"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="#16294A" flood-opacity="0.10"/></filter>
</defs>`);
push(rrect(0,0,W,H,0,'url(#bg)','',0));

// header
push(txt(82,66,'AGENTIC GTM DEEP RESEARCH FOR CLAUDE CODE',{size:18,weight:700,fill:C.sherpaStroke,ls:'3'}));
push(txt(80,130,'Odin vs. typical deep research',{size:60,weight:700,fill:C.ink}));
push(txt(86,174,'Same retrieval and citations. Very different control, reach, and judgment.',{size:26,fill:C.sub}));
push(hline(80,1920,208));

// columns
const labelX=96, typC=792, odC=1538;
// Odin highlight column
push(rrect(1150,232,772,808,24,'#EFF5FF',C.sherpaStroke,2,'filter="url(#sh)"'));

// column headers
push(txt(typC,292,'TYPICAL DEEP RESEARCH',{size:23,weight:700,fill:C.ink,anchor:'middle',ls:'1'}));
push(txt(typC,320,'Claude · OpenAI · Perplexity · NotebookLM',{size:17,fill:C.muted,anchor:'middle'}));
push(`<image href="${LOGO}" x="${odC-92}" y="274" width="40" height="40"/>`);
push(txt(odC-44,306,'ODIN',{size:32,weight:700,fill:C.sherpaStroke,anchor:'start',ls:'1'}));
push(txt(odC,332,'GTM research orchestrator',{size:17,fill:C.sub,anchor:'middle'}));

// rows
const rows=[
  ['The question','Researches the prompt you typed, as-is','A PMM expert reframes it into decision-driving questions'],
  ['What it sees','Public web only (some add Drive or inbox)','Public web + your Slack, email, meetings & docs'],
  ['Your private data','Ingested, no control over where it resurfaces','Origin-tagged; needs your sign-off to leave the building'],
  ['Cost & control','Picks depth and spends on its own','Shows the plan + cost up front; you approve first'],
  ['Memory','One-off report, stored in the vendor cloud','Saved to a vault you own; each run speeds the next'],
  ['Trust','Closed black box, taken on faith','Open source; every claim traced to its source'],
];
const top=350, rh=112;
push(hline(80,1908,top));
rows.forEach((r,i)=>{
  const cy=top+i*rh+rh/2;
  if(i>0) push(hline(80,1148,top+i*rh));
  push(txt(labelX,cy+8,r[0],{size:23,weight:700,fill:C.ink}));
  push(typMark(474,cy));
  push(txt(506,cy+7,r[1],{size:19,fill:C.sub}));
  push(odinMark(1184,cy));
  push(txt(1216,cy+7,r[2],{size:19,weight:600,fill:C.ink}));
});

// footer
push(hline(80,1920,1058));
push(txt(80,1098,'github.com/boommark/odin',{size:24,fill:C.ink,family:'JetBrains Mono'}));
push(txt(1000,1096,'Deep research finds answers · Odin makes them defensible, reusable & yours',{size:20,fill:C.muted,anchor:'middle'}));
push(txt(1920,1098,'Abhishek Ratna   ·   www.pmmsherpa.com',{size:24,fill:C.sub,anchor:'end'}));

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${S.join('\n')}</svg>`;
fs.writeFileSync('/tmp/odinsvg/odin-compare.svg',svg);
const resvg=new Resvg(svg,{fitTo:{mode:'width',value:3200},font:{loadSystemFonts:false,fontFiles:[FD+'Outfit-Regular.ttf',FD+'Outfit-Bold.ttf',FD+'JetBrainsMono-Regular.ttf'],defaultFontFamily:'Outfit'}});
fs.writeFileSync('/tmp/odinsvg/odin-compare.png',resvg.render().asPng());
console.log('done');
