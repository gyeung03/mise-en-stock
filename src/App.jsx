import { useState, useRef } from "react";

const INITIAL_ITEMS = [
  { id: 1, category: "Broths & Stocks", item: "Beef Broth", brand: "College Inn", container: "Can", quantity: 1 },
  { id: 2, category: "Canned Beans & Legumes", item: "Garbanzo Beans", brand: "Trader Joe's", container: "Can", quantity: 1 },
  { id: 3, category: "Canned Beans & Legumes", item: "Giant Baked Beans in Tomato Sauce", brand: "Specialty brand", container: "Can", quantity: 1 },
  { id: 4, category: "Canned Beans & Legumes", item: "Navy Beans", brand: "Goya", container: "Can", quantity: 1 },
  { id: 5, category: "Canned Beans & Legumes", item: "Original Baked Beans", brand: "Bush's Best", container: "Can", quantity: 1 },
  { id: 6, category: "Canned Beans & Legumes (Sweet)", item: "Sweetened Red Beans (Ogura-An)", brand: "Akebono", container: "Can", quantity: 1 },
  { id: 7, category: "Canned Eggs & Specialty", item: "Quail Eggs", brand: "Butterfly", container: "Can", quantity: 1 },
  { id: 8, category: "Canned Fish & Seafood", item: "Calamari in Olive Oil", brand: "Trader Joe's", container: "Can", quantity: 2 },
  { id: 9, category: "Canned Fish & Seafood", item: "Codfish in Olive Oil", brand: "Bela", container: "Can", quantity: 1 },
  { id: 10, category: "Canned Fish & Seafood", item: "Light Tuna w/ Hot Pepper Sauce", brand: "Dong Won", container: "Can", quantity: 4 },
  { id: 11, category: "Canned Fish & Seafood", item: "Mackerel in Soy Sauce", brand: "Asian brand", container: "Can", quantity: 1 },
  { id: 12, category: "Canned Fish & Seafood", item: "Sardines (Skinless & Boneless)", brand: "Trader Joe's", container: "Can", quantity: 1 },
  { id: 13, category: "Canned Fish & Seafood", item: "Skipjack Wild Tuna", brand: "365", container: "Can", quantity: 3 },
  { id: 14, category: "Canned Fish & Seafood", item: "Solid White Albacore Tuna", brand: "Bumble Bee / Chicken of the Sea", container: "Can", quantity: 4 },
  { id: 15, category: "Canned Fish & Seafood", item: "Yellowfin Tuna in Olive Oil", brand: "Trader Joe's", container: "Can", quantity: 1 },
  { id: 16, category: "Canned Meats", item: "Corned Beef Hash", brand: "Libby's", container: "Can", quantity: 1 },
  { id: 17, category: "Canned Meats", item: "Spam (Classic)", brand: "Hormel", container: "Can", quantity: 1 },
  { id: 18, category: "Canned Shellfish", item: "Smoked Oysters", brand: "Crown Prince", container: "Can", quantity: 1 },
  { id: 19, category: "Canned Tomatoes", item: "Tomato Paste", brand: "Cento", container: "Can", quantity: 1 },
  { id: 20, category: "Canned Tomatoes", item: "Tomato Paste", brand: "Trader Joe's Organic", container: "Can", quantity: 1 },
  { id: 21, category: "Canned Tomatoes", item: "Tomato Paste", brand: "Happy Belly", container: "Can", quantity: 4 },
  { id: 22, category: "Canned Vegetables", item: "Bamboo Shoots (All Types)", brand: "Aroy-D / La Choy", container: "Can", quantity: 4 },
  { id: 23, category: "Canned Vegetables", item: "Fire Roasted Green Chiles", brand: "Trader Joe's", container: "Can", quantity: 1 },
  { id: 24, category: "Canned Vegetables", item: "Hearts of Palm", brand: "Trader Joe's", container: "Can", quantity: 1 },
  { id: 25, category: "Canned Vegetables", item: "Pitted Ripe Olives (Large)", brand: "Amazon Grocery", container: "Can", quantity: 1 },
  { id: 26, category: "Canned Vegetables", item: "Straw Mushrooms", brand: "Roland", container: "Can", quantity: 1 },
  { id: 27, category: "Canned Vegetables", item: "Wegmans French Style Green Beans", brand: "Wegmans", container: "Can", quantity: 1 },
  { id: 28, category: "Canned Vegetables", item: "Del Monte Sweet Corn (Cream Style)", brand: "Del Monte", container: "Can", quantity: 1 },
  { id: 29, category: "Canned Vegetables", item: "Amazon Grocery Cream Style Corn", brand: "Amazon Grocery", container: "Can", quantity: 3 },
  { id: 30, category: "Condiments & Chili Pastes", item: "Italian Bomba Hot Pepper Sauce", brand: "Trader Joe's", container: "Jar", quantity: 2 },
  { id: 31, category: "Condiments & Chili Pastes", item: "Sambal Oelek", brand: "Huy Fong", container: "Jar", quantity: 1 },
  { id: 32, category: "Condiments & Pickled Items", item: "Dijon Mustard (White Wine)", brand: "Trader Joe's", container: "Jar", quantity: 1 },
  { id: 33, category: "Condiments & Pickled Items", item: "Pickled Chili Vegetables", brand: "Chinese brand", container: "Jar", quantity: 1 },
  { id: 34, category: "Condiments & Pickled Items", item: "Pickled Sliced Beets", brand: "Great Value", container: "Jar", quantity: 1 },
  { id: 35, category: "Condiments & Preserved Vegetables", item: "Colossal Garlic-Stuffed Olives", brand: "Trader Joe's", container: "Jar", quantity: 1 },
  { id: 36, category: "Condiments & Preserved Vegetables", item: "Sun-Dried Tomatoes (Julienne)", brand: "Trader Joe's", container: "Jar", quantity: 1 },
  { id: 37, category: "Condiments & Sauces", item: "Peri-Peri Sauce", brand: "Trader Joe's", container: "Bottle", quantity: 1 },
  { id: 38, category: "Condiments & Sauces", item: "Kraft Classic Caesar Dressing", brand: "Kraft", container: "Bottle", quantity: 1 },
  { id: 39, category: "Dairy & Shelf-Stable Milk", item: "Evaporated Milk", brand: "Angel", container: "Can", quantity: 1 },
  { id: 40, category: "Dairy & Shelf-Stable Milk", item: "Coconut Milk", brand: "Aroy-D", container: "Can", quantity: 2 },
  { id: 41, category: "Gravies & Meal Sauces", item: "Poutine Gravy (Original)", brand: "St-Hubert", container: "Can", quantity: 1 },
  { id: 42, category: "Gravies & Meal Sauces", item: "Turkey Flavored Gravy (Gluten Free)", brand: "Trader Joe's", container: "Box", quantity: 1 },
  { id: 43, category: "Prepared Meals", item: "Spaghetti & Meatballs", brand: "Chef Boyardee", container: "Can", quantity: 1 },
  { id: 44, category: "Sauces & Cooking Bases", item: "Rosatella Pasta Sauce", brand: "Trader Joe's", container: "Jar", quantity: 1 },
  { id: 45, category: "Sauces & Cooking Bases", item: "Prego Traditional Pasta Sauce", brand: "Prego", container: "Jar", quantity: 1 },
  { id: 46, category: "Sauces & Cooking Bases", item: "White Clam Sauce (Garlic & Herb)", brand: "Progresso", container: "Can", quantity: 1 },
  { id: 47, category: "Soups", item: "Cream of Chicken Soup (Condensed)", brand: "Chef's Cupboard", container: "Can", quantity: 3 },
  { id: 48, category: "Soups", item: "Tomato Condensed Soup", brand: "Happy Belly", container: "Can", quantity: 1 },
];

