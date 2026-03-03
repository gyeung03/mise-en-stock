import { useState, useEffect, useRef } from "react";

const SB_URL = "https://wzcnkfczkfjmphjzaeea.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y25rZmN6a2ZqbXBoanphZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODE5NDksImV4cCI6MjA4ODA1Nzk0OX0.mkXO4wnFk0l3-j3CIaCL3qoYt7oKvEmCEtm98ABWCvI";
const HEADERS = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Prefer": "return=representation" };

const BG = "#8a78c0";
const CARD = "#fdf0e8";
const DARK = "#3d2f6b";
const ACCENT = "#6c5bb5";
const FREEZE = "#3b82f6";
const ORANGE = "#d97706";

const PANTRY_CATS = ["Broths & Stocks","Canned Beans & Legumes","Canned Fish & Seafood","Canned Meats","Canned Other","Canned Tomatoes","Canned Vegetables","Condiments","Pickled Items","Dairy & Shelf-Stable Milk","Gravies & Meal Sauces","Pasta Sauces","Prepared Meals","Soups","Other"];
const FREEZER_CATS = ["Proteins","Seafood","Vegetables","Meals & Leftovers","Bread & Dough","Fruit","Dairy","Soups & Broths","Other"];

const CAT_COLORS = {
  "Broths & Stocks":"#06b6d4","Canned Beans & Legumes":"#10b981","Canned Fish & Seafood":"#3b82f6",
  "Canned Meats":"#ef4444","Canned Other":"#f59e0b","Canned Tomatoes":"#f43f5e",
  "Canned Vegetables":"#84cc16","Condiments":"#f97316","Pickled Items":"#14b8a6",
  "Dairy & Shelf-Stable Milk":"#ec4899","Gravies & Meal Sauces":"#d97706",
  "Pasta Sauces":"#e879f9","Prepared Meals":"#0ea5e9","Soups":"#6366f1",
  "Proteins":"#ef4444","Vegetables":"#22c55e","Meals & Leftovers":"#8b5cf6",
  "Seafood":"#0ea5e9","Bread & Dough":"#f59e0b","Fruit":"#f43f5e",
  "Dairy":"#ec4899","Soups & Broths":"#06b6d4","Other":"#94a3b8"
};

function QBadge({q}) {
  const bg = q===0?"#ef4444":q===1?"#f97316":q===2?"#eab308":"#22c55e";
  return <span style={{background:bg,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700,minWidth:22,textAlign:"center"}}>{q}</span>;
}

function formatEST(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    timeZone:"America/New_York",month:"numeric",day:"numeric",year:"numeric",
    hour:"numeric",minute:"2-digit",hour12:true
  });
}

async function sbFetch(path, opts={}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {...opts, headers:{...HEADERS,...(opts.headers||{})}});
  if (!res.ok) { const t = await res.text(); throw new Error(t); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function autoCategory(itemName, brand, location, existingCats) {
  const locationCats = location === "freezer" ? FREEZER_CATS : PANTRY_CATS;
  const catList = [...new Set([...existingCats, ...locationCats])].join(", ");
  try {
    const res = await fetch("/api/scan", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        prompt: `Given this ${location} item: "${itemName}" by "${brand}", pick the single best category from this list, or invent a short new one if nothing fits:\n${catList}\n\nReturn ONLY the category name, nothing else.`
      })
    });
    const data = await res.json();
    return data.result.trim();
  } catch(e) { return "Other"; }
}

