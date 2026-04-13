import { useState, useMemo } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2d3e; border-radius: 2px; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor:pointer; }
`;

const FUNCTIONS = {
  "BE Dev":     ["Jahangir","Nabeel","Nabina Poudel","Sharad Raj"],
  "Boss":       ["Stephen"],
  "Design":     ["Sanjana Babu"],
  "FE Dev":     ["Aman","Gaurav Rauthan","Jasjot Singh","Manish Moond","Prathmesh","Priyanshu","Riddhi","Rushikesh"],
  "FS Dev":     ["Vansh"],
  "Full Stack": ["Ankit"],
  "Jr. Design": ["Mohammed Hisham","Sneha Gupta"],
  "Jr. Dev":    ["Mohammed Arfaz"],
  "Ops":        ["Brian"],
  "PM":         ["Caleb","Midhu","Nishala","Roshna"],
  "Pre-sales":  ["Ben"],
  "QA":         ["Deon","Sourabh","Vebeesh"],
  "QC":         ["Jenny","Rebecca","Soso"],
};

const PROJECTS = ["MTF","TL DR","APEST","NSA","BCW","SC","SLINGSHOT","FREQUENCY","HIMALAYAN HAAT","DELIVA","GLASS"];

const PC = {
  "MTF":"#6366f1","TL DR":"#f59e0b","APEST":"#10b981","NSA":"#ef4444",
  "BCW":"#3b82f6","SC":"#8b5cf6","SLINGSHOT":"#ec4899","FREQUENCY":"#14b8a6",
  "HIMALAYAN HAAT":"#f97316","DELIVA":"#84cc16","GLASS":"#06b6d4",
};

const today = new Date();
function dStr(d) { return d.toISOString().slice(0,10); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function addWeeks(d,n){ return addDays(d,n*7); }

const T = dStr(today);

const SEED = {
  "Jahangir":        [{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,8))},{project:"NSA",pct:25,start:T,end:dStr(addWeeks(today,4))},{project:"BCW",pct:25,start:dStr(addWeeks(today,2)),end:dStr(addWeeks(today,10))}],
  "Nabeel":          [{project:"APEST",pct:75,start:T,end:dStr(addWeeks(today,6))},{project:"TL DR",pct:25,start:T,end:dStr(addWeeks(today,4))}],
  "Nabina Poudel":   [{project:"SLINGSHOT",pct:100,start:T,end:dStr(addWeeks(today,12))}],
  "Sharad Raj":      [{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"GLASS",pct:50,start:dStr(addWeeks(today,2)),end:dStr(addWeeks(today,10))}],
  "Stephen":         [{project:"MTF",pct:25,start:T,end:dStr(addWeeks(today,12))},{project:"APEST",pct:25,start:T,end:dStr(addWeeks(today,12))},{project:"NSA",pct:25,start:T,end:dStr(addWeeks(today,8))},{project:"SC",pct:25,start:T,end:dStr(addWeeks(today,8))}],
  "Sanjana Babu":    [{project:"DELIVA",pct:60,start:T,end:dStr(addWeeks(today,8))},{project:"FREQUENCY",pct:40,start:T,end:dStr(addWeeks(today,6))}],
  "Aman":            [{project:"MTF",pct:100,start:T,end:dStr(addWeeks(today,10))}],
  "Gaurav Rauthan":  [{project:"TL DR",pct:50,start:T,end:dStr(addWeeks(today,4))},{project:"BCW",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Jasjot Singh":    [{project:"APEST",pct:50,start:T,end:dStr(addWeeks(today,8))},{project:"HIMALAYAN HAAT",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Manish Moond":    [{project:"SLINGSHOT",pct:75,start:T,end:dStr(addWeeks(today,6))},{project:"SC",pct:25,start:T,end:dStr(addWeeks(today,4))}],
  "Prathmesh":       [{project:"DELIVA",pct:100,start:T,end:dStr(addWeeks(today,8))}],
  "Priyanshu":       [{project:"NSA",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,4))}],
  "Riddhi":          [{project:"FREQUENCY",pct:100,start:T,end:dStr(addWeeks(today,8))}],
  "Rushikesh":       [{project:"GLASS",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"BCW",pct:50,start:T,end:dStr(addWeeks(today,8))}],
  "Vansh":           [{project:"TL DR",pct:100,start:T,end:dStr(addWeeks(today,10))}],
  "Ankit":           [{project:"APEST",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"NSA",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Mohammed Hisham": [{project:"HIMALAYAN HAAT",pct:75,start:T,end:dStr(addWeeks(today,8))},{project:"DELIVA",pct:25,start:T,end:dStr(addWeeks(today,4))}],
  "Sneha Gupta":     [{project:"SC",pct:100,start:T,end:dStr(addWeeks(today,8))}],
  "Mohammed Arfaz":  [{project:"SLINGSHOT",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"FREQUENCY",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Brian":           [{project:"MTF",pct:25,start:T,end:dStr(addWeeks(today,8))},{project:"APEST",pct:25,start:T,end:dStr(addWeeks(today,8))},{project:"BCW",pct:25,start:T,end:dStr(addWeeks(today,8))},{project:"NSA",pct:25,start:T,end:dStr(addWeeks(today,8))}],
  "Caleb":           [{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,12))},{project:"TL DR",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Midhu":           [{project:"APEST",pct:50,start:T,end:dStr(addWeeks(today,8))},{project:"HIMALAYAN HAAT",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Nishala":         [{project:"SLINGSHOT",pct:60,start:T,end:dStr(addWeeks(today,8))},{project:"SC",pct:40,start:T,end:dStr(addWeeks(today,6))}],
  "Roshna":          [{project:"DELIVA",pct:75,start:T,end:dStr(addWeeks(today,8))},{project:"GLASS",pct:25,start:T,end:dStr(addWeeks(today,8))}],
  "Ben":             [{project:"MTF",pct:25,start:T,end:dStr(addWeeks(today,6))},{project:"APEST",pct:25,start:T,end:dStr(addWeeks(today,6))},{project:"NSA",pct:25,start:T,end:dStr(addWeeks(today,4))}],
  "Deon":            [{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,4))},{project:"SLINGSHOT",pct:50,start:T,end:dStr(addWeeks(today,8))}],
  "Sourabh":         [{project:"TL DR",pct:25,start:T,end:dStr(addWeeks(today,4))},{project:"APEST",pct:25,start:T,end:dStr(addWeeks(today,4))},{project:"FREQUENCY",pct:50,start:T,end:dStr(addWeeks(today,8))}],
  "Vebeesh":         [{project:"HIMALAYAN HAAT",pct:100,start:T,end:dStr(addWeeks(today,10))}],
  "Jenny":           [{project:"DELIVA",pct:50,start:T,end:dStr(addWeeks(today,6))},{project:"GLASS",pct:50,start:T,end:dStr(addWeeks(today,6))}],
  "Rebecca":         [{project:"BCW",pct:75,start:T,end:dStr(addWeeks(today,8))},{project:"SC",pct:25,start:T,end:dStr(addWeeks(today,6))}],
  "Soso":            [{project:"MTF",pct:50,start:T,end:dStr(addWeeks(today,4))},{project:"NSA",pct:50,start:T,end:dStr(addWeeks(today,4))}],
};

function getMonday(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const day = x.getDay();
  x.setDate(x.getDate() + (day===0?-6:1-day));
  return x;
}

function get4Weeks(anchor) {
  const mon = getMonday(anchor);
  return Array.from({length:4},(_,i)=>{
    const start = addDays(mon,i*7);
    const end   = addDays(start,6);
    return {start,end};
  });
}

function isActiveInWeek(entry,week) {
  return new Date(entry.start)<=week.end && new Date(entry.end)>=week.start;
}

function allocForWeek(entries,week) {
  return (entries||[]).filter(e=>isActiveInWeek(e,week)).reduce((s,e)=>s+Number(e.pct),0);
}

function weekLabel(w) {
  return w.start.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}

function StatusPill({total}) {
  const cfg = total>100 ? {bg:"rgba(239,68,68,0.15)",color:"#f87171",b:"rgba(239,68,68,0.3)",t:"OVER"}
    : total>=80 ? {bg:"rgba(74,222,128,0.1)",color:"#4ade80",b:"rgba(74,222,128,0.2)",t:"OK"}
    : total>0   ? {bg:"rgba(245,158,11,0.1)",color:"#fbbf24",b:"rgba(245,158,11,0.2)",t:"LOW"}
    :             {bg:"rgba(100,116,139,0.1)",color:"#334155",b:"rgba(100,116,139,0.15)",t:"—"};
  return (
    <span style={{fontSize:10,fontFamily:"JetBrains Mono,monospace",fontWeight:600,padding:"2px 7px",borderRadius:4,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.b}`}}>
      {cfg.t}
    </span>
  );
}