const CAT_EMOJI = {
  "Broths & Stocks":"🍲","Canned Beans & Legumes":"🫘","Canned Beans & Legumes (Sweet)":"🍮",
  "Canned Eggs & Specialty":"🥚","Canned Fish & Seafood":"🐟","Canned Meats":"🥩",
  "Canned Shellfish":"🦪","Canned Tomatoes":"🍅","Canned Vegetables":"🥦",
  "Condiments & Chili Pastes":"🌶️","Condiments & Pickled Items":"🥒",
  "Condiments & Preserved Vegetables":"🫒","Condiments & Sauces":"🍶",
  "Dairy & Shelf-Stable Milk":"🥛","Gravies & Meal Sauces":"🥣",
  "Prepared Meals":"🍝","Sauces & Cooking Bases":"🫙","Soups":"🍜","Other":"📦"
};

const CAT_COLORS = {
  "Broths & Stocks":"#38bdf8","Canned Beans & Legumes":"#fbbf24","Canned Beans & Legumes (Sweet)":"#f472b6",
  "Canned Eggs & Specialty":"#facc15","Canned Fish & Seafood":"#60a5fa","Canned Meats":"#f87171",
  "Canned Shellfish":"#22d3ee","Canned Tomatoes":"#fb923c","Canned Vegetables":"#4ade80",
  "Condiments & Chili Pastes":"#ef4444","Condiments & Pickled Items":"#a3e635",
  "Condiments & Preserved Vegetables":"#c084fc","Condiments & Sauces":"#fde68a",
  "Dairy & Shelf-Stable Milk":"#a78bfa","Gravies & Meal Sauces":"#fdba74",
  "Prepared Meals":"#2dd4bf","Sauces & Cooking Bases":"#e879f9","Soups":"#818cf8","Other":"#94a3b8"
};

