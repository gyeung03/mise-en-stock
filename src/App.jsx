import { useState, useRef } from "react";

const BG = "#8a78c0";
const CARD = "#fdf0e8";
const DARK = "#3d2f6b";
const ACCENT = "#6c5bb5";

const INITIAL_ITEMS = [
  {id:1,category:"Broths & Stocks",item:"Beef Broth",brand:"College Inn",container:"Can",quantity:1},
  {id:2,category:"Canned Beans & Legumes",item:"Garbanzo Beans",brand:"Trader Joe's",container:"Can",quantity:2},
  {id:3,category:"Canned Beans & Legumes",item:"Black Beans",brand:"Goya",container:"Can",quantity:3},
  {id:4,category:"Canned Beans & Legumes",item:"Kidney Beans",brand:"Bush's",container:"Can",quantity:2},
  {id:5,category:"Canned Beans & Legumes",item:"Lentils",brand:"",container:"Can",quantity:1},
  {id:6,category:"Canned Fish & Seafood",item:"Albacore Tuna",brand:"Starkist",container:"Can",quantity:4},
  {id:7,category:"Canned Fish & Seafood",item:"Sardines in Olive Oil",brand:"King Oscar",container:"Can",quantity:2},
  {id:8,category:"Canned Fish & Seafood",item:"Anchovies",brand:"Cento",container:"Can",quantity:1},
  {id:9,category:"Canned Meats",item:"Chicken Breast",brand:"Swanson",container:"Can",quantity:2},
  {id:10,category:"Canned Shellfish",item:"Whole Baby Clams",brand:"Cento",container:"Can",quantity:2},
  {id:11,category:"Canned Tomatoes",item:"Crushed Tomatoes",brand:"Muir Glen",container:"Can",quantity:3},
  {id:12,category:"Canned Tomatoes",item:"Diced Tomatoes",brand:"Hunt's",container:"Can",quantity:2},
  {id:13,category:"Canned Tomatoes",item:"Tomato Paste",brand:"Cento",container:"Can",quantity:3},
  {id:14,category:"Canned Tomatoes",item:"San Marzano Tomatoes",brand:"Rega",container:"Can",quantity:2},
  {id:15,category:"Canned Vegetables",item:"Artichoke Hearts",brand:"Cento",container:"Can",quantity:1},
  {id:16,category:"Canned Vegetables",item:"Corn",brand:"Del Monte",container:"Can",quantity:2},
  {id:17,category:"Canned Vegetables",item:"Green Beans",brand:"Del Monte",container:"Can",quantity:1},
  {id:18,category:"Condiments & Chili Pastes",item:"Chili Crisp",brand:"Fly By Jing",container:"Jar",quantity:1},
  {id:19,category:"Condiments & Chili Pastes",item:"Gochujang",brand:"CJ",container:"Jar",quantity:1},
  {id:20,category:"Condiments & Pickled Items",item:"Capers",brand:"Cento",container:"Jar",quantity:1},
  {id:21,category:"Condiments & Pickled Items",item:"Cornichons",brand:"Trader Joe's",container:"Jar",quantity:1},
  {id:22,category:"Condiments & Pickled Items",item:"Dill Pickles",brand:"Vlasic",container:"Jar",quantity:1},
  {id:23,category:"Condiments & Preserved Vegetables",item:"Roasted Red Peppers",brand:"Cento",container:"Jar",quantity:2},
  {id:24,category:"Condiments & Preserved Vegetables",item:"Sun-Dried Tomatoes",brand:"Trader Joe's",container:"Jar",quantity:1},
  {id:25,category:"Condiments & Sauces",item:"Dijon Mustard",brand:"Maille",container:"Jar",quantity:1},
  {id:26,category:"Condiments & Sauces",item:"Fish Sauce",brand:"Red Boat",container:"Bottle",quantity:1},
  {id:27,category:"Condiments & Sauces",item:"Hot Sauce",brand:"Tabasco",container:"Bottle",quantity:2},
  {id:28,category:"Condiments & Sauces",item:"Soy Sauce",brand:"Kikkoman",container:"Bottle",quantity:1},
  {id:29,category:"Condiments & Sauces",item:"Worcestershire Sauce",brand:"Lea & Perrins",container:"Bottle",quantity:1},
  {id:30,category:"Gravies & Meal Sauces",item:"Brown Gravy",brand:"McCormick",container:"Can",quantity:2},
  {id:31,category:"Prepared Meals",item:"Chicken Noodle Soup",brand:"Campbell's",container:"Can",quantity:2},
  {id:32,category:"Sauces & Cooking Bases",item:"Coconut Milk",brand:"Thai Kitchen",container:"Can",quantity:3},
  {id:33,category:"Sauces & Cooking Bases",item:"Mango Chutney",brand:"Trader Joe's",container:"Jar",quantity:1},
  {id:34,category:"Sauces & Cooking Bases",item:"Oyster Sauce",brand:"Lee Kum Kee",container:"Bottle",quantity:1},
  {id:35,category:"Sauces & Cooking Bases",item:"Pasta Sauce",brand:"Rao's",container:"Jar",quantity:2},
  {id:36,category:"Soups",item:"Lentil Soup",brand:"Progresso",container:"Can",quantity:2},
  {id:37,category:"Soups",item:"Minestrone",brand:"Progresso",container:"Can",quantity:1},
  {id:38,category:"Soups",item:"Tomato Soup",brand:"Campbell's",container:"Can",quantity:2},
];