function WeekCell({entries,week}) {
  const active = (entries||[]).filter(e=>isActiveInWeek(e,week));
  const total  = active.reduce((s,e)=>s+Number(e.pct),0);
  const over   = total>100;
  return (
    <div style={{
      width:88,minHeight:50,borderRadius:6,overflow:"hidden",
      background:"#0d1117",border:`1px solid ${over?"rgba(239,68,68,0.35)":"#1a1f2e"}`,
      display:"flex",flexDirection:"column",
    }}>
      <div style={{display:"flex",height:3}}>
        {active.length===0
          ? <div style={{flex:1,background:"#1a1f2e"}}/>
          : active.map((e,i)=><div key={i} style={{flex:e.pct,background:PC[e.project]||"#64748b"}}/>)
        }
      </div>
      <div style={{padding:"5px 7px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        {total===0
          ? <div style={{fontSize:11,color:"#1e2535",textAlign:"center",fontFamily:"JetBrains Mono,monospace"}}>—</div>
          : <>
              <div style={{fontSize:13,fontWeight:700,fontFamily:"JetBrains Mono,monospace",color:over?"#f87171":total>=80?"#e2e8f0":"#94a3b8"}}>{total}%</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:2}}>
                {active.map((e,i)=>(
                  <span key={i} style={{fontSize:8,fontWeight:600,color:PC[e.project]||"#64748b",fontFamily:"JetBrains Mono,monospace"}}>
                    {e.project.length>6?e.project.slice(0,6)+"…":e.project}
                  </span>
                ))}
              </div>
            </>
        }
      </div>
    </div>
  );
}

