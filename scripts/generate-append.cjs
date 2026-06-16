const fs=require('fs');
const content=fs.readFileSync('c:/Users/Gavin/AppData/Roaming/Code/User/workspaceStorage/4222ff0719fcc2044acd960db63d3e1d/GitHub.copilot-chat/chat-session-resources/322566c5-ef2e-4a1d-9380-7a60ace91eb4/call_8QpFIsiqW3dUmRtDvCTNjOJt__vscode-1781544280774/content.json','utf8');
const api=JSON.parse(content);
const s=fs.readFileSync('src/data/predictions.ts','utf8');
const blockRe=/id:\s*'([^']+)'[\s\S]*?home:\s*'([^']+)'[\s\S]*?away:\s*'([^']+)'/g;
let m;const existing=new Set();
while((m=blockRe.exec(s))){existing.add(m[2].toLowerCase()+'|||'+m[3].toLowerCase());}
function toId(home,away){const h=home.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');const a=away.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');return `${h}-${a}`;}
function bstFromUtc(utc){const d=new Date(utc);d.setHours(d.getHours()+1);const yyyy=d.getUTCFullYear();const mm=String(d.getUTCMonth()+1).padStart(2,'0');const dd=String(d.getUTCDate()).padStart(2,'0');const hh=String(d.getUTCHours()).padStart(2,'0');const min=String(d.getUTCMinutes()).padStart(2,'0');return {dateISO:`${yyyy}-${mm}-${dd}`,kickoff:`${hh}:${min}`};}
const API_TO_LOCAL = {
	'United States': 'USA',
	'Bosnia-Herzegovina': 'Bosnia',
	'Cape Verde Islands': 'Cape Verde',
	'Congo DR': 'DR Congo',
	'Turkey': 'Türkiye',
};

function apiToLocal(name){return API_TO_LOCAL[name] || name;}

const toAdd=[];
for(const mt of api.matches){
	const rawHome=mt.homeTeam.name; const rawAway=mt.awayTeam.name;
	const home=apiToLocal(rawHome); const away=apiToLocal(rawAway);
	const key = home.toLowerCase()+'|||'+away.toLowerCase();
	if(existing.has(key)) continue;
	const {dateISO,kickoff}=bstFromUtc(mt.utcDate);
	const md=mt.matchday||0;
	const group= (mt.group||'').replace('GROUP_','').replace('GROUP ','').replace('GROUP','').trim();
	toAdd.push({id:toId(home,away),matchday:md,dateISO,kickoffBST:kickoff,group:group||'',venue:'TBD',home,away});
}
if(toAdd.length===0){console.log('NO_NEW');process.exit(0);}const out=toAdd.map(m=>`  {\n    id: '${m.id}',\n    matchday: ${m.matchday},\n    dateISO: '${m.dateISO}',\n    kickoffBST: '${m.kickoffBST}',\n    group: '${m.group}',\n    venue: '${m.venue}',\n    home: '${m.home}',\n    away: '${m.away}',\n    predHome: 1,\n    predAway: 1,\n    predType: 'favourite-tight',\n    reasoning: 'Auto-added schedule entry',\n    confidence: 60,\n  },\n`).join('\n');
console.log(out);
