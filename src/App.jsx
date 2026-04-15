import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabase } from './supabaseClient'; 

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: linear-gradient(135deg, #dde8ff 0%, #eedeff 45%, #d9f0ff 100%);
    min-height: 100vh;
    font-family: 'Century Schoolbook', 'Century Old Style Std', 'Bookman Old Style', Georgia, serif;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }
  input[type=date]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.4; }
  select option { background:#fff; color:#1e293b; }
  .glass {
    background: rgba(255,255,255,0.52);
    backdrop-filter: blur(22px) saturate(180%);
    -webkit-backdrop-filter: blur(22px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.78);
    box-shadow: 0 8px 32px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.95);
  }
  .glassd {
    background: rgba(255,255,255,0.32);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.62);
  }
  .ginput {
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 10px;
    color: #1e293b;
    font-family: inherit;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .ginput:focus { border-color: rgba(99,102,241,.45); box-shadow: 0 0 0 3px rgba(99,102,241,.09); }
  .rh { transition: background .14s; }
  .rh:hover { background: rgba(255,255,255,.62) !important; }
  .rh-proj { transition: background .14s; border-radius: 6px; cursor: pointer; }
  .rh-proj:hover { background: rgba(255,255,255,.62) !important; }
  @keyframes su { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fi { from{opacity:0} to{opacity:1} }
`;

const INITIAL_FUNCTIONS = {
  "Tech lead": ["Stephen", "Ankit"],
  "Design":    ["Prajjwal","Sanjana Babu","Mohammed Hisham","Sneha Gupta"],
  "BE Dev":    ["Jahangir","Nabeel","Nabina Poudel","Sharad Raj"],
  "FE Dev":    ["Aman","Gaurav Rauthan","Jasjot Singh","Manish Moond","Prathmesh","Priyanshu","Riddhi","Rushikesh","Mohammed Arfaz","Vansh"],
  "PM":        ["Caleb","Midhu","Nishala","Roshna"],
  "Pre-sales": ["Ben"],
  "Ops":       ["Brian"],
  "QA":        ["Deon","Sourabh","Vebeesh"],
  "QC":        ["Jenny","Rebecca","Soso"],
};

const DEFAULT_PROJECTS = ["MTF","TL","DR","APEST","NSA","BCW","SC","SLINGSHOT","FREQUENCY","HIMALAYAN HAAT","DELIVA","GLASS"];
const DEFAULT_COLORS = {
  "MTF":"#6366f1","TL":"#f59e0b","DR":"#10b981","APEST":"#ef4444",
  "NSA":"#3b82f6","BCW":"#8b5cf6","SC":"#ec4899","SLINGSHOT":"#14b8a6",
  "FREQUENCY":"#f97316","HIMALAYAN HAAT":"#84cc16","DELIVA":"#06b6d4","GLASS":"#a855f7",
};
const CPOOL = ["#e11d48","#0891b2","#15803d","#b45309","#7c3aed","#be185d","#0369a1","#047857","#92400e","#065f46"];

const APR1 = "2026-04-01";
function dStr(d){return d instanceof Date?d.toISOString().slice(0,10):d;}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function addW(d,n){return addDays(d,n*7);}
function getMon(d){const x=new Date(d);x.setHours(0,0,0,0);const dy=x.getDay();x.setDate(x.getDate()+(dy===0?-6:1-dy));return x;}

// Period Generators
function get4W(anchor){
  const m=getMon(anchor);
  return Array.from({length:4},(_,i)=>{
    const s=addDays(m,i*7);
    return {start:s, end:addDays(s,6), isMonth:false};
  });
}
function get4M(anchor){
  const m=new Date(anchor);
  m.setDate(1);
  return Array.from({length:4},(_,i)=>{
    const s=new Date(m.getFullYear(), m.getMonth() + i, 1);
    const e=new Date(m.getFullYear(), m.getMonth() + i + 1, 0);
    return {start:s, end:e, isMonth:true};
  });
}

function active(e, period){return new Date(e.start) <= period.end && new Date(e.end) >= period.start;}
function allocW(entries, period){return (entries||[]).filter(e=>active(e,period)).reduce((s,e)=>s+Number(e.pct),0);}
function pLabel(p){
  return p.isMonth 
    ? p.start.toLocaleDateString("en-GB",{month:"short", year:"numeric"}) 
    : p.start.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}

function buildSeed(){
  const e=n=>dStr(addW(new Date(APR1),n));
  return {
    "Jahangir":        [{project:"MTF",pct:50,start:APR1,end:e(8)},{project:"NSA",pct:25,start:APR1,end:e(4)},{project:"BCW",pct:25,start:APR1,end:e(10)}],
    "Nabeel":          [{project:"APEST",pct:75,start:APR1,end:e(6)},{project:"TL",pct:25,start:APR1,end:e(4)}],
    "Nabina Poudel":   [{project:"SLINGSHOT",pct:100,start:APR1,end:e(12)}],
    "Sharad Raj":      [{project:"MTF",pct:50,start:APR1,end:e(6)},{project:"GLASS",pct:50,start:APR1,end:e(10)}],
    "Stephen":         [{project:"MTF",pct:25,start:APR1,end:e(12)},{project:"APEST",pct:25,start:APR1,end:e(12)},{project:"NSA",pct:25,start:APR1,end:e(8)},{project:"SC",pct:25,start:APR1,end:e(8)}],
    "Prajjwal":        [{project:"MTF",pct:50,start:APR1,end:e(6)},{project:"DR",pct:50,start:APR1,end:e(8)}],
    "Sanjana Babu":    [{project:"DELIVA",pct:60,start:APR1,end:e(8)},{project:"FREQUENCY",pct:40,start:APR1,end:e(6)}],
    "Mohammed Hisham": [{project:"HIMALAYAN HAAT",pct:75,start:APR1,end:e(8)},{project:"DELIVA",pct:25,start:APR1,end:e(4)}],
    "Sneha Gupta":     [{project:"SC",pct:100,start:APR1,end:e(8)}],
    "Aman":            [{project:"MTF",pct:100,start:APR1,end:e(10)}],
    "Gaurav Rauthan":  [{project:"TL",pct:50,start:APR1,end:e(4)},{project:"BCW",pct:50,start:APR1,end:e(6)}],
    "Jasjot Singh":    [{project:"APEST",pct:50,start:APR1,end:e(8)},{project:"HIMALAYAN HAAT",pct:50,start:APR1,end:e(6)}],
    "Manish Moond":    [{project:"SLINGSHOT",pct:75,start:APR1,end:e(6)},{project:"SC",pct:25,start:APR1,end:e(4)}],
    "Prathmesh":       [{project:"DELIVA",pct:100,start:APR1,end:e(8)}],
    "Priyanshu":       [{project:"NSA",pct:50,start:APR1,end:e(6)},{project:"MTF",pct:50,start:APR1,end:e(4)}],
    "Riddhi":          [{project:"FREQUENCY",pct:100,start:APR1,end:e(8)}],
    "Rushikesh":       [{project:"GLASS",pct:50,start:APR1,end:e(6)},{project:"BCW",pct:50,start:APR1,end:e(8)}],
    "Mohammed Arfaz":  [{project:"SLINGSHOT",pct:50,start:APR1,end:e(6)},{project:"FREQUENCY",pct:50,start:APR1,end:e(6)}],
    "Vansh":           [{project:"TL",pct:100,start:APR1,end:e(10)}],
    "Ankit":           [{project:"APEST",pct:50,start:APR1,end:e(6)},{project:"NSA",pct:50,start:APR1,end:e(6)}],
    "Brian":           [{project:"MTF",pct:25,start:APR1,end:e(8)},{project:"APEST",pct:25,start:APR1,end:e(8)},{project:"BCW",pct:25,start:APR1,end:e(8)},{project:"NSA",pct:25,start:APR1,end:e(8)}],
    "Caleb":           [{project:"MTF",pct:50,start:APR1,end:e(12)},{project:"TL",pct:50,start:APR1,end:e(6)}],
    "Midhu":           [{project:"APEST",pct:50,start:APR1,end:e(8)},{project:"HIMALAYAN HAAT",pct:50,start:APR1,end:e(6)}],
    "Nishala":         [{project:"SLINGSHOT",pct:60,start:APR1,end:e(8)},{project:"SC",pct:40,start:APR1,end:e(6)}],
    "Roshna":          [{project:"DELIVA",pct:75,start:APR1,end:e(8)},{project:"GLASS",pct:25,start:APR1,end:e(8)}],
    "Ben":             [{project:"MTF",pct:25,start:APR1,end:e(6)},{project:"APEST",pct:25,start:APR1,end:e(6)},{project:"NSA",pct:25,start:APR1,end:e(4)}],
    "Deon":            [{project:"MTF",pct:50,start:APR1,end:e(4)},{project:"SLINGSHOT",pct:50,start:APR1,end:e(8)}],
    "Sourabh":         [{project:"TL",pct:25,start:APR1,end:e(4)},{project:"APEST",pct:25,start:APR1,end:e(4)},{project:"FREQUENCY",pct:50,start:APR1,end:e(8)}],
    "Vebeesh":         [{project:"HIMALAYAN HAAT",pct:100,start:APR1,end:e(10)}],
    "Jenny":           [{project:"DELIVA",pct:50,start:APR1,end:e(6)},{project:"GLASS",pct:50,start:APR1,end:e(6)}],
    "Rebecca":         [{project:"BCW",pct:75,start:APR1,end:e(8)},{project:"SC",pct:25,start:APR1,end:e(6)}],
    "Soso":            [{project:"MTF",pct:50,start:APR1,end:e(4)},{project:"NSA",pct:50,start:APR1,end:e(4)}],
  };
}

// ── Water cell ──
function WaterCell({entries, period, getColor}){
  const act=entries.filter(e=>active(e, period));
  const tot=act.reduce((s,e)=>s+Number(e.pct),0);
  const over=tot > 100; 
  const cl=Math.min(tot,100);

  let wc = "transparent";
  if (tot >= 100) wc = "rgba(239, 68, 68, 0.8)"; 
  else if (tot >= 75) wc = "rgba(234, 88, 12, 0.8)"; 
  else if (tot >= 50) wc = "rgba(245, 158, 11, 0.7)"; 
  else if (tot > 0) wc = "rgba(34, 197, 94, 0.7)"; 

  return(
    <div style={{width:80,height:54,borderRadius:10,overflow:"hidden",position:"relative",background:"rgba(255,255,255,.45)",border:`1px solid ${over?"rgba(239,68,68,.35)":"rgba(255,255,255,.75)"}`,boxShadow:"0 2px 8px rgba(99,102,241,.05)"}}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${cl}%`,background:wc,transition:"height .5s cubic-bezier(.34,1.56,.64,1)",borderRadius:"0 0 9px 9px"}}>
        {tot>0&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"rgba(255,255,255,.35)",borderRadius:1}}/>}
      </div>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
        <div style={{fontSize:12,fontWeight:700,color:tot>40?"#fff":"#1e293b",textShadow:tot>40?"0 1px 3px rgba(0,0,0,.15)":"none"}}>
          {tot===0?"—":`${tot}%`}
        </div>
        {act.length>0&&(
          <div style={{display:"flex",gap:3}}>
            {act.slice(0,4).map((e,i)=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:getColor(e.project),opacity:tot>40?.85:.65}}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dial ──
function Dial({offset, setOffset, label}){
  const ref=useRef(null); const sx=useRef(null); const so=useRef(null);
  function pd(e){sx.current=e.clientX;so.current=offset;ref.current?.setPointerCapture(e.pointerId);}
  function pm(e){if(sx.current===null)return;const dx=e.clientX-sx.current;const d=Math.round(-dx/44);const n=so.current+d;if(n!==offset)setOffset(n);}
  function pu(){sx.current=null;}
  
  return(
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 20px 8px"}}>
      <div style={{display:"flex", alignItems:"center", gap:16}}>
        <button onClick={()=>setOffset(w=>w-4)} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.55)",border:"1px solid rgba(255,255,255,.8)",cursor:"pointer",color:"#6366f1",fontSize:18,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(99,102,241,.1)"}}>‹</button>
        
        <div ref={ref} onPointerDown={pd} onPointerMove={pm} onPointerUp={pu}
          style={{width:260,height:44,borderRadius:22,overflow:"hidden",position:"relative",background:"rgba(255,255,255,.35)",border:"1px solid rgba(255,255,255,.8)",boxShadow:"inset 0 2px 8px rgba(99,102,241,.07)",cursor:"grab",userSelect:"none",touchAction:"none"}}>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
            {[-2,-1,0,1,2].map(i=><div key={i} style={{width:1.5,height:i===0?24:i===Math.abs(i)?14:10,borderRadius:1,background:i===0?"rgba(99,102,241,.7)":"rgba(99,102,241,.18)"}}/>)}
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#4338ca"}}>{label}</div>
          </div>
        </div>

        <button onClick={()=>setOffset(w=>w+4)} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.55)",border:"1px solid rgba(255,255,255,.8)",cursor:"pointer",color:"#6366f1",fontSize:18,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(99,102,241,.1)"}}>›</button>
      </div>
      
      <div style={{height: 18, marginTop: 4}}>
        {offset !== 0 && (
          <button onClick={() => setOffset(0)} style={{background:"transparent", border:"none", fontSize:10, color:"#6366f1", cursor:"pointer", fontWeight:600, textDecoration:"underline"}}>
            ← Back to today
          </button>
        )}
      </div>
    </div>
  );
}