function EditModal({person,fn,entries,onSave,onClose}) {
  const [local,setLocal] = useState(entries.map(e=>({...e})));

  function add()    { setLocal(p=>[...p,{project:PROJECTS[0],pct:50,start:T,end:dStr(addWeeks(today,4))}]); }
  function remove(i){ setLocal(p=>p.filter((_,j)=>j!==i)); }
  function upd(i,f,v){ setLocal(p=>p.map((e,j)=>j===i?{...e,[f]:f==="pct"?Math.min(100,Math.max(0,Number(v)||0)):v}:e)); }

  const weeks = get4Weeks(today);
  const weekTotals = weeks.map(w=>allocForWeek(local,w));
  const maxTotal   = Math.max(...weekTotals,0);
  const hasError   = maxTotal>100;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div style={{background:"#0d1117",border:"1px solid #1e2535",borderRadius:16,padding:26,width:500,maxHeight:"85vh",overflowY:"auto",fontFamily:"Instrument Sans,sans-serif"}} onClick={e=>e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#f1f5f9",fontFamily:"Syne,sans-serif"}}>{person}</div>
            <div style={{fontSize:11,color:"#334155",marginTop:2}}>{fn}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#334155",fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        {/* 4-week preview */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,background:"#070b12",borderRadius:10,padding:12,marginBottom:18}}>
          {weeks.map((w,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:"#334155",marginBottom:3,fontFamily:"JetBrains Mono,monospace"}}>{weekLabel(w)}</div>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"JetBrains Mono,monospace",color:weekTotals[i]>100?"#f87171":weekTotals[i]>=80?"#4ade80":weekTotals[i]>0?"#fbbf24":"#2a3040"}}>
                {weekTotals[i]||"—"}{weekTotals[i]>0?"%":""}
              </div>
            </div>
          ))}
        </div>

        {/* Assignment rows */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {local.map((entry,i)=>(
            <div key={i} style={{background:"#070b12",borderRadius:10,padding:12,border:"1px solid #1a1f2e"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:PC[entry.project]||"#64748b",flexShrink:0}}/>
                <select value={entry.project} onChange={e=>upd(i,"project",e.target.value)} style={{flex:1,background:"#0d1117",border:"1px solid #1e2535",borderRadius:6,padding:"5px 8px",color:"#e2e8f0",fontSize:13,outline:"none"}}>
                  {PROJECTS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" min="0" max="100" step="5" value={entry.pct} onChange={e=>upd(i,"pct",e.target.value)}
                  style={{width:60,background:"#0d1117",border:"1px solid #1e2535",borderRadius:6,padding:"5px 8px",color:"#e2e8f0",fontSize:13,textAlign:"right",outline:"none",fontFamily:"JetBrains Mono,monospace"}}/>
                <span style={{fontSize:11,color:"#334155"}}>%</span>
                <button onClick={()=>remove(i)} style={{background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:16}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["start","end"].map(f=>(
                  <div key={f}>
                    <div style={{fontSize:9,color:"#334155",marginBottom:3,fontFamily:"JetBrains Mono,monospace",textTransform:"uppercase",letterSpacing:"0.06em"}}>{f} date</div>
                    <input type="date" value={entry[f]} onChange={e=>upd(i,f,e.target.value)}
                      style={{width:"100%",background:"#0d1117",border:"1px solid #1e2535",borderRadius:6,padding:"5px 8px",color:"#94a3b8",fontSize:12,outline:"none"}}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={add} style={{width:"100%",background:"transparent",border:"1px dashed #1e2535",borderRadius:10,padding:"8px",color:"#334155",cursor:"pointer",fontSize:13,marginBottom:14,fontFamily:"Instrument Sans,sans-serif"}}>
          + Add project assignment
        </button>

        {hasError && (
          <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#fca5a5",marginBottom:12}}>
            ⚠ One or more weeks exceed 100%. Adjust dates or percentages.
          </div>
        )}

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e2535",borderRadius:8,padding:"8px 16px",color:"#475569",cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={()=>{if(!hasError)onSave(local);}} disabled={hasError} style={{background:hasError?"#0d1117":"#6366f1",border:"none",borderRadius:8,padding:"8px 20px",color:hasError?"#334155":"#fff",cursor:hasError?"not-allowed":"pointer",fontSize:13,fontWeight:600,fontFamily:"Syne,sans-serif"}}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [allocations,setAllocations] = useState(SEED);
  const [editing,setEditing]         = useState(null);
  const [weekOffset,setWeekOffset]   = useState(0);
  const [search,setSearch]           = useState("");
  const [filterFn,setFilterFn]       = useState(null);

  const anchorDate = useMemo(()=>addDays(today,weekOffset*7),[weekOffset]);
  const weeks      = useMemo(()=>get4Weeks(anchorDate),[anchorDate]);
  const allPeople  = useMemo(()=>Object.entries(FUNCTIONS).flatMap(([fn,pp])=>pp.map(name=>({name,fn}))),[]);

  const kpis = useMemo(()=>{
    let over=0,under=0,unassigned=0,ok=0;
    allPeople.forEach(p=>{
      const entries=allocations[p.name]||[];
      const loads=weeks.map(w=>allocForWeek(entries,w));
      const mx=Math.max(...loads,0), mn=Math.min(...loads);
      if(mx>100) over++;
      else if(mx===0) unassigned++;
      else if(mn<50) under++;
      else ok++;
    });
    return {over,under,unassigned,ok};
  },[allocations,weeks]);

  const filtered = useMemo(()=>{
    const q=search.toLowerCase();
    return Object.entries(FUNCTIONS).map(([fn,people])=>({
      fn,
      people:people.filter(name=>{
        const ms=!q||name.toLowerCase().includes(q)||fn.toLowerCase().includes(q);
        const mf=!filterFn||fn===filterFn;
        return ms&&mf;
      })
    })).filter(({people})=>people.length>0);
  },[search,filterFn]);

  const monthLabel = useMemo(()=>{
    const ms=[...new Set(weeks.map(w=>w.start.toLocaleDateString("en-GB",{month:"long",year:"numeric"})))];
    return ms.join(" / ");
  },[weeks]);

  function save(name,newEntries){
    setAllocations(p=>({...p,[name]:newEntries}));
    setEditing(null);
  }

  return (
    <div style={{minHeight:"100vh",background:"#07080f",fontFamily:"Instrument Sans,sans-serif",color:"#e2e8f0"}}>
      <style>{STYLE}</style>

      {/* HEADER */}
      <div style={{padding:"16px 26px",borderBottom:"1px solid #0f1520",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,background:"rgba(7,8,15,0.96)",backdropFilter:"blur(12px)"}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:"#f8fafc",fontFamily:"Syne,sans-serif",letterSpacing:"-0.02em"}}>Resource Planner</div>
          <div style={{fontSize:10,color:"#2a3040",marginTop:1,fontFamily:"JetBrains Mono,monospace"}}>{allPeople.length} people · {PROJECTS.length} projects · weekly view</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:"#0d1117",border:"1px solid #1a1f2e",borderRadius:8,padding:"7px 12px",color:"#e2e8f0",fontSize:12,width:160,outline:"none"}}/>
          <select value={filterFn||""} onChange={e=>setFilterFn(e.target.value||null)} style={{background:"#0d1117",border:"1px solid #1a1f2e",borderRadius:8,padding:"7px 10px",color:filterFn?"#e2e8f0":"#334155",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="">All functions</option>
            {Object.keys(FUNCTIONS).map(fn=><option key={fn} value={fn}>{fn}</option>)}
          </select>
        </div>
      </div>

      <div style={{padding:"20px 26px"}}>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
          {[
            {label:"Over-allocated",val:kpis.over,color:"#f87171",icon:"⚠"},
            {label:"Under-utilised",val:kpis.under,color:"#fbbf24",icon:"↓"},
            {label:"Unassigned",val:kpis.unassigned,color:"#334155",icon:"○"},
            {label:"Optimally loaded",val:kpis.ok,color:"#4ade80",icon:"✓"},
          ].map(k=>(
            <div key={k.label} style={{background:"#0d1117",border:"1px solid #1a1f2e",borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:26,fontWeight:800,color:k.color,fontFamily:"JetBrains Mono,monospace"}}>{k.val}</div>
                <div style={{fontSize:16,opacity:0.4}}>{k.icon}</div>
              </div>
              <div style={{fontSize:10,color:"#334155",marginTop:4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Week nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d1117",borderRadius:12,padding:"11px 18px",marginBottom:4,border:"1px solid #1a1f2e"}}>
          <button onClick={()=>setWeekOffset(w=>w-4)} style={{background:"#0d1117",border:"1px solid #1a1f2e",borderRadius:8,padding:"6px 14px",color:"#475569",cursor:"pointer",fontSize:12}}>← Prev</button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",fontFamily:"Syne,sans-serif"}}>{monthLabel}</div>
            <div style={{fontSize:10,color:"#2a3040",fontFamily:"JetBrains Mono,monospace",marginTop:1}}>
              4-week rolling window
              {weekOffset!==0&&<span style={{color:"#6366f1",marginLeft:8,cursor:"pointer"}} onClick={()=>setWeekOffset(0)}>↺ Back to today</span>}
            </div>
          </div>
          <button onClick={()=>setWeekOffset(w=>w+4)} style={{background:"#0d1117",border:"1px solid #1a1f2e",borderRadius:8,padding:"6px 14px",color:"#475569",cursor:"pointer",fontSize:12}}>Next →</button>
        </div>

        {/* Main table */}
        <div style={{background:"#0a0d16",border:"1px solid #1a1f2e",borderRadius:12,overflow:"hidden",marginBottom:26}}>
          {/* Header row */}
          <div style={{display:"grid",gridTemplateColumns:"190px 72px repeat(4,96px)",background:"#070b12",borderBottom:"1px solid #1a1f2e",padding:"9px 16px",gap:0}}>
            <div style={{fontSize:9,color:"#2a3040",fontFamily:"JetBrains Mono,monospace",textTransform:"uppercase",letterSpacing:"0.09em"}}>Person</div>
            <div style={{fontSize:9,color:"#2a3040",fontFamily:"JetBrains Mono,monospace",textTransform:"uppercase",letterSpacing:"0.09em",textAlign:"center"}}>Now</div>
            {weeks.map((w,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#475569",fontFamily:"JetBrains Mono,monospace"}}>{weekLabel(w)}</div>
                <div style={{fontSize:8,color:"#1e2535",fontFamily:"JetBrains Mono,monospace"}}>Week {i+1}</div>
              </div>
            ))}
          </div>

          {filtered.map(({fn,people})=>(
            <div key={fn}>
              <div style={{padding:"5px 16px",background:"#070b12",borderTop:"1px solid #1a1f2e",borderBottom:"1px solid #1a1f2e",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,fontWeight:700,color:"#2a3040",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"JetBrains Mono,monospace"}}>{fn}</span>
                <span style={{fontSize:9,color:"#1a1f2e",fontFamily:"JetBrains Mono,monospace"}}>{people.length}</span>
              </div>
              {people.map((name,idx)=>{
                const entries=allocations[name]||[];
                const loads=weeks.map(w=>allocForWeek(entries,w));
                const maxLoad=Math.max(...loads,0);
                const fnName=Object.entries(FUNCTIONS).find(([,pp])=>pp.includes(name))?.[0]||"";
                return (
                  <div key={name}
                    onClick={()=>setEditing({name,fn:fnName})}
                    style={{display:"grid",gridTemplateColumns:"190px 72px repeat(4,96px)",alignItems:"center",gap:0,padding:"7px 16px",borderBottom:idx<people.length-1?"1px solid #0d1117":"none",cursor:"pointer",transition:"background 0.1s",background:maxLoad>100?"rgba(239,68,68,0.03)":"transparent"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#0d1117"}
                    onMouseLeave={e=>e.currentTarget.style.background=maxLoad>100?"rgba(239,68,68,0.03)":"transparent"}
                  >
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,background:maxLoad>100?"rgba(239,68,68,0.1)":maxLoad===0?"#0d1117":"rgba(99,102,241,0.1)",border:`1px solid ${maxLoad>100?"#ef444433":maxLoad===0?"#1a1f2e":"#6366f133"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:maxLoad>100?"#f87171":maxLoad===0?"#2a3040":"#818cf8",fontFamily:"JetBrains Mono,monospace"}}>
                        {name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                      </div>
                      <div style={{fontSize:12,fontWeight:500,color:"#cbd5e1"}}>{name}</div>
                    </div>
                    <div style={{textAlign:"center"}}><StatusPill total={maxLoad}/></div>
                    {weeks.map((w,i)=>(
                      <div key={i} style={{padding:"0 4px"}}><WeekCell entries={entries} week={w}/></div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Project summary cards */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:"#2a3040",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"JetBrains Mono,monospace",marginBottom:12}}>Project headcount — 4 weeks</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {PROJECTS.map(proj=>{
              const weekData=weeks.map(w=>{
                const count=allPeople.filter(p=>(allocations[p.name]||[]).some(e=>e.project===proj&&isActiveInWeek(e,w))).length;
                return count;
              });
              return (
                <div key={proj} style={{background:"#0d1117",border:"1px solid #1a1f2e",borderTop:`2px solid ${PC[proj]}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",fontFamily:"Syne,sans-serif",marginBottom:10}}>{proj}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                    {weekData.map((c,i)=>(
                      <div key={i} style={{textAlign:"center"}}>
                        <div style={{fontSize:14,fontWeight:700,fontFamily:"JetBrains Mono,monospace",color:c===0?"#1e2535":PC[proj]}}>{c||"—"}</div>
                        <div style={{fontSize:8,color:"#2a3040",fontFamily:"JetBrains Mono,monospace"}}>W{i+1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editing&&(
        <EditModal person={editing.name} fn={editing.fn} entries={allocations[editing.name]||[]} onSave={e=>save(editing.name,e)} onClose={()=>setEditing(null)}/>
      )}
    </div>
  );
}