const BG = "#8a78c0";
const CARD = "#fdf0e8";
const CARD_BORDER = "#e8c9aa";
const CARD_BORDER_LIGHT = "#f0d8bc";
const TEXT = "#2d1f5e";
const TEXT_MUTED = "#9985c0";
const TEXT_SUB = "#6b5a9e";

function qtyColor(q) {
  if (q === 0) return "#ef4444";
  if (q === 1) return "#f97316";
  if (q === 2) return "#eab308";
  return "#16a34a";
}

export default function App() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [tab, setTab] = useState("inventory");
  const [addForm, setAddForm] = useState({ item:"", brand:"", category:"", container:"Can", quantity:1 });
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [scanImage, setScanImage] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMode, setScanMode] = useState("add");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [newCatReview, setNewCatReview] = useState(null);
  const [catEdits, setCatEdits] = useState({});
  const fileRef = useRef();
  const nextId = useRef(200);

  const notify = (msg, type="success") => {
    setNotification({msg,type});
    setTimeout(()=>setNotification(null), 2500);
  };

  const allCats = ["All", ...Array.from(new Set(items.map(i=>i.category))).sort()];
  const totalQty = items.reduce((a,i)=>a+i.quantity, 0);
  const lowStock = items.filter(i=>i.quantity<=1).length;

  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    return (!s || i.item.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s))
      && (filterCat==="All" || i.category===filterCat);
  });

  const grouped = filtered.reduce((acc,i)=>{
    (acc[i.category]=acc[i.category]||[]).push(i);
    return acc;
  },{});

  const updateQty = (id,d) => setItems(p=>p.map(i=>i.id===id?{...i,quantity:Math.max(0,i.quantity+d)}:i));
  const deleteItem = id => { setItems(p=>p.filter(i=>i.id!==id)); setExpandedId(null); notify("Removed","error"); };

  const addItem = () => {
    if(!addForm.item.trim()||!addForm.category.trim()) return;
    setItems(p=>[...p,{...addForm,id:nextId.current++,quantity:Number(addForm.quantity)}]);
    setAddForm({item:"",brand:"",category:"",container:"Can",quantity:1});
    notify("Added!"); setTab("inventory");
  };

  const handleFile = file => {
    setScanImage(URL.createObjectURL(file));
    setScanLoading(true); setScanResult(null);
    const r = new FileReader();
    r.onload = async e => {
      const b64 = e.target.result.split(",")[1];
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},
            {type:"text",text:`Identify all pantry items in this image. Return ONLY a JSON array: [{"item":"name","brand":"brand or empty","container":"Can/Jar/Bottle/Box/Bag/Other","quantity":1,"category":"best match from: Broths & Stocks, Canned Beans & Legumes, Canned Fish & Seafood, Canned Meats, Canned Shellfish, Canned Tomatoes, Canned Vegetables, Condiments & Chili Pastes, Condiments & Pickled Items, Condiments & Preserved Vegetables, Condiments & Sauces, Dairy & Shelf-Stable Milk, Gravies & Meal Sauces, Prepared Meals, Sauces & Cooking Bases, Soups, Other"}]. No other text.`}
          ]}]})
        });
        const data = await res.json();
        const txt = data.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
        setScanResult(JSON.parse(txt));
      } catch { setScanResult({error:true}); }
      setScanLoading(false);
    };
    r.readAsDataURL(file);
  };

  const applyScan = scanned => {
    const existingCats = Array.from(new Set(items.map(i => i.category)));
    const newCats = [...new Set(scanned.map(s => s.category).filter(c => !existingCats.includes(c)))];

    if (scanMode === "add" && newCats.length > 0) {
      setNewCatReview({ scanned, newCats });
      setCatEdits(Object.fromEntries(newCats.map(c => [c, c])));
      return;
    }
    commitScan(scanned);
  };

  const commitScan = (scanned, edits = {}) => {
    const resolved = scanned.map(s => ({ ...s, category: edits[s.category] || s.category }));
    if (scanMode === "add") {
      setItems(p => [...p, ...resolved.map(s => ({ ...s, id: nextId.current++, quantity: s.quantity || 1 }))]);
      notify(`Added ${resolved.length} item(s)!`);
    } else {
      let upd = [...items], removed = 0;
      resolved.forEach(s => {
        const idx = upd.findIndex(i => i.item.toLowerCase().includes(s.item.toLowerCase()) || s.item.toLowerCase().includes(i.item.toLowerCase()));
        if (idx !== -1) { const nq = upd[idx].quantity - (s.quantity || 1); if (nq <= 0) upd.splice(idx, 1); else upd[idx] = { ...upd[idx], quantity: nq }; removed++; }
      });
      setItems(upd); notify(`Removed ${removed} item(s)`);
    }
    setNewCatReview(null); setCatEdits({});
    setScanResult(null); setScanImage(null); setTab("inventory");
  };

  const toggleCat = cat => setCollapsedCats(p=>({...p,[cat]:!p[cat]}));

  const inputStyle = {
    width:"100%", padding:"10px 14px", background:CARD,
    border:`1px solid ${CARD_BORDER}`, borderRadius:8, fontSize:13,
    color:TEXT, outline:"none", boxSizing:"border-box",
  };

  const btnBase = {border:"none", cursor:"pointer", fontWeight:600, fontSize:13};

  return (
    <div style={{fontFamily:"'Inter',sans-serif", minHeight:"100vh", background:BG, color:TEXT}}>
      <style>{`::placeholder{color:${TEXT_MUTED}} select option{background:${CARD};color:${TEXT}} *{box-sizing:border-box} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header */}
      <div style={{background:"#7c6bb5", borderBottom:`1px solid #6a5aaa`, padding:"14px 20px", position:"sticky", top:0, zIndex:20}}>
        <div style={{maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:44, height:44, borderRadius:12, background:CARD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0}}>
              🥫
            </div>
            <div>
              <span style={{fontWeight:900, fontSize:17, letterSpacing:"3px", color:CARD}}>MISE EN STOCK</span>
              <div style={{fontSize:11, color:"#d4c8f0", letterSpacing:"1px", marginTop:2}}>by tinkerbot studios</div>
            </div>
          </div>
          <div style={{display:"flex", gap:6}}>
            <div style={{background:"#6a5aaa", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#e0d8ff"}}>
              <span style={{fontWeight:700}}>{items.length}</span> items · <span style={{fontWeight:700}}>{totalQty}</span> total
            </div>
            {lowStock>0&&<div style={{background:"#5a2020", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#fca5a5"}}>⚠ {lowStock} low</div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:"#7068a8", borderBottom:`1px solid #6a5aaa`, position:"sticky", top:73, zIndex:19}}>
        <div style={{maxWidth:680, margin:"0 auto", display:"flex", padding:"0 20px"}}>
          {[["inventory","Inventory"],["add","+ Add"],["scan","📸 Scan"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{...btnBase, padding:"11px 18px", background:"none",
              color:tab===t?CARD:"#c4b8e8", borderBottom:tab===t?`2px solid ${CARD}`:"2px solid transparent", marginBottom:-1, transition:"color 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {notification&&(
        <div style={{position:"fixed",top:16,right:16,background:notification.type==="error"?"#7f1d1d":"#3b2f6e",border:`1px solid ${notification.type==="error"?"#dc2626":"#7c6bb5"}`,color:notification.type==="error"?"#fca5a5":"#e0d8ff",padding:"10px 18px",borderRadius:10,fontWeight:600,fontSize:13,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",animation:"slideDown 0.2s ease"}}>
          {notification.msg}
        </div>
      )}

      <div style={{maxWidth:680, margin:"0 auto", padding:"20px 16px"}}>

        {tab==="inventory"&&(
          <>
            <div style={{display:"flex", gap:8, marginBottom:16}}>
              <div style={{flex:1, position:"relative"}}>
                <span style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:TEXT_MUTED, fontSize:14}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items or brands…" style={{...inputStyle, paddingLeft:34}}/>
              </div>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...inputStyle, width:"auto", minWidth:140, cursor:"pointer"}}>
                {allCats.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {Object.keys(grouped).sort().map(cat=>{
              const color = CAT_COLORS[cat]||"#94a3b8";
              const emoji = CAT_EMOJI[cat]||"📦";
              const collapsed = collapsedCats[cat];
              return (
                <div key={cat} style={{marginBottom:8, background:CARD, borderRadius:12, border:`1px solid ${CARD_BORDER}`, overflow:"hidden"}}>
                  <button onClick={()=>toggleCat(cat)} style={{...btnBase, width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", textAlign:"left"}}>
                    <span style={{width:3, height:20, borderRadius:2, background:color, flexShrink:0}}/>
                    <span style={{fontSize:14}}>{emoji}</span>
                    <span style={{fontSize:13, fontWeight:700, color:TEXT, flex:1}}>{cat}</span>
                    <span style={{fontSize:11, color:TEXT_MUTED, background:"#00000010", borderRadius:5, padding:"2px 8px"}}>{grouped[cat].length}</span>
                    <span style={{fontSize:10, color:TEXT_MUTED, marginLeft:4}}>{collapsed?"▶":"▼"}</span>
                  </button>
                  {!collapsed && grouped[cat].map(item=>{
                    const expanded = expandedId===item.id;
                    const qc = qtyColor(item.quantity);
                    return (
                      <div key={item.id} style={{borderTop:`1px solid ${CARD_BORDER_LIGHT}`}}>
                        <div onClick={()=>setExpandedId(expanded?null:item.id)}
                          style={{display:"flex", alignItems:"center", padding:"9px 16px", cursor:"pointer", background:expanded?"#00000006":"transparent", gap:12}}>
                          <span style={{minWidth:28, height:28, borderRadius:7, background:`${qc}22`, border:`1px solid ${qc}55`, color:qc, fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                            {item.quantity}
                          </span>
                          <span style={{flex:1, fontSize:13, fontWeight:500, color:TEXT}}>{item.item}</span>
                          <span style={{fontSize:11, color:TEXT_MUTED}}>{item.brand}</span>
                        </div>
                        {expanded&&(
                          <div style={{padding:"10px 16px 12px 56px", background:"#00000006", borderTop:`1px solid ${CARD_BORDER_LIGHT}`, display:"flex", alignItems:"center", gap:10, animation:"fadeIn 0.15s ease"}}>
                            <span style={{fontSize:11, color:TEXT_MUTED, background:CARD_BORDER_LIGHT, borderRadius:5, padding:"3px 8px"}}>{item.container}</span>
                            <div style={{display:"flex", alignItems:"center", gap:6, marginLeft:"auto"}}>
                              {[-1,1].map(d=>(
                                <button key={d} onClick={e=>{e.stopPropagation();updateQty(item.id,d);}}
                                  style={{...btnBase, width:30, height:30, borderRadius:7, border:`1px solid ${CARD_BORDER}`, background:CARD, fontSize:16, color:TEXT, display:"flex", alignItems:"center", justifyContent:"center"}}>
                                  {d===-1?"−":"+"}
                                </button>
                              ))}
                              <button onClick={e=>{e.stopPropagation();deleteItem(item.id);}}
                                style={{...btnBase, marginLeft:6, width:30, height:30, borderRadius:7, border:"1px solid #fca5a5", background:"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13}}>
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {Object.keys(grouped).length===0&&(
              <div style={{textAlign:"center", padding:60, color:"#c4b8e8"}}>
                <div style={{fontSize:40, marginBottom:10}}>🔍</div>
                <div style={{fontWeight:600}}>No items found</div>
              </div>
            )}
          </>
        )}

        {tab==="add"&&(
          <div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:24, maxWidth:480}}>
            <h2 style={{margin:"0 0 20px", fontSize:16, fontWeight:800, color:TEXT}}>Add New Item</h2>
            {[["Item Name *","item","e.g. Coconut Milk"],["Brand","brand","e.g. Trader Joe's"],["Category *","category","e.g. Canned Vegetables"]].map(([label,field,placeholder])=>(
              <div key={field} style={{marginBottom:14}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>{label}</label>
                <input list={field==="category"?"cats":undefined} value={addForm[field]} onChange={e=>setAddForm(f=>({...f,[field]:e.target.value}))} placeholder={placeholder} style={inputStyle}/>
              </div>
            ))}
            <datalist id="cats">{Array.from(new Set(items.map(i=>i.category))).sort().map(c=><option key={c} value={c}/>)}</datalist>
            <div style={{display:"flex", gap:10, marginBottom:20}}>
              <div style={{flex:1}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>Container</label>
                <select value={addForm.container} onChange={e=>setAddForm(f=>({...f,container:e.target.value}))} style={inputStyle}>
                  {["Can","Jar","Bottle","Box","Bag","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>Quantity</label>
                <input type="number" min={1} value={addForm.quantity} onChange={e=>setAddForm(f=>({...f,quantity:e.target.value}))} style={inputStyle}/>
              </div>
            </div>
            <button onClick={addItem} style={{...btnBase, width:"100%", padding:"12px", background:"#7c6bb5", color:"white", borderRadius:10, fontSize:14, fontWeight:700, boxShadow:"0 4px 16px #7c6bb540"}}>
              Add to Pantry
            </button>
          </div>
        )}

        {tab==="scan"&&(
          <div style={{maxWidth:480}}>
            <div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:22, marginBottom:12}}>
              <h2 style={{margin:"0 0 6px", fontSize:16, fontWeight:800, color:TEXT}}>Scan Items</h2>
              <p style={{color:TEXT_MUTED, fontSize:13, margin:"0 0 18px"}}>Photo your pantry items — AI will identify and update your inventory.</p>
              <div style={{display:"flex", gap:8, marginBottom:18}}>
                {[["add","➕ Add items"],["remove","➖ Remove items"]].map(([m,l])=>(
                  <button key={m} onClick={()=>setScanMode(m)} style={{...btnBase, flex:1, padding:"10px", borderRadius:9, border:`1.5px solid ${scanMode===m?"#7c6bb5":CARD_BORDER}`, background:scanMode===m?"#7c6bb520":CARD, color:scanMode===m?"#5a4a9e":TEXT_MUTED}}>
                    {l}
                  </button>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
              <button onClick={()=>fileRef.current.click()} style={{...btnBase, width:"100%", padding:"36px 20px", border:`2px dashed ${CARD_BORDER}`, borderRadius:12, background:"#00000005", color:TEXT_MUTED, display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                <span style={{fontSize:38}}>📷</span>
                <span>Tap to upload or take photo</span>
                <span style={{fontSize:11, opacity:0.6}}>JPG, PNG, WebP supported</span>
              </button>
            </div>
            {scanImage&&<div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:10, marginBottom:12}}>
              <img src={scanImage} alt="" style={{width:"100%", borderRadius:8, maxHeight:220, objectFit:"cover"}}/>
            </div>}
            {scanLoading&&<div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:32, textAlign:"center"}}>
              <div style={{fontSize:30, marginBottom:10}}>🔍</div>
              <div style={{fontWeight:600, fontSize:14, color:TEXT_MUTED}}>Identifying items…</div>
            </div>}
            {scanResult&&!scanResult.error&&Array.isArray(scanResult)&&(
              <div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:18}}>
                <div style={{fontWeight:700, fontSize:14, marginBottom:12, color:TEXT}}>Found {scanResult.length} item(s)</div>
                {scanResult.map((s,i)=>(
                  <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${CARD_BORDER_LIGHT}`}}>
                    <div>
                      <div style={{fontWeight:600, fontSize:13, color:TEXT}}>{s.item}</div>
                      <div style={{fontSize:11, color:TEXT_MUTED}}>{s.brand} · {s.category}</div>
                    </div>
                    <span style={{fontWeight:700, fontSize:14, color:"#7c6bb5"}}>×{s.quantity}</span>
                  </div>
                ))}
                <div style={{display:"flex", gap:8, marginTop:16}}>
                  <button onClick={()=>applyScan(scanResult)} style={{...btnBase, flex:1, padding:"11px", background:"#7c6bb5", color:"white", borderRadius:9, fontSize:13}}>
                    {scanMode==="add"?"➕ Add All":"➖ Remove All"}
                  </button>
                  <button onClick={()=>{setScanResult(null);setScanImage(null);}} style={{...btnBase, padding:"11px 16px", background:CARD, border:`1px solid ${CARD_BORDER}`, borderRadius:9, color:TEXT_SUB}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {scanResult?.error&&<div style={{background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:10, padding:14, color:"#ef4444", fontSize:13}}>
              ⚠️ Couldn't identify items. Try a clearer photo.
            </div>}
          </div>
        )}
      </div>

      {newCatReview && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
          <div style={{background:CARD, borderRadius:16, padding:24, maxWidth:440, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <h3 style={{margin:"0 0 6px", fontSize:16, fontWeight:800, color:TEXT}}>✨ New Categories Found</h3>
            <p style={{fontSize:13, color:TEXT_MUTED, margin:"0 0 18px"}}>The AI suggested these new categories. Edit the names or pick an existing one before adding.</p>
            {newCatReview.newCats.map(cat => (
              <div key={cat} style={{marginBottom:14}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>
                  AI suggested: <span style={{color:"#7c6bb5"}}>{cat}</span>
                </label>
                <input
                  list="existing-cats"
                  value={catEdits[cat] || cat}
                  onChange={e => setCatEdits(p => ({...p, [cat]: e.target.value}))}
                  style={inputStyle}
                />
              </div>
            ))}
            <datalist id="existing-cats">
              {Array.from(new Set(items.map(i => i.category))).sort().map(c => <option key={c} value={c}/>)}
            </datalist>
            <div style={{display:"flex", gap:8, marginTop:20}}>
              <button onClick={() => commitScan(newCatReview.scanned, catEdits)}
                style={{...btnBase, flex:1, padding:"11px", background:"#7c6bb5", color:"white", borderRadius:9, fontSize:13, fontWeight:700}}>
                ✅ Looks good, add items
              </button>
              <button onClick={() => { setNewCatReview(null); setCatEdits({}); }}
                style={{...btnBase, padding:"11px 16px", background:"white", border:`1px solid ${CARD_BORDER}`, borderRadius:9, color:TEXT_SUB}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