function EditableField({value, onSave, placeholder, suggestions=[], color}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [showList, setShowList] = useState(false);
  const inputRef = useRef();

  const commit = () => { setEditing(false); setShowList(false); if(val !== value) onSave(val); };

  if(!editing) return (
    <span onClick={()=>{ setVal(value); setEditing(true); setTimeout(()=>inputRef.current?.focus(),50); }}
      style={{cursor:"pointer",borderBottom:`1px dashed ${color}`,color,fontWeight:600,fontSize:12,padding:"1px 2px"}}>
      {value||<span style={{opacity:0.4}}>{placeholder}</span>}
    </span>
  );

  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <input ref={inputRef} value={val}
        onChange={e=>{setVal(e.target.value);setShowList(true);}}
        onBlur={()=>setTimeout(commit,150)}
        onKeyDown={e=>e.key==="Enter"&&commit()}
        style={{fontSize:12,fontWeight:600,padding:"2px 6px",border:`1px solid ${color}`,borderRadius:4,outline:"none",width:140,fontFamily:"inherit"}}
      />
      {showList&&suggestions.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,background:"#fff",border:"1px solid #ddd",borderRadius:6,zIndex:30,maxHeight:140,overflowY:"auto",boxShadow:"0 4px 10px #0002",minWidth:160}}>
          {suggestions.filter(s=>s.toLowerCase().includes(val.toLowerCase())).map(s=>(
            <div key={s} onMouseDown={()=>{setVal(s);setShowList(false);setTimeout(()=>onSave(s),50);}}
              style={{padding:"7px 10px",cursor:"pointer",fontSize:12,borderBottom:"1px solid #f5f5f5"}}
              onMouseEnter={e=>e.target.style.background="#f5eeff"}
              onMouseLeave={e=>e.target.style.background="#fff"}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InventoryView({items, isFreezer, onUpdateQty, onDelete, onEdit, expandedId, setExpandedId, collapsed, toggleCat}) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const accentColor = isFreezer ? FREEZE : ORANGE;
  const catHeaderBg = isFreezer ? "#bfdbfe" : "#f5d9bf";
  const rowBg       = isFreezer ? "#dbeafe" : CARD;
  const expandedBg  = isFreezer ? "#eff6ff" : CARD;
  const minusBtnBg  = isFreezer ? "#bfdbfe" : "#f5d9bf";
  const divider     = isFreezer ? "#bfdbfe" : "#f0e0d0";
  const catList     = isFreezer ? FREEZER_CATS : PANTRY_CATS;

  const inp = {width:"100%",padding:"10px 12px",border:"2px solid #b8aee0",borderRadius:8,fontSize:14,boxSizing:"border-box",background:"#fff",fontFamily:"inherit",outline:"none"};
  const btnS = (bg,color)=>({padding:"10px 18px",background:bg,color:color||"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"});

  const cats = [...new Set(items.map(i=>i.category))].sort();
  const filtered = items.filter(i=>{
    const s=search.toLowerCase();
    return (!s||i.item.toLowerCase().includes(s)||(i.brand||"").toLowerCase().includes(s))
      &&(filterCat==="All"||i.category===filterCat);
  });
  const grouped = filtered.reduce((acc,i)=>{ (acc[i.category]=acc[i.category]||[]).push(i); return acc; },{});

  return <>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search items or brands..." style={{...inp,flex:1}}/>
      <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...inp,width:120,cursor:"pointer"}}>
        <option value="All">All</option>
        {cats.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>

    {Object.keys(grouped).sort().map(cat=>{
      const color = CAT_COLORS[cat]||"#94a3b8";
      return (
        <div key={cat} style={{marginBottom:10,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0002",borderLeft:"4px solid "+color}}>
          <button onClick={()=>toggleCat(cat)} style={{width:"100%",background:catHeaderBg,border:"none",display:"flex",alignItems:"center",gap:8,padding:"11px 14px",cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:16}}>{["🥩","🐟","🦐","🍅","🥦","🫘","🧂","🍲","🥫","🫙","🧴","🥛","🍖","🥘","🍜","🧾"][Math.abs(cat.length*3)%16]}</span>
            <span style={{fontWeight:800,fontSize:13,color:DARK,flex:1,textAlign:"left"}}>{cat}</span>
            <span style={{background:color,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700}}>{grouped[cat].length}</span>
            <span style={{fontSize:11,color:"#6b7280",marginLeft:4}}>{collapsed[cat]?"▶":"▼"}</span>
          </button>
          {!collapsed[cat]&&grouped[cat].map((item,idx)=>(
            <div key={item.id}>
              <div onClick={()=>setExpandedId(expandedId===item.id?null:item.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:rowBg,borderBottom:idx<grouped[cat].length-1?`1px solid ${divider}`:"none"}}>
                <QBadge q={item.quantity}/>
                <span style={{flex:1,fontWeight:600,fontSize:14,color:DARK}}>{item.item}</span>
                <span style={{fontSize:12,color:"#6b7280"}}>{[item.brand,item.size].filter(Boolean).join(" · ")}</span>
              </div>
              {expandedId===item.id&&(
                <div style={{background:expandedBg,padding:"10px 14px",borderBottom:idx<grouped[cat].length-1?`1px solid ${divider}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <button onClick={()=>onUpdateQty(item.id,-1)} style={{...btnS(minusBtnBg,accentColor),padding:"6px 14px",fontSize:16}}>-</button>
                    <span style={{fontWeight:700,fontSize:16,minWidth:24,textAlign:"center",color:DARK}}>{item.quantity}</span>
                    <button onClick={()=>onUpdateQty(item.id,1)} style={{...btnS(accentColor),padding:"6px 14px",fontSize:16}}>+</button>
                    <button onClick={()=>onDelete(item.id)} style={{...btnS("#fee2e2","#ef4444"),marginLeft:"auto",padding:"6px 12px"}}>🗑 Remove</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10,fontSize:12,color:"#6b7280"}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span>🏷️</span>
                      <EditableField value={item.brand||""} placeholder="add brand" onSave={v=>onEdit(item.id,"brand",v)} color={accentColor}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span>⚖️</span>
                      <EditableField value={item.size||""} placeholder="add size" onSave={v=>onEdit(item.id,"size",v)} color={accentColor}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span>📂</span>
                      <EditableField value={item.category} placeholder="category" onSave={v=>onEdit(item.id,"category",v)} color={accentColor} suggestions={catList}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span>📦</span>
                      <EditableField value={item.container||""} placeholder="container" onSave={v=>onEdit(item.id,"container",v)} color={accentColor} suggestions={["Can","Jar","Bottle","Box","Bag","Other"]}/>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#b0a8c8",marginTop:6}}>Tap any field above to edit</div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    })}
    {Object.keys(grouped).length===0&&(
      <div style={{textAlign:"center",color:"#f0e8f8",marginTop:40,fontSize:15}}>
        {isFreezer?"No freezer items found":"No pantry items found"}
      </div>
    )}
  </>;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [tab, setTab] = useState("pantry");
  const [collapsed, setCollapsed] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [addForm, setAddForm] = useState({item:"",brand:"",size:"",category:"",container:"Can",quantity:1,location:"pantry"});
  const [catSuggestion, setCatSuggestion] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [scanImg, setScanImg] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMode, setScanMode] = useState("add");
  const [scanLoc, setScanLoc] = useState("pantry");
  const [toast, setToast] = useState(null);
  const fileRef = useRef();
  const catTimer = useRef();

  const notify = (msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const addLog = async (type, item, qty, brand="", category="") => {
    const entry = {type,item,brand,qty,category};
    setLog(p=>[{...entry,id:Date.now(),at:new Date().toISOString()},...p].slice(0,100));
    try { await sbFetch("activity_log",{method:"POST",body:JSON.stringify(entry)}); }
    catch(e) { console.error("Log write failed",e); }
  };

  useEffect(()=>{
    const thirtyDaysAgo = new Date(Date.now()-30*24*60*60*1000).toISOString();
    setLogLoading(true);
    sbFetch(`activity_log?select=*&at=gte.${thirtyDaysAgo}&order=at.desc&limit=100`)
      .then(data=>{ setLog(data||[]); setLogLoading(false); })
      .catch(()=>setLogLoading(false));
  },[]);

  useEffect(()=>{
    sbFetch("pantry_items?select=*&order=category.asc,item.asc")
      .then(data=>{ setItems(data||[]); setLoading(false); })
      .catch(e=>{ notify("Failed to load: "+e.message,"err"); setLoading(false); });
  },[]);

  const pantryItems = items.filter(i=>i.location==="pantry");
  const freezerItems = items.filter(i=>i.location==="freezer");
  const cats = [...new Set(items.map(i=>i.category))].sort();
  const totalQty = items.reduce((a,i)=>a+i.quantity,0);
  const lowStock = items.filter(i=>i.quantity<=1).length;

  const toggleCat = c=>setCollapsed(p=>({...p,[c]:!p[c]}));

  const handleItemNameChange = val => {
    setAddForm(p=>({...p,item:val}));
    clearTimeout(catTimer.current);
    setCatSuggestion("");
    setAddForm(p=>({...p,item:val,category:""}));
    if(val.trim().length < 3) return;
    catTimer.current = setTimeout(async()=>{
      setCatLoading(true);
      const suggested = await autoCategory(val, addForm.brand, addForm.location, cats);
      setCatSuggestion(suggested);
      setAddForm(p=>({...p,category:suggested}));
      setCatLoading(false);
    }, 800);
  };

  const updateQty = async (id,d)=>{
    const it=items.find(i=>i.id===id); if(!it) return;
    const newQ=Math.max(0,it.quantity+d);
    setItems(p=>p.map(i=>i.id===id?{...i,quantity:newQ}:i));
    try {
      await sbFetch(`pantry_items?id=eq.${id}`,{method:"PATCH",body:JSON.stringify({quantity:newQ})});
      addLog(d>0?"added":"removed",it.item,Math.abs(d),it.brand,it.category);
    } catch(e) {
      setItems(p=>p.map(i=>i.id===id?{...i,quantity:it.quantity}:i));
      notify("Update failed","err");
    }
  };

  const deleteItem = async id=>{
    const it=items.find(i=>i.id===id);
    setItems(p=>p.filter(i=>i.id!==id)); setExpandedId(null);
    try {
      await sbFetch(`pantry_items?id=eq.${id}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
      if(it) addLog("removed",it.item,it.quantity,it.brand,it.category);
      notify("Removed","err");
    } catch(e) { setItems(p=>[...p,it]); notify("Delete failed","err"); }
  };

  const editItem = async (id,field,val)=>{
    const it=items.find(i=>i.id===id); if(!it) return;
    setItems(p=>p.map(i=>i.id===id?{...i,[field]:val}:i));
    try {
      await sbFetch(`pantry_items?id=eq.${id}`,{method:"PATCH",body:JSON.stringify({[field]:val})});
    } catch(e) {
      setItems(p=>p.map(i=>i.id===id?{...i,[field]:it[field]}:i));
      notify("Edit failed","err");
    }
  };

  const addItem = async ()=>{
    if(!addForm.item.trim()) return;
    const cat = addForm.category || catSuggestion || "Other";
    const newItem = {...addForm,category:cat,quantity:Number(addForm.quantity)};
    try {
      const [created] = await sbFetch("pantry_items",{method:"POST",body:JSON.stringify(newItem)});
      setItems(p=>[...p,created].sort((a,b)=>a.category.localeCompare(b.category)||a.item.localeCompare(b.item)));
      addLog("added",newItem.item,newItem.quantity,newItem.brand,newItem.category);
      setAddForm(p=>({...p,item:"",brand:"",size:"",category:"",quantity:1}));
      setCatSuggestion("");
      notify("Item added!");
      setTab(newItem.location==="freezer"?"freezer":"pantry");
    } catch(e) { notify("Add failed: "+e.message,"err"); }
  };

  const handleScan = e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value="";
    setScanImg(null); setScanLoading(true); setScanResult(null);
    const img=new Image();
    img.onload=async()=>{
      const MAX=1024;
      const scale=Math.min(1,MAX/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=img.width*scale; canvas.height=img.height*scale;
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      const dataUrl=canvas.toDataURL("image/jpeg",0.8);
      setScanImg(dataUrl);
      const locCats = scanLoc==="freezer" ? FREEZER_CATS.join(", ") : PANTRY_CATS.join(", ");
      try {
        const res=await fetch("/api/scan",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            image:dataUrl.split(",")[1],
            mimeType:"image/jpeg",
            prompt:`Identify all items in this image. These are ${scanLoc} items. For each, pick the best category from this list or invent a short new one if nothing fits: ${locCats}.\n\nFor the size field: only include the size if it is fully and clearly visible on the packaging. If the size text is partially hidden, obscured, cut off, or you are not 100% certain of the full value, leave size as an empty string — do not guess.\n\nReturn ONLY a JSON array: [{"item":"name","brand":"brand or empty string","size":"fully visible size with unit e.g. 14.5 oz, 400g, or empty string if unclear","container":"Can/Jar/Bottle/Box/Bag/Other","quantity":1,"category":"category name"}]. No other text.`
          })
        });
        const data=await res.json();
        const txt=data.result.replace(/```json|```/g,"").trim();
        setScanResult(JSON.parse(txt));
      } catch(err) { setScanResult({error:true}); }
      setScanLoading(false);
    };
    img.onerror=()=>{ setScanResult({error:true}); setScanLoading(false); };
    img.src=URL.createObjectURL(file);
  };

  const applyScan = async scanned=>{
    if(scanMode==="add"){
      try {
        const created=await sbFetch("pantry_items",{
          method:"POST",
          body:JSON.stringify(scanned.map(s=>({...s,quantity:s.quantity||1,size:s.size||"",location:scanLoc})))
        });
        setItems(p=>[...p,...created].sort((a,b)=>a.category.localeCompare(b.category)||a.item.localeCompare(b.item)));
        scanned.forEach(s=>addLog("added",s.item,s.quantity||1,s.brand||"",s.category||""));
        notify("Added "+scanned.length+" item(s)!");
      } catch(e) { notify("Scan add failed","err"); }
    } else {
      let upd=[...items], removed=0;
      for(const s of scanned){
        const idx=upd.findIndex(i=>i.location===scanLoc&&(i.item.toLowerCase().includes(s.item.toLowerCase())||s.item.toLowerCase().includes(i.item.toLowerCase())));
        if(idx!==-1){
          const nq=upd[idx].quantity-(s.quantity||1);
          try {
            if(nq<=0){
              await sbFetch(`pantry_items?id=eq.${upd[idx].id}`,{method:"DELETE",headers:{"Prefer":"return=minimal"}});
              addLog("removed",upd[idx].item,upd[idx].quantity,upd[idx].brand,upd[idx].category);
              upd.splice(idx,1);
            } else {
              await sbFetch(`pantry_items?id=eq.${upd[idx].id}`,{method:"PATCH",body:JSON.stringify({quantity:nq})});
              addLog("removed",upd[idx].item,s.quantity||1,upd[idx].brand,upd[idx].category);
              upd[idx]={...upd[idx],quantity:nq};
            }
            removed++;
          } catch(e){ notify("Remove failed","err"); }
        }
      }
      setItems(upd); notify("Removed "+removed+" item(s)");
    }
    setScanResult(null); setScanImg(null);
    setTab(scanLoc==="freezer"?"freezer":"pantry");
  };

  const formattedDate=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const inp={width:"100%",padding:"10px 12px",border:"2px solid #b8aee0",borderRadius:8,fontSize:14,boxSizing:"border-box",background:"#fff",fontFamily:"inherit",outline:"none"};
  const btn=(bg,color)=>({padding:"10px 18px",background:bg,color:color||"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"});
  const W={maxWidth:680,margin:"0 auto"};
  const TABS=[["pantry","🥫 Pantry"],["freezer","❄️ Freezer"],["add","➕ Add"],["scan","📸 Scan"],["log","📋 Log"],["info","❓ How to Use"]];

  return (
    <div style={{fontFamily:"'Inter',sans-serif",minHeight:"100vh",background:BG,color:DARK}}>

      {/* Header */}
      <div style={{background:BG,color:CARD,padding:"16px 20px",position:"sticky",top:0,zIndex:10}}>
        <div style={{...W,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:46,lineHeight:1}}>🥫</span>
            <div>
              <div style={{fontWeight:900,fontSize:22,letterSpacing:"3px"}}>MISE EN STOCK</div>
              <div style={{fontSize:10,opacity:0.55,letterSpacing:"1px",marginTop:1}}>by Tinkerbot Studios</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginBottom:4}}>
              <span style={{background:"#ffffff22",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>🥫 {pantryItems.length}</span>
              <span style={{background:"#1e40af44",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>❄️ {freezerItems.length}</span>
              <span style={{background:"#ffffff22",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{totalQty} qty</span>
              {lowStock>0&&<span style={{background:"#7f1d1d",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600,color:"#fca5a5"}}>⚠️ {lowStock} low</span>}
            </div>
            <div style={{fontSize:10,opacity:0.45}}>Updated {formattedDate}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:CARD,borderBottom:"2px solid #b8aee044"}}>
        <div style={{...W,display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(([t,l])=>{
            const isActive=tab===t;
            const activeColor=t==="freezer"?FREEZE:ACCENT;
            return <button key={t} onClick={()=>setTab(t)} style={{padding:"12px 12px",border:"none",background:"none",fontWeight:700,fontSize:12,cursor:"pointer",color:isActive?activeColor:"#a09abb",borderBottom:isActive?"3px solid "+activeColor:"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>{l}</button>;
          })}
        </div>
      </div>

      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#ef4444":ACCENT,color:"#fff",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,zIndex:99,boxShadow:"0 4px 12px #0003"}}>{toast.msg}</div>}

      <div style={{...W,padding:"16px 16px 80px"}}>

        {loading&&<div style={{textAlign:"center",padding:40,color:CARD,fontWeight:700,fontSize:16}}>Loading...</div>}

        {!loading&&tab==="pantry"&&<InventoryView isFreezer={false} items={pantryItems}
          onUpdateQty={updateQty} onDelete={deleteItem} onEdit={editItem}
          expandedId={expandedId} setExpandedId={setExpandedId}
          collapsed={collapsed} toggleCat={toggleCat}/>}

        {!loading&&tab==="freezer"&&<InventoryView isFreezer={true} items={freezerItems}
          onUpdateQty={updateQty} onDelete={deleteItem} onEdit={editItem}
          expandedId={expandedId} setExpandedId={setExpandedId}
          collapsed={collapsed} toggleCat={toggleCat}/>}

        {/* ADD */}
        {!loading&&tab==="add"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:16,color:DARK}}>Add New Item</div>

          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:6}}>Location</label>
            <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"2px solid #b8aee0"}}>
              <button onClick={()=>setAddForm(p=>({...p,location:"pantry",category:""}))} style={{flex:1,padding:"10px 0",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:addForm.location==="pantry"?ORANGE:"#fff",color:addForm.location==="pantry"?"#fff":ORANGE,transition:"all .15s"}}>🥫 Pantry</button>
              <button onClick={()=>setAddForm(p=>({...p,location:"freezer",category:""}))} style={{flex:1,padding:"10px 0",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:addForm.location==="freezer"?FREEZE:"#fff",color:addForm.location==="freezer"?"#fff":FREEZE,transition:"all .15s"}}>❄️ Freezer</button>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Item Name *</label>
            <input value={addForm.item} onChange={e=>handleItemNameChange(e.target.value)} placeholder={addForm.location==="freezer"?"e.g. Chicken Thighs":"e.g. Cannellini Beans"} style={inp}/>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Brand</label>
            <input value={addForm.brand} onChange={e=>setAddForm(p=>({...p,brand:e.target.value}))} placeholder="e.g. Trader Joe's" style={inp}/>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>
              Category {catLoading&&<span style={{fontSize:11,color:ACCENT,fontWeight:400}}>✨ detecting...</span>}
            </label>
            <div style={{...inp,background:"#f5f3ff",color:addForm.category?DARK:"#b0a8c8",fontStyle:addForm.category?"normal":"italic",display:"flex",alignItems:"center",gap:8}}>
              {addForm.category
                ? <><span style={{fontSize:14}}>✨</span><span>{addForm.category}</span></>
                : <span>Auto-detected when you type item name...</span>}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Size</label>
            <input value={addForm.size||""} onChange={e=>setAddForm(p=>({...p,size:e.target.value}))} placeholder="e.g. 14 oz, 2 lbs (optional)" style={inp}/>
          </div>

          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{flex:1}}>
              <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Container</label>
              <select value={addForm.container} onChange={e=>setAddForm(p=>({...p,container:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                {["Can","Jar","Bottle","Box","Bag","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{width:80}}>
              <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Qty</label>
              <input type="number" min="1" value={addForm.quantity} onChange={e=>setAddForm(p=>({...p,quantity:e.target.value}))} style={inp}/>
            </div>
          </div>

          <button onClick={addItem} style={{...btn(addForm.location==="freezer"?FREEZE:ORANGE),width:"100%",padding:13,fontSize:14}}>
            {addForm.location==="freezer"?"❄️ Add to Freezer":"🥫 Add to Pantry"}
          </button>
        </div>}

        {/* SCAN */}
        {!loading&&tab==="scan"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:4,color:DARK}}>📷 Scan Items</div>
          <div style={{fontSize:13,color:"#a09abb",marginBottom:16}}>Photo your items — Claude will identify and categorize everything automatically.</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>setScanMode("add")} style={{flex:1,padding:"10px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:scanMode==="add"?ORANGE:"transparent",color:scanMode==="add"?"#fff":ORANGE,outline:"2px solid "+ORANGE}}>+ Add items</button>
            <button onClick={()=>setScanMode("remove")} style={{flex:1,padding:"10px 0",border:"2px solid "+ORANGE,borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:scanMode==="remove"?ORANGE:"transparent",color:scanMode==="remove"?"#fff":ORANGE}}>- Remove items</button>
          </div>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:"2px solid #b8aee0",marginBottom:16}}>
            <button onClick={()=>setScanLoc("pantry")} style={{flex:1,padding:"9px 0",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:scanLoc==="pantry"?ORANGE:"#fff",color:scanLoc==="pantry"?"#fff":ORANGE,transition:"all .15s"}}>🥫 Pantry</button>
            <button onClick={()=>setScanLoc("freezer")} style={{flex:1,padding:"9px 0",border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",background:scanLoc==="freezer"?FREEZE:"#fff",color:scanLoc==="freezer"?"#fff":FREEZE,transition:"all .15s"}}>❄️ Freezer</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleScan} style={{display:"none"}}/>
          {!scanImg&&!scanLoading&&!scanResult&&(
            <button onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"22px 0",background:"#ede8f8",border:"2px dashed #b8aee0",borderRadius:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <span style={{fontSize:28}}>📷</span>
              <span style={{fontWeight:700,fontSize:14,color:DARK}}>Take or Choose Photo</span>
            </button>
          )}
          {scanImg&&!scanLoading&&<div style={{marginBottom:12}}>
            <img src={scanImg} alt="" style={{width:"100%",borderRadius:10,marginBottom:8,maxHeight:200,objectFit:"cover"}}/>
            <button onClick={()=>{setScanImg(null);setScanResult(null);}} style={{...btn("#f0e8f8",ACCENT),width:"100%",padding:"8px 0",fontSize:13}}>🔄 Try Again</button>
          </div>}
          {scanLoading&&<div style={{textAlign:"center",padding:20,color:ACCENT,fontWeight:700}}>Identifying items...</div>}
          {scanResult&&!scanResult.error&&<div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:DARK}}>Found {scanResult.length} item(s):</div>
            {scanResult.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f0e8f8",fontSize:13}}>
                <span style={{flex:1,fontWeight:600}}>{s.item}</span>
                <span style={{color:"#a09abb",fontSize:11}}>{[s.brand,s.size].filter(Boolean).join(" · ")}</span>
                <span style={{background:"#f0e8f8",borderRadius:4,padding:"2px 6px",fontSize:11,color:ACCENT}}>{s.category}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>applyScan(scanResult)} style={{...btn(scanLoc==="freezer"?FREEZE:ORANGE),flex:1,padding:11}}>{scanMode==="add"?"Add All":"Remove All"}</button>
              <button onClick={()=>{setScanResult(null);setScanImg(null);}} style={{...btn("#f0e8f8",ACCENT),padding:"11px 14px"}}>Cancel</button>
            </div>
          </div>}
          {scanResult&&scanResult.error&&<div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:10,padding:14,color:"#ef4444",fontSize:13}}>Could not identify items. Try a clearer photo.</div>}
        </div>}

        {/* LOG */}
        {!loading&&tab==="log"&&<div>
          <div style={{fontWeight:800,fontSize:16,color:CARD,marginBottom:14}}>Activity — last 30 days</div>
          {logLoading
            ?<div style={{textAlign:"center",padding:40,color:CARD,fontWeight:700}}>Loading log...</div>
            :log.length===0
              ?<div style={{background:CARD,borderRadius:14,padding:32,textAlign:"center",color:"#a09abb",fontSize:14}}>No activity yet.</div>
              :<div style={{background:CARD,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0002"}}>
                {log.map((e,idx)=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:idx<log.length-1?"1px solid #f0e8f8":"none"}}>
                    <span style={{fontSize:18}}>{e.type==="added"?"➕":"➖"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14,color:DARK}}>{e.item}</div>
                      <div style={{fontSize:11,color:"#a09abb",marginTop:1}}>
                        {e.type==="added"?"Added":"Removed"} {e.qty} &bull; {formatEST(e.at)}
                        {e.category&&<span> &bull; {e.category}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:e.type==="added"?"#22c55e":"#ef4444",background:e.type==="added"?"#f0fdf4":"#fff5f5",borderRadius:6,padding:"3px 8px"}}>{e.type==="added"?"+":"-"}{e.qty}</span>
                  </div>
                ))}
              </div>
          }
        </div>}

        {/* HOW TO USE */}
        {tab==="info"&&<div style={{background:"#fff",border:"3px solid #111",padding:"14px 16px",fontFamily:"Arial,sans-serif",color:"#111"}}>
          <div style={{fontWeight:900,fontSize:34,lineHeight:1,marginBottom:2}}>How to Use</div>
          <div style={{fontSize:12,marginBottom:6}}>Mise en Stock Pantry & Freezer Tracker</div>
          <div style={{height:8,background:"#111",marginBottom:6}}/>
          <div style={{fontSize:13,marginBottom:8}}>Serving size <strong>1 photo</strong></div>
          <div style={{height:4,background:"#111",marginBottom:6}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",paddingBottom:4,marginBottom:6,borderBottom:"8px solid #111"}}>
            <span style={{fontWeight:900,fontSize:20}}>Items identified</span>
            <span style={{fontWeight:900,fontSize:26}}>∞</span>
          </div>
          {[{label:"Adding Items",options:[
            {icon:"➕",title:"Add tab",desc:"Toggle Pantry or Freezer, type the item name — category auto-suggested."},
            {icon:"📷",title:"Scan tab",desc:"Choose Pantry or Freezer, then take a photo. Claude identifies everything automatically."},
          ]},{label:"Removing Items",options:[
            {icon:"📸",title:"Scan tab",desc:"Switch to Remove mode, pick the location, then upload your photo."},
            {icon:"🗑️",title:"Pantry / Freezer tab",desc:"Tap any item to expand, then hit the trash icon or use +/- to adjust quantity."},
          ]},{label:"Editing Items",options:[
            {icon:"✏️",title:"Pantry / Freezer tab",desc:"Tap any item to expand it, then tap any field (brand, size, category, container) to edit it in place."},
          ]}].map(({label,options})=>(
            <div key={label} style={{marginBottom:14}}>
              <div style={{fontWeight:900,fontSize:13,letterSpacing:"0.5px",marginBottom:8,borderBottom:"1px solid #111",paddingBottom:4}}>{label}</div>
              {options.map((o,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #ddd"}}>
                  <span style={{fontSize:20,marginTop:1}}>{o.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:2}}>{o.title}</div>
                    <div style={{fontSize:12,color:"#444",lineHeight:1.5}}>{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{fontSize:12,lineHeight:1.5,marginTop:4}}><strong>* Pro tip:</strong> Scan a whole shelf at once — Claude identifies every item and picks the right category automatically.</div>
          <div style={{height:8,background:"#111",margin:"14px 0 10px"}}/>
          <div style={{textAlign:"center",fontSize:11,letterSpacing:"2px",color:"#555",fontWeight:600}}>POWERED BY TINKERBOT STUDIOS</div>
        </div>}

      </div>
    </div>
  );
}