const CAT_COLORS = {
  "Broths & Stocks":"#06b6d4","Canned Beans & Legumes":"#10b981","Canned Fish & Seafood":"#3b82f6",
  "Canned Meats":"#ef4444","Canned Shellfish":"#8b5cf6","Canned Tomatoes":"#f43f5e",
  "Canned Vegetables":"#84cc16","Condiments & Chili Pastes":"#f97316","Condiments & Pickled Items":"#14b8a6",
  "Condiments & Preserved Vegetables":"#f59e0b","Condiments & Sauces":"#a855f7",
  "Dairy & Shelf-Stable Milk":"#ec4899","Gravies & Meal Sauces":"#d97706",
  "Prepared Meals":"#0ea5e9","Sauces & Cooking Bases":"#e879f9","Soups":"#6366f1","Other":"#94a3b8"
};

function QBadge({q}) {
  const bg = q===0?"#ef4444":q===1?"#f97316":q===2?"#eab308":"#22c55e";
  return <span style={{background:bg,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700,minWidth:22,textAlign:"center"}}>{q}</span>;
}

function timeAgo(date) {
  const diff = Math.floor((Date.now()-date)/1000);
  if(diff<60) return "just now";
  if(diff<3600) return Math.floor(diff/60)+"m ago";
  if(diff<86400) return Math.floor(diff/3600)+"h ago";
  return Math.floor(diff/86400)+"d ago";
}