// ── Edit modal ──
function EditModal({person,fn,entries,onSave,onClose,onDelete,projects,getColor}){
  const [local,setLocal]=useState(entries.map(e=>({...e})));
  const add=()=>setLocal(p=>[...p,{project:projects[0],pct:50,start:APR1,end:dStr(addW(new Date(APR1),8))}]);
  const rm=i=>setLocal(p=>p.filter((_,j)=>j!==i));
  const upd=(i,f,v)=>setLocal(p=>p.map((e,j)=>j===i?{...e,[f]:f==="pct"?Math.min(100,Math.max(0,Number(v)||0)):v}:e));
  const periods=get4W(new Date()); const wt=periods.map(w=>allocW(local,w)); const mx=Math.max(...wt,0); const err=mx>100;
  
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(99,102,241,.07)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fi .2s ease"}} onClick={onClose}>
      <div className="glass" style={{borderRadius:20,padding:26,width:490,maxHeight:"88vh",overflowY:"auto",animation:"su .22s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:"#1e293b"}}>{person}</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{fn}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.8)",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#64748b",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,background:"rgba(99,102,241,.04)",borderRadius:12,padding:10,marginBottom:18,border:"1px solid rgba(99,102,241,.07)"}}>
          {periods.map((w,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:"#94a3b8",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{pLabel(w)}</div>
              <div style={{height:32,borderRadius:7,overflow:"hidden",position:"relative",background:"rgba(255,255,255,.5)",border:"1px solid rgba(255,255,255,.8)"}}>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${Math.min(wt[i],100)}%`,background:wt[i]>100?"rgba(239,68,68,.5)":wt[i]>=80?"rgba(99,102,241,.5)":"rgba(99,102,241,.22)",transition:"height .3s"}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:wt[i]>58?"#fff":"#1e293b"}}>{wt[i]||"—"}{wt[i]>0?"%":""}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:12}}>
          {local.map((entry,i)=>(
            <div key={i} className="glassd" style={{borderRadius:12,padding:13}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:getColor(entry.project),flexShrink:0}}/>
                <select value={entry.project} onChange={e=>upd(i,"project",e.target.value)} className="ginput" style={{flex:1,padding:"6px 9px",fontSize:13}}>
                  {projects.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" min="0" max="100" step="5" value={entry.pct} onChange={e=>upd(i,"pct",e.target.value)} className="ginput" style={{width:60,padding:"6px 8px",fontSize:13,textAlign:"right"}}/>
                <span style={{fontSize:11,color:"#94a3b8"}}>%</span>
                <button onClick={()=>rm(i)} style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.15)",borderRadius:7,color:"#ef4444",cursor:"pointer",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {["start","end"].map(f=>(
                  <div key={f}>
                    <div style={{fontSize:9,color:"#94a3b8",marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>{f} date</div>
                    <input type="date" value={entry[f]} onChange={e=>upd(i,f,e.target.value)} className="ginput" style={{width:"100%",padding:"6px 8px",fontSize:12}}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={add} className="glassd" style={{width:"100%",border:"1.5px dashed rgba(99,102,241,.28)",borderRadius:11,padding:"8px",color:"#6366f1",cursor:"pointer",fontSize:13,marginBottom:12,fontFamily:"inherit"}}>+ Add assignment</button>
        {err&&<div style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.18)",borderRadius:9,padding:"9px 13px",fontSize:12,color:"#dc2626",marginBottom:11}}>⚠ Exceeds 100%. Please adjust.</div>}
        
        {/* Changed button layout to include Delete Person */}
        <div style={{display:"flex",gap:9,justifyContent:"space-between", alignItems:"center"}}>
          <button onClick={()=>{ if(window.confirm(`Are you sure you want to delete ${person} from the team?`)) onDelete(person, fn); }} className="glassd" style={{background:"rgba(239,68,68,.05)", border:"1px solid rgba(239,68,68,.2)", borderRadius:9,padding:"8px 16px",color:"#ef4444",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Delete Person</button>
          
          <div style={{display:"flex",gap:9}}>
            <button onClick={onClose} className="glassd" style={{borderRadius:9,padding:"8px 16px",color:"#64748b",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Cancel</button>
            <button onClick={()=>{if(!err)onSave(local);}} disabled={err} style={{background:err?"rgba(99,102,241,.1)":"rgba(99,102,241,.85)",backdropFilter:"blur(8px)",border:"1px solid rgba(99,102,241,.3)",borderRadius:9,padding:"8px 20px",color:err?"#a5b4fc":"#fff",cursor:err?"not-allowed":"pointer",fontSize:13,fontWeight:600}}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add project modal ──
function AddProjectModal({onAdd,onClose,existing}){
  const [name,setName]=useState(""); const [color,setColor]=useState(CPOOL[0]);
  const t=name.trim().toUpperCase(); const ex=existing.includes(t);
  const allColors=[...Object.values(DEFAULT_COLORS).slice(0,8),...CPOOL.slice(0,6)];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(99,102,241,.07)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fi .2s ease"}} onClick={onClose}>
      <div className="glass" style={{borderRadius:20,padding:26,width:340,animation:"su .22s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>New Project</div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:18}}>Short code, e.g. ORBIT, NOVA, PULSE</div>
        <input value={name} onChange={e=>setName(e.target.value.toUpperCase())} placeholder="PROJECT CODE" className="ginput" style={{width:"100%",padding:"10px 13px",fontSize:14,marginBottom:7,letterSpacing:".06em"}}/>
        {ex&&<div style={{fontSize:11,color:"#ef4444",marginBottom:8}}>Already exists.</div>}
        <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase",letterSpacing:".05em"}}>Colour</div>
        <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap"}}>
          {allColors.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${color===c?"#1e293b":"transparent"}`,boxShadow:color===c?"0 0 0 2px rgba(255,255,255,.8)":"none",transform:color===c?"scale(1.18)":"scale(1)",transition:"transform .12s"}}/>)}
        </div>
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button onClick={onClose} className="glassd" style={{borderRadius:9,padding:"8px 15px",color:"#64748b",cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={()=>{if(t&&!ex){onAdd(t,color);onClose();}}} disabled={!t||ex} style={{background:!t||ex?"rgba(99,102,241,.1)":"rgba(99,102,241,.85)",border:"1px solid rgba(99,102,241,.3)",borderRadius:9,padding:"8px 18px",color:!t||ex?"#a5b4fc":"#fff",cursor:!t||ex?"not-allowed":"pointer",fontSize:13,fontWeight:600}}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Member Modal ──
function AddMemberModal({onAdd, onClose, teams}){
  const [name, setName] = useState("");
  const [team, setTeam] = useState(teams[0]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(99,102,241,.07)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fi .2s ease"}} onClick={onClose}>
      <div className="glass" style={{borderRadius:20,padding:26,width:340,animation:"su .22s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:18}}>Add New Member</div>
        <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>Full Name</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Doe" className="ginput" style={{width:"100%",padding:"10px 13px",fontSize:14,marginBottom:15}}/>
        <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>Assign to Team</div>
        <select value={team} onChange={e=>setTeam(e.target.value)} className="ginput" style={{width:"100%",padding:"10px 13px",fontSize:14,marginBottom:20}}>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button onClick={onClose} className="glassd" style={{borderRadius:9,padding:"8px 15px",color:"#64748b",cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={()=>{if(name.trim()){onAdd(name.trim(), team); onClose();}}} disabled={!name.trim()} style={{background:"rgba(99,102,241,.85)",border:"1px solid rgba(99,102,241,.3)",borderRadius:9,padding:"8px 18px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Resource to Project Modal ──
function AddResourceToProjectModal({project, onClose, onSave, allPeople, allocations}){
  const avail = allPeople.filter(p => !(allocations[p.name]||[]).some(e => e.project === project));
  
  const [person, setPerson] = useState(avail.length ? avail[0].name : "");
  const [pct, setPct] = useState(50);
  const [start, setStart] = useState(APR1);
  const [end, setEnd] = useState(dStr(addW(new Date(APR1), 8)));

  if(avail.length === 0){
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(99,102,241,.07)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
        <div className="glass" style={{borderRadius:20,padding:26,width:340}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:10}}>All Assigned</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Every team member is already assigned to {project}. To edit their allocation, click their name in the project list.</div>
          <button onClick={onClose} className="glassd" style={{width:"100%",borderRadius:9,padding:"8px",color:"#1e293b",cursor:"pointer",fontSize:13,fontWeight:600}}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(99,102,241,.07)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,animation:"fi .2s ease"}} onClick={onClose}>
      <div className="glass" style={{borderRadius:20,padding:26,width:340,animation:"su .22s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>Add Resource</div>
        <div style={{fontSize:12,color:"#6366f1",marginBottom:18,fontWeight:600}}>Project: {project}</div>
        
        <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>Select Member</div>
        <select value={person} onChange={e=>setPerson(e.target.value)} className="ginput" style={{width:"100%",padding:"10px 13px",fontSize:13,marginBottom:15}}>
          {avail.map(p => <option key={p.name} value={p.name}>{p.name} ({p.fn})</option>)}
        </select>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:15}}>
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>Allocation %</div>
            <input type="number" min="0" max="100" step="5" value={pct} onChange={e=>setPct(e.target.value)} className="ginput" style={{width:"100%",padding:"10px 13px",fontSize:13}}/>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <div>
            <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>Start</div>
            <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="ginput" style={{width:"100%",padding:"10px 8px",fontSize:12}}/>
          </div>
          <div>
            <div style={{fontSize:9,color:"#94a3b8",marginBottom:7,textTransform:"uppercase"}}>End</div>
            <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="ginput" style={{width:"100%",padding:"10px 8px",fontSize:12}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
          <button onClick={onClose} className="glassd" style={{borderRadius:9,padding:"8px 15px",color:"#64748b",cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={()=>{onSave(person, {project, pct:Number(pct)||0, start, end}); onClose();}} style={{background:"rgba(99,102,241,.85)",border:"1px solid rgba(99,102,241,.3)",borderRadius:9,padding:"8px 18px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Add to Project</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function Dashboard(){
  const [projects, setProjects] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [pColors, setPColors] = useState({});
  const [functions, setFunctions] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('planner_state')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data) {
        const loadedProjects = data.projects?.length > 0 ? data.projects : DEFAULT_PROJECTS;
        const loadedAllocations = Object.keys(data.allocations || {}).length > 0 ? data.allocations : buildSeed();
        const loadedColors = Object.keys(data.p_colors || {}).length > 0 ? data.p_colors : DEFAULT_COLORS;
        const loadedFunctions = Object.keys(data.functions || {}).length > 0 ? data.functions : INITIAL_FUNCTIONS;

        setProjects(loadedProjects);
        setAllocations(loadedAllocations);
        setPColors(loadedColors);
        setFunctions(loadedFunctions);

        if (!data.projects?.length) {
            await supabase.from('planner_state').update({
                projects: loadedProjects, allocations: loadedAllocations, p_colors: loadedColors, functions: loadedFunctions
            }).eq('id', 1);
        }
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Master sync function
  async function syncToDatabase(newProjects, newAllocations, newColors, newFunctions) {
    const { error } = await supabase
      .from('planner_state')
      .update({
        projects: newProjects,
        allocations: newAllocations,
        p_colors: newColors,
        functions: newFunctions
      })
      .eq('id', 1);
      
    if (error) console.error("Error syncing to DB:", error);
  }

  const [timeView, setTimeView] = useState("weekly"); 
  const [offset, setOffset] = useState(0); 
  const [search,setSearch]=useState("");
  const [filterFn,setFilterFn]=useState(null);
  const [filterProj,setFilterProj]=useState(null);
  const [view,setView]=useState("team");
  
  const [editing,setEditing]=useState(null);
  const [addingProj,setAddingProj]=useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [addingResourceToProj, setAddingResourceToProj] = useState(null);

  const anchor=useMemo(()=>{
    if(timeView === "weekly") return addDays(new Date(), offset*7);
    const d = new Date(); d.setMonth(d.getMonth() + offset); return d;
  },[offset, timeView]);

  const periods=useMemo(()=>timeView === "weekly" ? get4W(anchor) : get4M(anchor), [anchor, timeView]);
  const allPeople=useMemo(()=>Object.entries(functions).flatMap(([fn,pp])=>pp.map(n=>({name:n,fn}))), [functions]);
  const getColor=useCallback(p=>pColors[p]||DEFAULT_COLORS[p]||CPOOL[projects.indexOf(p)%CPOOL.length],[pColors,projects]);

  const kpis=useMemo(()=>{
    let over=0,under=0,un=0,ok=0;
    allPeople.forEach(p=>{
      const mx=Math.max(...periods.map(w=>allocW(allocations[p.name]||[],w)),0);
      if(mx>100)over++; else if(mx===0)un++; else if(mx<50)under++; else ok++;
    });
    return{over,under,unassigned:un,ok};
  },[allocations,periods,allPeople]);

  const dialLabel=useMemo(()=>{
    if(timeView === "weekly"){
      return [...new Set(periods.map(p=>p.start.toLocaleDateString("en-GB",{month:"short",year:"numeric"})))].join(" · ");
    } else {
      return [...new Set(periods.map(p=>p.start.getFullYear()))].join(" · ");
    }
  },[periods, timeView]);

  const baseFilteredPeople = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allPeople.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const teamMatch = p.fn.toLowerCase().includes(q);
      const matchSearch = !q || nameMatch || teamMatch;
      const matchTeam = !filterFn || p.fn === filterFn;
      const matchProj = !filterProj || (allocations[p.name] || []).some(e => e.project === filterProj);
      return matchSearch && matchTeam && matchProj;
    });
  }, [search, filterFn, filterProj, allocations, allPeople]);

  const teamViewData = useMemo(() => {
    return Object.entries(functions).map(([fn]) => {
      return { fn, people: baseFilteredPeople.filter(p => p.fn === fn).map(p => p.name) };
    }).filter(t => t.people.length > 0);
  }, [functions, baseFilteredPeople]);

  // --- ACTIONS WITH SUPABASE SYNC ---
  function saveAlloc(name, entries){
    const newAlloc = {...allocations, [name]: entries};
    setAllocations(newAlloc);
    syncToDatabase(projects, newAlloc, pColors, functions);
    setEditing(null);
  }
  
  function addProject(name, color){
    const newProj = [...projects, name];
    const newColors = {...pColors, [name]: color};
    setProjects(newProj);
    setPColors(newColors);
    syncToDatabase(newProj, allocations, newColors, functions);
  }

  function deleteProject(targetProject) {
    const newProjects = projects.filter(p => p !== targetProject);
    const newColors = { ...pColors };
    delete newColors[targetProject];

    const newAllocations = { ...allocations };
    Object.keys(newAllocations).forEach(person => {
      newAllocations[person] = newAllocations[person].filter(e => e.project !== targetProject);
    });

    setProjects(newProjects);
    setPColors(newColors);
    setAllocations(newAllocations);
    syncToDatabase(newProjects, newAllocations, newColors, functions);
  }
  
  function addMember(name, team){
    const newFuncs = {...functions, [team]: [...(functions[team] || []), name]};
    setFunctions(newFuncs);
    syncToDatabase(projects, allocations, pColors, newFuncs);
  }

  function deleteMember(targetMember, targetTeam) {
    const newFunctions = { ...functions };
    if (newFunctions[targetTeam]) {
      newFunctions[targetTeam] = newFunctions[targetTeam].filter(name => name !== targetMember);
    }

    const newAllocations = { ...allocations };
    delete newAllocations[targetMember];

    setFunctions(newFunctions);
    setAllocations(newAllocations);
    syncToDatabase(projects, newAllocations, pColors, newFunctions);
    setEditing(null); 
  }

  function deleteTeam(targetTeam) {
    if(!window.confirm(`Are you sure you want to delete the entire "${targetTeam}" team? This will permanently remove all its members.`)) return;

    const newFunctions = { ...functions };
    const membersToRemove = newFunctions[targetTeam] || [];
    delete newFunctions[targetTeam];

    const newAllocations = { ...allocations };
    membersToRemove.forEach(member => {
      delete newAllocations[member];
    });

    setFunctions(newFunctions);
    setAllocations(newAllocations);
    syncToDatabase(projects, newAllocations, pColors, newFunctions);
  }
  
  function handleAddResourceToProject(personName, entry){
    const existing = allocations[personName] || [];
    const newAlloc = {...allocations, [personName]: [...existing, entry]};
    setAllocations(newAlloc);
    syncToDatabase(projects, newAlloc, pColors, functions);
  }

  if (loading) {
    return <div style={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#dde8ff"}}>Loading Planner...</div>;
  }

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#dde8ff 0%,#eedeff 45%,#d9f0ff 100%)"}}>
      <style>{STYLE}</style>

      {/* HEADER */}
      <div className="glass" style={{padding:"14px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,borderRadius:0,borderLeft:"none",borderRight:"none",borderTop:"none"}}>
        <div>
          <div style={{fontSize:19,fontWeight:700,color:"#1e293b",letterSpacing:"-.01em"}}>Resource Planner</div>
          <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{allPeople.length} people · {projects.length} projects</div>
        </div>
        <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search member or team…" className="ginput" style={{padding:"7px 12px",fontSize:13,width:180}}/>
          <select value={filterFn||""} onChange={e=>setFilterFn(e.target.value||null)} className="ginput" style={{padding:"7px 10px",fontSize:12,cursor:"pointer"}}>
            <option value="">All teams</option>
            {Object.keys(functions).map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          <div className="glassd" style={{display:"flex",borderRadius:11,padding:3,gap:2}}>
            {[{v:"team",l:"👥 Team"},{v:"project",l:"📁 Project"}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"rgba(99,102,241,.82)":"transparent",border:"none",borderRadius:8,padding:"6px 13px",color:view===v?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",transition:"all .18s"}}>{l}</button>
            ))}
          </div>
          <button onClick={()=>setAddingMember(true)} style={{background:"rgba(255,255,255,.6)", border:"1px solid rgba(99,102,241,.2)", borderRadius:11,padding:"8px 15px",color:"#6366f1",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Member</button>
          <button onClick={()=>setAddingProj(true)} style={{background:"rgba(99,102,241,.82)",backdropFilter:"blur(8px)",border:"1px solid rgba(99,102,241,.3)",borderRadius:11,padding:"8px 15px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>+ Project</button>
        </div>
      </div>

      <div style={{padding:"18px 26px"}}>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:18}}>
          {[
            {l:"Over-allocated",v:kpis.over,c:"#ef4444",bg:"rgba(239,68,68,.06)",ic:"⚠"},
            {l:"Under-utilised",v:kpis.under,c:"#f59e0b",bg:"rgba(245,158,11,.06)",ic:"↓"},
            {l:"Unassigned",v:kpis.unassigned,c:"#94a3b8",bg:"rgba(148,163,184,.06)",ic:"○"},
            {l:"Optimally loaded",v:kpis.ok,c:"#6366f1",bg:"rgba(99,102,241,.06)",ic:"✓"},
          ].map(k=>(
            <div key={k.l} className="glass" style={{borderRadius:15,padding:"14px 18px",background:k.bg}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:26,fontWeight:700,color:k.c}}>{k.v}</div>
                <div style={{fontSize:18,opacity:.35}}>{k.ic}</div>
              </div>
              <div style={{fontSize:10,color:"#64748b",marginTop:5,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em"}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Project filter pills */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          <button onClick={()=>setFilterProj(null)} className="glassd" style={{borderRadius:20,padding:"4px 13px",border:!filterProj?"1px solid rgba(99,102,241,.45)":"1px solid rgba(255,255,255,.6)",color:!filterProj?"#6366f1":"#94a3b8",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>All Projects</button>
          {projects.map(proj=>(
            <button key={proj} onClick={()=>setFilterProj(filterProj===proj?null:proj)} style={{
              background:filterProj===proj?`${getColor(proj)}16`:"rgba(255,255,255,.38)",
              backdropFilter:"blur(8px)",
              border:`1px solid ${filterProj===proj?getColor(proj)+"55":"rgba(255,255,255,.65)"}`,
              borderRadius:20,padding:"4px 11px",
              color:filterProj===proj?getColor(proj):"#64748b",
              cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:filterProj===proj?600:400,
              display:"flex",alignItems:"center",gap:5,
            }}>
              <span style={{width:6,height:6,borderRadius:"50%",background:getColor(proj)}}/>
              {proj}
            </button>
          ))}
        </div>

        {/* Dial + Timeline headers */}
        <div className="glass" style={{borderRadius:14,marginBottom:6}}>
          <div style={{position:"relative"}}>
            <Dial offset={offset} setOffset={setOffset} label={dialLabel} />
            <div style={{position:"absolute", bottom: 8, right: 14, display:"flex", background:"rgba(255,255,255,.5)", padding: 4, borderRadius: 8}}>
              <button onClick={()=>{setTimeView("weekly"); setOffset(0);}} style={{background: timeView==="weekly"?"#6366f1":"transparent", color: timeView==="weekly"?"#fff":"#64748b", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer"}}>Weekly</button>
              <button onClick={()=>{setTimeView("monthly"); setOffset(0);}} style={{background: timeView==="monthly"?"#6366f1":"transparent", color: timeView==="monthly"?"#fff":"#64748b", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer"}}>Monthly</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"230px 72px repeat(4,88px)",padding:"0 14px 8px",gap:0,alignItems:"center"}}>
            <div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em"}}>Person</div>
            <div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center"}}>Status</div>
            {periods.map((w,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6366f1"}}>{pLabel(w)}</div>
                <div style={{fontSize:8,color:"#cbd5e1"}}>{w.isMonth ? 'Month' : `Wk ${i+1}`}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM VIEW */}
        {view==="team"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {teamViewData.map(({fn,people})=>(
              <div key={fn} className="glass" style={{borderRadius:14,overflow:"hidden"}}>
                
                {/* NEW: Team Delete Button added to the header */}
                <div style={{padding:"7px 14px",background:"rgba(99,102,241,.04)",borderBottom:"1px solid rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:".1em"}}>{fn}</div>
                    <div style={{fontSize:9,color:"#cbd5e1",background:"rgba(99,102,241,.08)",borderRadius:8,padding:"1px 7px"}}>{people.length}</div>
                  </div>
                  <button onClick={(e)=>{ e.stopPropagation(); deleteTeam(fn); }} style={{background:"rgba(239, 68, 68, .08)", border:"1px solid rgba(239, 68, 68, .15)", borderRadius:7, padding:"2px 6px", color:"#ef4444", cursor:"pointer", fontSize:10}}>🗑️</button>
                </div>

                {people.map((name,idx)=>{
                  const entries=allocations[name]||[];
                  const loads=periods.map(w=>allocW(entries,w));
                  const mx=Math.max(...loads,0);
                  const sc=mx>100?"#ef4444":mx>=75?"#ea580c":mx>50?"#f59e0b":mx>0?"#22c55e":"#cbd5e1";
                  const sl=mx>100?"OVER":mx>=75?"FULL":mx>50?"MID":mx>0?"LOW":"—";
                  return(
                    <div key={name} className="rh"
                      onClick={()=>setEditing({name,fn:fn})}
                      style={{display:"grid",gridTemplateColumns:"230px 72px repeat(4,88px)",alignItems:"center",gap:0,padding:"8px 14px",borderBottom:idx<people.length-1?"1px solid rgba(255,255,255,.5)":"none",cursor:"pointer",background:mx>100?"rgba(239,68,68,.03)":"transparent"}}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:mx>100?"rgba(239,68,68,.1)":mx===0?"rgba(203,213,225,.3)":"rgba(99,102,241,.1)",border:`1.5px solid ${mx>100?"rgba(239,68,68,.3)":mx===0?"rgba(203,213,225,.4)":"rgba(99,102,241,.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:mx>100?"#ef4444":mx===0?"#94a3b8":"#6366f1"}}>
                          {name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                        </div>
                        <div style={{fontSize:13,fontWeight:500,color:"#1e293b"}}>{name}</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <span style={{fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:6,background:`${sc}14`,color:sc,border:`1px solid ${sc}28`,letterSpacing:".05em"}}>{sl}</span>
                      </div>
                      {periods.map((w,i)=>(
                        <div key={i} style={{padding:"0 4px"}}>
                          <WaterCell entries={entries} period={w} getColor={getColor}/>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* PROJECT VIEW */}
        {view==="project"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
            {projects.map(proj=>{
              const assigned = baseFilteredPeople
                .filter(p => (allocations[p.name]||[]).some(e => e.project === proj))
                .map(p => p.name);
                
              const wkData = periods.map(w => assigned.filter(pName => (allocations[pName]||[]).some(e => e.project === proj && active(e, w))).length);
              const col=getColor(proj);
              
              if (search && assigned.length === 0) return null;

              return(
                <div key={proj} className="glass" style={{borderRadius:14,overflow:"hidden",borderTop:`3px solid ${col}`}}>
                  <div style={{padding:"13px 16px 12px"}}>
                    
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{proj}</div>
                        <div style={{fontSize:10,color:"#94a3b8"}}>{assigned.length} assigned</div>
                      </div>
                      <div style={{display:"flex", gap:"6px"}}>
                        <button onClick={(e)=>{e.stopPropagation(); setAddingResourceToProj(proj);}} style={{background:"rgba(255,255,255,.6)", border:"1px solid rgba(99,102,241,.2)", borderRadius:7, padding:"4px 10px", color:"#6366f1", cursor:"pointer", fontSize:11, fontWeight:700}}>+ Add</button>
                        <button onClick={(e)=>{
                            e.stopPropagation(); 
                            if(window.confirm(`Are you sure you want to delete ${proj}? This will remove it from everyone's schedule.`)){
                                deleteProject(proj);
                            }
                        }} style={{background:"rgba(239, 68, 68, .08)", border:"1px solid rgba(239, 68, 68, .15)", borderRadius:7, padding:"4px 8px", color:"#ef4444", cursor:"pointer", fontSize:11}}>🗑️</button>
                      </div>
                    </div>
                    
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:13}}>
                      {wkData.map((c,i)=>(
                        <div key={i} style={{textAlign:"center",background:"rgba(255,255,255,.5)",borderRadius:9,padding:"7px 3px",border:"1px solid rgba(255,255,255,.8)"}}>
                          <div style={{fontSize:15,fontWeight:700,color:c===0?"#cbd5e1":col}}>{c||"—"}</div>
                          <div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>{periods[i].isMonth ? 'M' : 'Wk'} {i+1}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {assigned.map(pName=>{
                        const entry=(allocations[pName]||[]).find(e=>e.project===proj);
                        const pFn = allPeople.find(ap => ap.name === pName)?.fn || "";
                        return(
                          <div key={pName} className="rh-proj" onClick={()=>setEditing({name:pName, fn:pFn})} style={{display:"grid",gridTemplateColumns:"24px 1fr 60px 40px",gap:10,alignItems:"center", padding:"5px 6px", margin:"0 -6px"}}>
                            <div style={{width:24,height:24,borderRadius:"50%",background:`${col}18`,border:`1px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:col}}>
                              {pName.split(" ").map(w=>w[0]).slice(0,2).join("")}
                            </div>
                            <div style={{fontSize:13,fontWeight:500,color:"#334155",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pName}</div>
                            <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",textAlign:"right",whiteSpace:"nowrap"}}>{pFn}</div>
                            <div style={{fontSize:13,fontWeight:800,color:col,textAlign:"right"}}>{entry?.pct||0}%</div>
                          </div>
                        );
                      })}
                      {assigned.length===0&&<div style={{fontSize:11,color:"#cbd5e1",textAlign:"center",padding:"10px 0"}}>No resources assigned. Click + Add to assign someone.</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {editing&&<EditModal person={editing.name} fn={editing.fn} entries={allocations[editing.name]||[]} onDelete={(p, f) => deleteMember(p, f)} onSave={e=>saveAlloc(editing.name,e)} onClose={()=>setEditing(null)} projects={projects} getColor={getColor}/>}
      {addingProj&&<AddProjectModal onAdd={addProject} onClose={()=>setAddingProj(false)} existing={projects}/>}
      {addingMember && <AddMemberModal onAdd={addMember} onClose={()=>setAddingMember(false)} teams={Object.keys(functions)} />}
      {addingResourceToProj && <AddResourceToProjectModal project={addingResourceToProj} allPeople={allPeople} allocations={allocations} onSave={handleAddResourceToProject} onClose={()=>setAddingResourceToProj(null)} />}
    </div>
  );
}