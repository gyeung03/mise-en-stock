import { useState, useRef } from "react";

const BG = "#8a78c0";
const CARD = "#fdf0e8";
const DARK = "#3d2f6b";
const ACCENT = "#6c5bb5";

const CAT_COLORS = {
  "Broths & Stocks":"#06b6d4","Canned Beans & Legumes":"#10b981","Canned Fish & Seafood":"#3b82f6",
  "Canned Meats":"#ef4444","Canned Other":"#f59e0b","Canned Tomatoes":"#f43f5e",
  "Canned Vegetables":"#84cc16","Condiments":"#f97316","Pickled Items":"#14b8a6",
  "Dairy & Shelf-Stable Milk":"#ec4899","Gravies & Meal Sauces":"#d97706",
  "Pasta Sauces":"#e879f9","Prepared Meals":"#0ea5e9","Soups":"#6366f1","Other":"#94a3b8"
};

const SAMPLE_ITEMS = [
  {id:1,category:"Broths & Stocks",item:"Beef Broth",brand:"College Inn",container:"Can",quantity:2,size:"32 oz"},
  {id:2,category:"Canned Beans & Legumes",item:"Garbanzo Beans",brand:"Trader Joe's",container:"Can",quantity:1,size:"15 oz"},
  {id:3,category:"Canned Beans & Legumes",item:"Navy Beans",brand:"Goya",container:"Can",quantity:3,size:""},
  {id:4,category:"Canned Fish & Seafood",item:"Calamari in Olive Oil",brand:"Trader Joe's",container:"Can",quantity:2,size:"6.7 oz"},
  {id:5,category:"Canned Fish & Seafood",item:"Light Tuna w/ Hot Pepper Sauce",brand:"Dong Won",container:"Can",quantity:4,size:"5 oz"},
  {id:6,category:"Canned Tomatoes",item:"Crushed Tomatoes",brand:"Cento",container:"Can",quantity:1,size:"28 oz"},
  {id:7,category:"Soups",item:"Lentil Soup",brand:"Progresso",container:"Can",quantity:2,size:"18.5 oz"},
  {id:8,category:"Condiments",item:"Soy Sauce",brand:"Kikkoman",container:"Bottle",quantity:1,size:"10 fl oz"},
];

const HOW_TO = [
  {label:"Adding Items", options:[
    {icon:"➕", title:"Add tab", desc:"Type the item name and brand — the category will be suggested automatically. Adjust if needed."},
    {icon:"📷", title:"Scan tab", desc:"Take or upload a photo. Claude identifies every item and picks the best category automatically."},
  ]},
  {label:"Removing Items", options:[
    {icon:"📸", title:"Scan tab", desc:"Switch to Remove mode before uploading your photo. Claude finds matching items and removes them."},
    {icon:"🗑️", title:"Pantry tab", desc:"Tap any item to expand it, then hit the trash icon to delete or use +/- to adjust quantity."},
  ]},
];

function QBadge({q}) {
  const bg = q===0?"#ef4444":q===1?"#f97316":q===2?"#eab308":"#22c55e";
  return <span style={{background:bg,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700,minWidth:22,textAlign:"center"}}>{q}</span>;
}