export default function App() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [log, setLog] = useState([]);
  const [tab, setTab] = useState("inventory");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [collapsed, setCollapsed] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [addForm, setAddForm] = useState({item:"",brand:"",category:"",container:"Can",quantity:1});
  const [scanImg, setScanImg] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMode, setScanMode] = useState("add");
  const [toast, setToast] = useState(null);
  const [lastUpdated] = useState(new Date());
  const fileRef = useRef();
  const cameraRef = useRef();
  const nextId = useRef(200);

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const addLog = (type, item, qty) => {
    setLog(p=>[{id:Date.now(),type,item,qty,at:Date.now()},...p].slice(0,100));
  };

  const totalQty = items.reduce((a,i)=>a+i.quantity,0);
  const lowStock = items.filter(i=>i.quantity<=1).length;
  const cats = [...new Set(items.map(i=>i.category))].sort();

  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    const matchS = !s || i.item.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s);
    const matchC = filterCat==="All" || i.category===filterCat;
    return matchS && matchC;
  });
  const grouped = filtered.reduce((acc,i)=>{ (acc[i.category]=acc[i.category]||[]).push(i); return acc; },{});

  const toggleCat = c => setCollapsed(p=>({...p,[c]:!p[c]}));

  const updateQty = (id, d) => {
    const it = items.find(i=>i.id===id);
    if(!it) return;
    const newQ = Math.max(0, it.quantity+d);
    setItems(p=>p.map(i=>i.id===id?{...i,quantity:newQ}:i));
    addLog(d>0?"added":"removed", it.item, Math.abs(d));
  };

  const deleteItem = id => {
    const it = items.find(i=>i.id===id);
    if(it) addLog("removed", it.item, it.quantity);
    setItems(p=>p.filter(i=>i.id!==id));
    setExpandedId(null);
    notify("Removed","err");
  };

  const addItem = () => {
    if(!addForm.item.trim()||!addForm.category) return;
    const qty = Number(addForm.quantity);
    setItems(p=>[...p,{...addForm,id:nextId.current++,quantity:qty}]);
    addLog("added", addForm.item, qty);
    setAddForm({item:"",brand:"",category:"",container:"Can",quantity:1});
    notify("Item added!");
  };

  const handleScan = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = async ev => {
      const b64 = ev.target.result.split(",")[1];
      setScanImg(ev.target.result); setScanLoading(true); setScanResult(null);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:file.type,data:b64}},
            {type:"text",text:"Return ONLY a JSON array: [{\"item\":\"name\",\"brand\":\"brand or empty\",\"container\":\"Can/Jar/Bottle/Box/Bag/Other\",\"quantity\":1,\"category\":\"best match from: Broths & Stocks, Canned Beans & Legumes, Canned Fish & Seafood, Canned Meats, Canned Shellfish, Canned Tomatoes, Canned Vegetables, Condiments & Chili Pastes, Condiments & Pickled Items, Condiments & Preserved Vegetables, Condiments & Sauces, Dairy & Shelf-Stable Milk, Gravies & Meal Sauces, Prepared Meals, Sauces & Cooking Bases, Soups, Other\"}]. No other text."}
          ]}]})
        });
        const data = await res.json();
        const txt = data.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
        setScanResult(JSON.parse(txt));
      } catch(err) { setScanResult({error:true}); }
      setScanLoading(false);
    };
    r.readAsDataURL(file);
  };

  const applyScan = scanned => {
    if(scanMode==="add"){
      setItems(p=>[...p,...scanned.map(s=>({...s,id:nextId.current++,quantity:s.quantity||1}))]);
      scanned.forEach(s=>addLog("added", s.item, s.quantity||1));
      notify("Added "+scanned.length+" item(s)!");
    } else {
      let upd=[...items],removed=0;
      scanned.forEach(s=>{
        const idx=upd.findIndex(i=>i.item.toLowerCase().includes(s.item.toLowerCase())||s.item.toLowerCase().includes(i.item.toLowerCase()));
        if(idx!==-1){
          const nq=upd[idx].quantity-(s.quantity||1);
          addLog("removed", upd[idx].item, s.quantity||1);
          if(nq<=0) upd.splice(idx,1); else upd[idx]={...upd[idx],quantity:nq};
          removed++;
        }
      });
      setItems(upd); notify("Removed "+removed+" item(s)");
    }
    setScanResult(null); setScanImg(null); setTab("inventory");
  };

  const thirtyDaysAgo = Date.now() - 30*24*60*60*1000;
  const recentLog = log.filter(e=>e.at>=thirtyDaysAgo);

  const formattedDate = lastUpdated.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const inp = {width:"100%",padding:"10px 12px",border:"2px solid #b8aee0",borderRadius:8,fontSize:14,boxSizing:"border-box",background:"#fff",fontFamily:"inherit",outline:"none"};
  const btn = (bg,color)=>({padding:"10px 18px",background:bg,color:color||"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"});

  return (
    <div style={{fontFamily:"'Inter',sans-serif",minHeight:"100vh",background:BG,color:DARK}}>

      {/* Header */}
      <div style={{background:BG,color:CARD,padding:"16px 20px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:46,lineHeight:1}}>🥫</span>
            <div>
              <div style={{fontWeight:900,fontSize:22,letterSpacing:"3px"}}>MISE EN STOCK</div>
              <div style={{fontSize:10,opacity:0.55,letterSpacing:"1px",marginTop:1}}>by Tinkerbot Studios</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginBottom:4}}>
              <span style={{background:"#ffffff22",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{items.length} items</span>
              <span style={{background:"#ffffff22",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{totalQty} qty</span>
              {lowStock>0&&<span style={{background:"#7f1d1d",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600,color:"#fca5a5"}}>⚠️ {lowStock} low</span>}
            </div>
            <div style={{fontSize:10,opacity:0.45}}>Updated {formattedDate}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:CARD,borderBottom:"2px solid #b8aee044",display:"flex",padding:"0 8px",overflowX:"auto"}}>
        {[["inventory","🥫 Pantry"],["add","➕ Add"],["scan","📸 Scan"],["log","📋 Log"],["info","❓ How to Use"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"12px 12px",border:"none",background:"none",fontWeight:700,fontSize:12,cursor:"pointer",color:tab===t?ACCENT:"#a09abb",borderBottom:tab===t?"3px solid "+ACCENT:"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#ef4444":ACCENT,color:"#fff",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,zIndex:99,boxShadow:"0 4px 12px #0003"}}>{toast.msg}</div>}

      <div style={{padding:"16px 16px 80px"}}>

        {/* INVENTORY TAB */}
        {tab==="inventory"&&<>
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
              <div key={cat} style={{marginBottom:10,background:CARD,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0002",borderLeft:"4px solid "+color}}>
                <button onClick={()=>toggleCat(cat)} style={{width:"100%",background:"#f5d9bf",border:"none",display:"flex",alignItems:"center",gap:8,padding:"11px 14px",cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:16}}>{["🥩","🐟","🦐","🍅","🥦","🫘","🧂","🍲","🥫","🫙","🧴","🥛","🍖","🥘","🍜","🧾"][Math.abs(cat.length*3)%16]}</span>
                  <span style={{fontWeight:800,fontSize:13,color:DARK,flex:1,textAlign:"left"}}>{cat}</span>
                  <span style={{background:color,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700}}>{grouped[cat].length}</span>
                  <span style={{fontSize:11,color:"#a09abb",marginLeft:4}}>{collapsed[cat]?"▶":"▼"}</span>
                </button>
                {!collapsed[cat]&&<div style={{borderTop:"1px solid "+color+"22"}}>
                  {grouped[cat].map((item,idx)=>(
                    <div key={item.id}>
                      <div onClick={()=>setExpandedId(expandedId===item.id?null:item.id)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:idx<grouped[cat].length-1?"1px solid #f0e8f8":"none",background:expandedId===item.id?"#f5eeff":"transparent"}}>
                        <QBadge q={item.quantity}/>
                        <span style={{flex:1,fontWeight:600,fontSize:14,color:DARK}}>{item.item}</span>
                        <span style={{fontSize:12,color:"#a09abb"}}>{item.brand}</span>
                      </div>
                      {expandedId===item.id&&<div style={{background:"#f5eeff",padding:"10px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:idx<grouped[cat].length-1?"1px solid #f0e8f8":"none"}}>
                        <button onClick={()=>updateQty(item.id,-1)} style={{...btn("#e0d8f8",ACCENT),padding:"6px 14px",fontSize:16}}>-</button>
                        <span style={{fontWeight:700,fontSize:16,minWidth:24,textAlign:"center"}}>{item.quantity}</span>
                        <button onClick={()=>updateQty(item.id,1)} style={{...btn(ACCENT),padding:"6px 14px",fontSize:16}}>+</button>
                        <button onClick={()=>deleteItem(item.id)} style={{...btn("#fee2e2","#ef4444"),marginLeft:"auto",padding:"6px 12px"}}>🗑 Remove</button>
                      </div>}
                    </div>
                  ))}
                </div>}
              </div>
            );
          })}
          {Object.keys(grouped).length===0&&<div style={{textAlign:"center",color:"#f0e8f8",marginTop:40,fontSize:15}}>No items found</div>}
        </>}

        {/* ADD TAB */}
        {tab==="add"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:16,color:DARK}}>Add New Item</div>
          {[["Item Name *","item","text","e.g. Cannellini Beans"],["Brand","brand","text","e.g. Cento"]].map(([lbl,f,t,ph])=>(
            <div key={f} style={{marginBottom:12}}>
              <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>{lbl}</label>
              <input type={t} value={addForm[f]} onChange={e=>setAddForm(p=>({...p,[f]:e.target.value}))} placeholder={ph} style={inp}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Category *</label>
            <select value={addForm.category} onChange={e=>setAddForm(p=>({...p,category:e.target.value}))} style={{...inp,cursor:"pointer"}}>
              <option value="">Select a category...</option>
              {cats.map(c=><option key={c} value={c}>{c}</option>)}
              <option value="Other">Other</option>
            </select>
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
          <button onClick={addItem} style={{...btn(ACCENT),width:"100%",padding:13,fontSize:14}}>Add to Pantry</button>
        </div>}

        {/* SCAN TAB */}
        {tab==="scan"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:4,color:DARK}}>📷 Scan Items</div>
          <div style={{fontSize:13,color:"#a09abb",marginBottom:16}}>Photo your pantry items — Claude will identify and update your inventory.</div>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <button onClick={()=>setScanMode("add")} style={{flex:1,padding:"10px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:scanMode==="add"?ACCENT:"transparent",color:scanMode==="add"?"#fff":ACCENT,outline:"2px solid "+ACCENT}}>+ Add items</button>
            <button onClick={()=>setScanMode("remove")} style={{flex:1,padding:"10px 0",border:"2px solid "+ACCENT,borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:scanMode==="remove"?ACCENT:"transparent",color:scanMode==="remove"?"#fff":ACCENT}}>- Remove items</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleScan} style={{display:"none"}}/>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleScan} style={{display:"none"}}/>
          {!scanImg&&!scanLoading&&!scanResult&&<div style={{display:"flex",gap:12}}>
            <button onClick={()=>cameraRef.current.click()} style={{flex:1,padding:"22px 0",background:"#ede8f8",border:"2px dashed #b8aee0",borderRadius:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <span style={{fontSize:28}}>📷</span>
              <span style={{fontWeight:700,fontSize:14,color:DARK}}>Take Photo</span>
            </button>
            <button onClick={()=>fileRef.current.click()} style={{flex:1,padding:"22px 0",background:"#ede8f8",border:"2px dashed #b8aee0",borderRadius:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <span style={{fontSize:28}}>🖼️</span>
              <span style={{fontWeight:700,fontSize:14,color:DARK}}>Choose Photo</span>
            </button>
          </div>}
          {scanImg&&<img src={scanImg} alt="" style={{width:"100%",borderRadius:10,marginBottom:12,maxHeight:200,objectFit:"cover"}}/>}
          {scanLoading&&<div style={{textAlign:"center",padding:20,color:ACCENT,fontWeight:700}}>Identifying items...</div>}
          {scanResult&&!scanResult.error&&<div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:DARK}}>Found {scanResult.length} item(s):</div>
            {scanResult.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f0e8f8",fontSize:13}}>
                <span style={{flex:1,fontWeight:600}}>{s.item}</span>
                <span style={{color:"#a09abb"}}>{s.brand}</span>
                <span style={{background:"#f0e8f8",borderRadius:4,padding:"2px 6px",fontSize:11}}>{s.category}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>applyScan(scanResult)} style={{...btn(ACCENT),flex:1,padding:11}}>
                {scanMode==="add"?"Add All":"Remove All"}
              </button>
              <button onClick={()=>{setScanResult(null);setScanImg(null);}} style={{...btn("#f0e8f8",ACCENT),padding:"11px 14px"}}>Cancel</button>
            </div>
          </div>}
          {scanResult&&scanResult.error&&<div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:10,padding:14,color:"#ef4444",fontSize:13}}>Could not identify items. Try a clearer photo.</div>}
        </div>}

        {/* LOG TAB */}
        {tab==="log"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontWeight:800,fontSize:16,color:CARD}}>Activity — last 30 days</div>
            {recentLog.length>0&&<button onClick={()=>setLog([])} style={{...btn("#ffffff33",CARD),padding:"5px 12px",fontSize:12}}>Clear</button>}
          </div>
          {recentLog.length===0
            ? <div style={{background:CARD,borderRadius:14,padding:32,textAlign:"center",color:"#a09abb",fontSize:14}}>
                No activity yet. Add or remove items to see your log here.
              </div>
            : <div style={{background:CARD,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0002"}}>
                {recentLog.map((e,idx)=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:idx<recentLog.length-1?"1px solid #f0e8f8":"none"}}>
                    <span style={{fontSize:18}}>{e.type==="added"?"➕":"➖"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14,color:DARK}}>{e.item}</div>
                      <div style={{fontSize:11,color:"#a09abb",marginTop:1}}>
                        {e.type==="added"?"Added":"Removed"} {e.qty} &bull; {timeAgo(e.at)}
                      </div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:e.type==="added"?"#22c55e":"#ef4444",background:e.type==="added"?"#f0fdf4":"#fff5f5",borderRadius:6,padding:"3px 8px"}}>
                      {e.type==="added"?"+":"-"}{e.qty}
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>}

        {/* HOW TO USE TAB */}
        {tab==="info"&&<div style={{background:"#fff",border:"3px solid #111",padding:"14px 16px",fontFamily:"Arial,sans-serif",color:"#111"}}>
          <div style={{fontWeight:900,fontSize:34,lineHeight:1,marginBottom:2}}>How to Use</div>
          <div style={{fontSize:12,marginBottom:6}}>Mise en Stock Pantry Tracker</div>
          <div style={{height:8,background:"#111",marginBottom:6}}/>
          <div style={{fontSize:13,marginBottom:8}}>Serving size <strong>1 photo</strong></div>
          <div style={{height:4,background:"#111",marginBottom:6}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",paddingBottom:4,marginBottom:6,borderBottom:"8px solid #111"}}>
            <span style={{fontWeight:900,fontSize:20}}>Items identified</span>
            <span style={{fontWeight:900,fontSize:26}}>∞</span>
          </div>
          {[
            {label:"Adding Items", options:[
              {icon:"➕", title:"Add tab", desc:"Manually enter a new item — fill in the name, brand, category, container type, and quantity."},
              {icon:"📷", title:"Scan tab", desc:"Take or upload a photo of your pantry items. Claude will identify everything and add it to your inventory automatically."},
            ]},
            {label:"Removing Items", options:[
              {icon:"📸", title:"Scan tab", desc:"Switch to Remove mode before uploading your photo. Claude will find matching items and delete or reduce their quantity."},
              {icon:"🗑️", title:"Pantry tab", desc:"Tap any item to expand it, then hit the trash icon to delete it or use +/- to adjust the quantity."},
            ]},
          ].map(({label,options})=>(
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
          <div style={{fontSize:12,lineHeight:1.5,marginTop:4}}>
            <strong>* Pro tip:</strong> Scan a whole shelf at once — Claude identifies every visible item and updates your pantry in one shot.
          </div>
          <div style={{height:8,background:"#111",margin:"14px 0 10px"}}/>
          <div style={{textAlign:"center",fontSize:11,letterSpacing:"2px",color:"#555",fontWeight:600}}>POWERED BY TINKERBOT STUDIOS</div>
        </div>}

      </div>
    </div>
  );
}
