import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wzcnkfczkfjmphjzaeea.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y25rZmN6a2ZqbXBoanphZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODE5NDksImV4cCI6MjA4ODA1Nzk0OX0.mkXO4wnFk0l3-j3CIaCL3qoYt7oKvEmCEtm98ABWCvI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [tab, setTab] = useState("inventory");
  const [addForm, setAddForm] = useState({ item:"", brand:"", category:"", container:"Can", quantity:1 });
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});

  const notify = (msg, type="success") => {
    setNotification({msg, type});
    setTimeout(() => setNotification(null), 2500);
  };

  // Load items from Supabase
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .order("category", { ascending: true });
    if (error) { notify("Failed to load items", "error"); }
    else setItems(data);
    setLoading(false);
  };

  const updateQty = async (id, delta) => {
    const item = items.find(i => i.id === id);
    const newQty = Math.max(0, item.quantity + delta);
    const { error } = await supabase
      .from("pantry_items")
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) setItems(p => p.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (!error) { setItems(p => p.filter(i => i.id !== id)); setExpandedId(null); notify("Removed", "error"); }
  };

  const addItem = async () => {
    if (!addForm.item.trim() || !addForm.category.trim()) return;
    const { data, error } = await supabase
      .from("pantry_items")
      .insert([{ ...addForm, quantity: Number(addForm.quantity) }])
      .select();
    if (!error) {
      setItems(p => [...p, data[0]]);
      setAddForm({ item:"", brand:"", category:"", container:"Can", quantity:1 });
      notify("Added!");
      setTab("inventory");
    }
  };

  const allCats = ["All", ...Array.from(new Set(items.map(i => i.category))).sort()];
  const totalQty = items.reduce((a, i) => a + i.quantity, 0);
  const lowStock = items.filter(i => i.quantity <= 1).length;

  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    return (!s || i.item.toLowerCase().includes(s) || (i.brand||"").toLowerCase().includes(s))
      && (filterCat === "All" || i.category === filterCat);
  });

  const grouped = filtered.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i);
    return acc;
  }, {});

  const toggleCat = cat => setCollapsedCats(p => ({ ...p, [cat]: !p[cat] }));

  const inputStyle = {
    width:"100%", padding:"10px 14px", background:CARD,
    border:`1px solid ${CARD_BORDER}`, borderRadius:8, fontSize:13,
    color:TEXT, outline:"none", boxSizing:"border-box",
  };
  const btnBase = { border:"none", cursor:"pointer", fontWeight:600, fontSize:13 };

  return (
    <div style={{fontFamily:"'Inter',sans-serif", minHeight:"100vh", background:BG, color:TEXT}}>
      <style>{`::placeholder{color:${TEXT_MUTED}} select option{background:${CARD};color:${TEXT}} *{box-sizing:border-box} @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header */}
      <div style={{background:"#7c6bb5", borderBottom:`1px solid #6a5aaa`, padding:"14px 20px", position:"sticky", top:0, zIndex:20}}>
        <div style={{maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:44, height:44, borderRadius:12, background:CARD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0}}>🥫</div>
            <div>
              <span style={{fontWeight:900, fontSize:17, letterSpacing:"3px", color:CARD}}>MISE EN STOCK</span>
              <div style={{fontSize:11, color:"#d4c8f0", letterSpacing:"1px", marginTop:2}}>by tinkerbot studios</div>
            </div>
          </div>
          <div style={{display:"flex", gap:6, alignItems:"center"}}>
            <button onClick={fetchItems} style={{...btnBase, background:"#6a5aaa", border:"none", borderRadius:8, padding:"5px 10px", color:"#e0d8ff", fontSize:16}} title="Refresh">↻</button>
            <div style={{background:"#6a5aaa", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#e0d8ff"}}>
              <span style={{fontWeight:700}}>{items.length}</span> items · <span style={{fontWeight:700}}>{totalQty}</span> total
            </div>
            {lowStock > 0 && <div style={{background:"#5a2020", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#fca5a5"}}>⚠ {lowStock} low</div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:"#7068a8", borderBottom:`1px solid #6a5aaa`, position:"sticky", top:73, zIndex:19}}>
        <div style={{maxWidth:680, margin:"0 auto", display:"flex", padding:"0 20px"}}>
          {[["inventory","Inventory"],["add","+ Add"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{...btnBase, padding:"11px 18px", background:"none",
              color:tab===t?CARD:"#c4b8e8", borderBottom:tab===t?`2px solid ${CARD}`:"2px solid transparent", marginBottom:-1}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div style={{position:"fixed",top:16,right:16,background:notification.type==="error"?"#7f1d1d":"#3b2f6e",border:`1px solid ${notification.type==="error"?"#dc2626":"#7c6bb5"}`,color:notification.type==="error"?"#fca5a5":"#e0d8ff",padding:"10px 18px",borderRadius:10,fontWeight:600,fontSize:13,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",animation:"slideDown 0.2s ease"}}>
          {notification.msg}
        </div>
      )}

      <div style={{maxWidth:680, margin:"0 auto", padding:"20px 16px"}}>

        {/* INVENTORY */}
        {tab === "inventory" && (
          <>
            {loading ? (
              <div style={{textAlign:"center", padding:60, color:"#c4b8e8"}}>
                <div style={{fontSize:36, marginBottom:10}}>🥫</div>
                <div style={{fontWeight:600}}>Loading your pantry…</div>
              </div>
            ) : (
              <>
                <div style={{display:"flex", gap:8, marginBottom:16}}>
                  <div style={{flex:1, position:"relative"}}>
                    <span style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:TEXT_MUTED, fontSize:14}}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items or brands…" style={{...inputStyle, paddingLeft:34}}/>
                  </div>
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{...inputStyle, width:"auto", minWidth:140, cursor:"pointer"}}>
                    {allCats.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {Object.keys(grouped).sort().map(cat => {
                  const color = CAT_COLORS[cat] || "#94a3b8";
                  const emoji = CAT_EMOJI[cat] || "📦";
                  const collapsed = collapsedCats[cat];
                  return (
                    <div key={cat} style={{marginBottom:8, background:CARD, borderRadius:12, border:`1px solid ${CARD_BORDER}`, overflow:"hidden"}}>
                      <button onClick={() => toggleCat(cat)} style={{...btnBase, width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", textAlign:"left"}}>
                        <span style={{width:3, height:20, borderRadius:2, background:color, flexShrink:0}}/>
                        <span style={{fontSize:14}}>{emoji}</span>
                        <span style={{fontSize:13, fontWeight:700, color:TEXT, flex:1}}>{cat}</span>
                        <span style={{fontSize:11, color:TEXT_MUTED, background:"#00000010", borderRadius:5, padding:"2px 8px"}}>{grouped[cat].length}</span>
                        <span style={{fontSize:10, color:TEXT_MUTED, marginLeft:4}}>{collapsed ? "▶" : "▼"}</span>
                      </button>
                      {!collapsed && grouped[cat].map(item => {
                        const expanded = expandedId === item.id;
                        const qc = qtyColor(item.quantity);
                        return (
                          <div key={item.id} style={{borderTop:`1px solid ${CARD_BORDER_LIGHT}`}}>
                            <div onClick={() => setExpandedId(expanded ? null : item.id)}
                              style={{display:"flex", alignItems:"center", padding:"9px 16px", cursor:"pointer", background:expanded?"#00000006":"transparent", gap:12}}>
                              <span style={{minWidth:28, height:28, borderRadius:7, background:`${qc}22`, border:`1px solid ${qc}55`, color:qc, fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                                {item.quantity}
                              </span>
                              <span style={{flex:1, fontSize:13, fontWeight:500, color:TEXT}}>{item.item}</span>
                              <span style={{fontSize:11, color:TEXT_MUTED}}>{item.brand}</span>
                            </div>
                            {expanded && (
                              <div style={{padding:"10px 16px 12px 56px", background:"#00000006", borderTop:`1px solid ${CARD_BORDER_LIGHT}`, display:"flex", alignItems:"center", gap:10, animation:"fadeIn 0.15s ease"}}>
                                <span style={{fontSize:11, color:TEXT_MUTED, background:CARD_BORDER_LIGHT, borderRadius:5, padding:"3px 8px"}}>{item.container}</span>
                                <div style={{display:"flex", alignItems:"center", gap:6, marginLeft:"auto"}}>
                                  {[-1, 1].map(d => (
                                    <button key={d} onClick={e => { e.stopPropagation(); updateQty(item.id, d); }}
                                      style={{...btnBase, width:30, height:30, borderRadius:7, border:`1px solid ${CARD_BORDER}`, background:CARD, fontSize:16, color:TEXT, display:"flex", alignItems:"center", justifyContent:"center"}}>
                                      {d === -1 ? "−" : "+"}
                                    </button>
                                  ))}
                                  <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
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

                {Object.keys(grouped).length === 0 && (
                  <div style={{textAlign:"center", padding:60, color:"#c4b8e8"}}>
                    <div style={{fontSize:40, marginBottom:10}}>🔍</div>
                    <div style={{fontWeight:600}}>No items found</div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ADD */}
        {tab === "add" && (
          <div style={{background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:24, maxWidth:480}}>
            <h2 style={{margin:"0 0 20px", fontSize:16, fontWeight:800, color:TEXT}}>Add New Item</h2>
            {[["Item Name *","item","e.g. Coconut Milk"],["Brand","brand","e.g. Trader Joe's"],["Category *","category","e.g. Canned Vegetables"]].map(([label,field,placeholder]) => (
              <div key={field} style={{marginBottom:14}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>{label}</label>
                <input list={field==="category"?"cats":undefined} value={addForm[field]} onChange={e => setAddForm(f => ({...f, [field]: e.target.value}))} placeholder={placeholder} style={inputStyle}/>
              </div>
            ))}
            <datalist id="cats">{Array.from(new Set(items.map(i => i.category))).sort().map(c => <option key={c} value={c}/>)}</datalist>
            <div style={{display:"flex", gap:10, marginBottom:20}}>
              <div style={{flex:1}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>Container</label>
                <select value={addForm.container} onChange={e => setAddForm(f => ({...f, container: e.target.value}))} style={inputStyle}>
                  {["Can","Jar","Bottle","Box","Bag","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5}}>Quantity</label>
                <input type="number" min={1} value={addForm.quantity} onChange={e => setAddForm(f => ({...f, quantity: e.target.value}))} style={inputStyle}/>
              </div>
            </div>
            <button onClick={addItem} style={{...btnBase, width:"100%", padding:"12px", background:"#7c6bb5", color:"white", borderRadius:10, fontSize:14, fontWeight:700, boxShadow:"0 4px 16px #7c6bb540"}}>
              Add to Pantry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