export default function App() {
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [tab, setTab] = useState("inventory");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [collapsed, setCollapsed] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [addForm, setAddForm] = useState({item:"",brand:"",size:"",category:"",container:"Can",quantity:1});
  const [toast, setToast] = useState(null);
  const nextId = useRef(100);

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const cats = [...new Set(items.map(i=>i.category))].sort();
  const totalQty = items.reduce((a,i)=>a+i.quantity,0);
  const lowStock = items.filter(i=>i.quantity<=1).length;

  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    return (!s || i.item.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s))
      && (filterCat==="All" || i.category===filterCat);
  });
  const grouped = filtered.reduce((acc,i)=>{ (acc[i.category]=acc[i.category]||[]).push(i); return acc; },{});

  const toggleCat = c => setCollapsed(p=>({...p,[c]:!p[c]}));

  const updateQty = (id, d) => {
    setItems(p=>p.map(i=>i.id===id?{...i,quantity:Math.max(0,i.quantity+d)}:i));
  };

  const deleteItem = id => {
    setItems(p=>p.filter(i=>i.id!==id));
    setExpandedId(null);
    notify("Removed","err");
  };

  const addItem = () => {
    if(!addForm.item.trim()) return;
    const newItem = {...addForm, id:nextId.current++, quantity:Number(addForm.quantity), category:addForm.category||"Other"};
    setItems(p=>[...p,newItem].sort((a,b)=>a.category.localeCompare(b.category)||a.item.localeCompare(b.item)));
    setAddForm({item:"",brand:"",size:"",category:"",container:"Can",quantity:1});
    notify("Item added!");
    setTab("inventory");
  };

  const formattedDate = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const inp = {width:"100%",padding:"10px 12px",border:"2px solid #b8aee0",borderRadius:8,fontSize:14,boxSizing:"border-box",background:"#fff",fontFamily:"inherit",outline:"none"};
  const btn = (bg,color)=>({padding:"10px 18px",background:bg,color:color||"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"});
  const W = {maxWidth:680,margin:"0 auto"};

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
              <span style={{background:"#ffffff22",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:600}}>{items.length} items</span>
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
          {[["inventory","🥫 Pantry"],["add","➕ Add"],["scan","📸 Scan"],["log","📋 Log"],["info","❓ How to Use"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"12px 12px",border:"none",background:"none",fontWeight:700,fontSize:12,cursor:"pointer",color:tab===t?ACCENT:"#a09abb",borderBottom:tab===t?"3px solid "+ACCENT:"3px solid transparent",transition:"all .15s",fontFamily:"inherit",whiteSpace:"nowrap"}}>{l}</button>
          ))}
        </div>
      </div>

      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#ef4444":ACCENT,color:"#fff",padding:"10px 20px",borderRadius:20,fontWeight:700,fontSize:13,zIndex:99,boxShadow:"0 4px 12px #0003"}}>{toast.msg}</div>}

      <div style={{...W,padding:"16px 16px 80px"}}>

        {/* INVENTORY */}
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
                        <span style={{fontSize:12,color:"#a09abb"}}>{[item.brand,item.size].filter(Boolean).join(" · ")}</span>
                      </div>
                      {expandedId===item.id&&<div style={{background:"#f5eeff",padding:"10px 14px",borderBottom:idx<grouped[cat].length-1?"1px solid #f0e8f8":"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:item.size||item.container?8:0}}>
                          <button onClick={()=>updateQty(item.id,-1)} style={{...btn("#e0d8f8",ACCENT),padding:"6px 14px",fontSize:16}}>-</button>
                          <span style={{fontWeight:700,fontSize:16,minWidth:24,textAlign:"center"}}>{item.quantity}</span>
                          <button onClick={()=>updateQty(item.id,1)} style={{...btn(ACCENT),padding:"6px 14px",fontSize:16}}>+</button>
                          <button onClick={()=>deleteItem(item.id)} style={{...btn("#fee2e2","#ef4444"),marginLeft:"auto",padding:"6px 12px"}}>🗑 Remove</button>
                        </div>
                        {(item.size||item.container)&&<div style={{fontSize:12,color:"#a09abb",display:"flex",gap:12}}>
                          {item.container&&<span>📦 {item.container}</span>}
                          {item.size&&<span>⚖️ {item.size}</span>}
                        </div>}
                      </div>}
                    </div>
                  ))}
                </div>}
              </div>
            );
          })}
          {Object.keys(grouped).length===0&&<div style={{textAlign:"center",color:"#f0e8f8",marginTop:40,fontSize:15}}>No items found</div>}
        </>}

        {/* ADD */}
        {tab==="add"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:16,color:DARK}}>Add New Item</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Item Name *</label>
            <input value={addForm.item} onChange={e=>setAddForm(p=>({...p,item:e.target.value}))} placeholder="e.g. Cannellini Beans" style={inp}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Brand</label>
            <input value={addForm.brand} onChange={e=>setAddForm(p=>({...p,brand:e.target.value}))} placeholder="e.g. Cento" style={inp}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Category</label>
            <input value={addForm.category} onChange={e=>setAddForm(p=>({...p,category:e.target.value}))} placeholder="Auto-detected or type your own" style={inp}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:13,fontWeight:600,color:DARK,display:"block",marginBottom:4}}>Size</label>
            <input value={addForm.size||""} onChange={e=>setAddForm(p=>({...p,size:e.target.value}))} placeholder="e.g. 14 oz, 400g (optional)" style={inp}/>
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

        {/* SCAN */}
        {tab==="scan"&&<div style={{background:CARD,borderRadius:16,padding:20,boxShadow:"0 2px 12px #0001"}}>
          <div style={{fontWeight:800,fontSize:17,marginBottom:4,color:DARK}}>📷 Scan Items</div>
          <div style={{fontSize:13,color:"#a09abb",marginBottom:16}}>Photo your pantry items — Claude will identify and categorize everything automatically.</div>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <button style={{flex:1,padding:"10px 0",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:ACCENT,color:"#fff",outline:"2px solid "+ACCENT}}>+ Add items</button>
            <button style={{flex:1,padding:"10px 0",border:"2px solid "+ACCENT,borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",background:"transparent",color:ACCENT}}>- Remove items</button>
          </div>
          <div style={{flex:1,padding:"22px 0",background:"#ede8f8",border:"2px dashed #b8aee0",borderRadius:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <span style={{fontSize:28}}>📷</span>
            <span style={{fontWeight:700,fontSize:14,color:DARK}}>Take or Choose Photo</span>
            <span style={{fontSize:12,color:"#a09abb"}}>(Scan connected to Claude in deployed app)</span>
          </div>
          {/* Mock scan result to show size field */}
          <div style={{marginTop:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#a09abb"}}>Preview — scan result with size field:</div>
            {[
              {item:"Chickpeas",brand:"Goya",size:"15 oz",category:"Canned Beans & Legumes"},
              {item:"Diced Tomatoes",brand:"Hunt's",size:"14.5 oz",category:"Canned Tomatoes"},
              {item:"Coconut Milk",brand:"Thai Kitchen",size:"13.5 fl oz",category:"Dairy & Shelf-Stable Milk"},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f0e8f8",fontSize:13}}>
                <span style={{flex:1,fontWeight:600}}>{s.item}</span>
                <span style={{color:"#a09abb",fontSize:11}}>{[s.brand,s.size].filter(Boolean).join(" · ")}</span>
                <span style={{background:"#f0e8f8",borderRadius:4,padding:"2px 6px",fontSize:11,color:ACCENT}}>{s.category}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button style={{...btn(ACCENT),flex:1,padding:11}}>Add All</button>
              <button style={{...btn("#f0e8f8",ACCENT),padding:"11px 14px"}}>Cancel</button>
            </div>
          </div>
        </div>}

        {/* LOG */}
        {tab==="log"&&<div>
          <div style={{fontWeight:800,fontSize:16,color:CARD,marginBottom:14}}>Activity — last 30 days</div>
          <div style={{background:CARD,borderRadius:14,padding:32,textAlign:"center",color:"#a09abb",fontSize:14}}>Log connects to Supabase in deployed app.</div>
        </div>}

        {/* HOW TO USE */}
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
          {HOW_TO.map(({label,options})=>(
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
