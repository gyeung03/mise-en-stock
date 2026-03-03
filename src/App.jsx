import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wzcnkfczkfjmphjzaeea.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Y25rZmN6a2ZqbXBoanphZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODE5NDksImV4cCI6MjA4ODA1Nzk0OX0.mkXO4wnFk0l3-j3CIaCL3qoYt7oKvEmCEtm98ABWCvI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auto-categorize routes through /api/claude (serverless, keeps API key secret)
const callClaude = async (body) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

// Scan routes through the existing /api/scan serverless function
const callScan = async (image, mimeType) => {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mimeType }),
  });
  return res.json();
};

const CATEGORIES = [
  "Broths & Stocks","Canned Beans & Legumes","Canned Beans & Legumes (Sweet)",
  "Canned Eggs & Specialty","Canned Fish & Seafood","Canned Meats","Canned Shellfish",
  "Canned Tomatoes","Canned Vegetables","Condiments & Chili Pastes","Condiments & Pickled Items",
  "Condiments & Preserved Vegetables","Condiments & Sauces","Dairy & Shelf-Stable Milk",
  "Gravies & Meal Sauces","Prepared Meals","Sauces & Cooking Bases","Soups","Other"
];

const SEED_ITEMS = [
  { category:"Broths & Stocks",                   item:"Beef Broth",                                       brand:"College Inn",                     container:"Can",    quantity:1 },
  { category:"Canned Beans & Legumes",            item:"Garbanzo Beans",                                   brand:"Trader Joe's",                    container:"Can",    quantity:1 },
  { category:"Canned Beans & Legumes",            item:"Giant Baked Beans in Tomato Sauce",                brand:"Specialty brand",                 container:"Can",    quantity:1 },
  { category:"Canned Beans & Legumes",            item:"Navy Beans",                                       brand:"Goya",                            container:"Can",    quantity:1 },
  { category:"Canned Beans & Legumes",            item:"Original Baked Beans",                             brand:"Bush's Best",                     container:"Can",    quantity:1 },
  { category:"Canned Beans & Legumes (Sweet)",    item:"Sweetened Red Beans (Ogura-An)",                   brand:"Akebono",                         container:"Can",    quantity:1 },
  { category:"Canned Eggs & Specialty",           item:"Quail Eggs",                                       brand:"Butterfly",                       container:"Can",    quantity:1 },
  { category:"Canned Fish & Seafood",             item:"Calamari in Olive Oil",                            brand:"Trader Joe's",                    container:"Can",    quantity:2 },
  { category:"Canned Fish & Seafood",             item:"Codfish in Olive Oil",                             brand:"Bela",                            container:"Can",    quantity:1 },
  { category:"Canned Fish & Seafood",             item:"Light Tuna w/ Hot Pepper Sauce",                   brand:"Dong Won",                        container:"Can",    quantity:4 },
  { category:"Canned Fish & Seafood",             item:"Mackerel in Soy Sauce",                            brand:"Asian brand",                     container:"Can",    quantity:1 },
  { category:"Canned Fish & Seafood",             item:"Sardines (Skinless & Boneless)",                   brand:"Trader Joe's",                    container:"Can",    quantity:1 },
  { category:"Canned Fish & Seafood",             item:"Skipjack Wild Tuna",                               brand:"365",                             container:"Can",    quantity:3 },
  { category:"Canned Fish & Seafood",             item:"Solid White Albacore Tuna",                        brand:"Bumble Bee / Chicken of the Sea", container:"Can",    quantity:4 },
  { category:"Canned Fish & Seafood",             item:"Yellowfin Tuna in Olive Oil",                      brand:"Trader Joe's",                    container:"Can",    quantity:1 },
  { category:"Canned Meats",                      item:"Corned Beef Hash",                                 brand:"Libby's",                         container:"Can",    quantity:1 },
  { category:"Canned Meats",                      item:"Spam (Classic)",                                   brand:"Hormel",                          container:"Can",    quantity:1 },
  { category:"Canned Shellfish",                  item:"Smoked Oysters",                                   brand:"Crown Prince",                    container:"Can",    quantity:1 },
  { category:"Canned Tomatoes",                   item:"Tomato Paste",                                     brand:"Cento",                           container:"Can",    quantity:1 },
  { category:"Canned Tomatoes",                   item:"Tomato Paste",                                     brand:"Trader Joe's Organic",            container:"Can",    quantity:1 },
  { category:"Canned Tomatoes",                   item:"Tomato Paste",                                     brand:"Happy Belly",                     container:"Can",    quantity:4 },
  { category:"Canned Vegetables",                 item:"Bamboo Shoots (All Types)",                        brand:"Aroy-D / La Choy",                container:"Can",    quantity:4 },
  { category:"Canned Vegetables",                 item:"Fire Roasted Green Chiles",                        brand:"Trader Joe's",                    container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Hearts of Palm",                                   brand:"Trader Joe's",                    container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Pitted Ripe Olives (Large)",                       brand:"Amazon Grocery",                  container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Straw Mushrooms",                                  brand:"Roland",                          container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Wegmans French Style Green Beans (No Salt Added)", brand:"Wegmans",                         container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Del Monte Sweet Corn (Cream Style)",               brand:"Del Monte",                       container:"Can",    quantity:1 },
  { category:"Canned Vegetables",                 item:"Amazon Grocery Cream Style Corn",                  brand:"Amazon Grocery",                  container:"Can",    quantity:3 },
  { category:"Condiments & Chili Pastes",         item:"Italian Bomba Hot Pepper Sauce",                   brand:"Trader Joe's",                    container:"Jar",    quantity:2 },
  { category:"Condiments & Chili Pastes",         item:"Sambal Oelek",                                     brand:"Huy Fong",                        container:"Jar",    quantity:1 },
  { category:"Condiments & Pickled Items",        item:"Dijon Mustard (White Wine)",                       brand:"Trader Joe's",                    container:"Jar",    quantity:1 },
  { category:"Condiments & Pickled Items",        item:"Pickled Chili Vegetables",                         brand:"Chinese brand",                   container:"Jar",    quantity:1 },
  { category:"Condiments & Pickled Items",        item:"Pickled Sliced Beets",                             brand:"Great Value",                     container:"Jar",    quantity:1 },
  { category:"Condiments & Preserved Vegetables", item:"Colossal Garlic-Stuffed Olives",                   brand:"Trader Joe's",                    container:"Jar",    quantity:1 },
  { category:"Condiments & Preserved Vegetables", item:"Sun-Dried Tomatoes (Julienne)",                    brand:"Trader Joe's",                    container:"Jar",    quantity:1 },
  { category:"Condiments & Sauces",               item:"Peri-Peri Sauce",                                  brand:"Trader Joe's",                    container:"Bottle", quantity:1 },
  { category:"Condiments & Sauces",               item:"Kraft Classic Caesar Dressing",                    brand:"Kraft",                           container:"Bottle", quantity:1 },
  { category:"Dairy & Shelf-Stable Milk",         item:"Evaporated Milk",                                  brand:"Angel",                           container:"Can",    quantity:1 },
  { category:"Dairy & Shelf-Stable Milk",         item:"Coconut Milk",                                     brand:"Aroy-D",                          container:"Can",    quantity:2 },
  { category:"Gravies & Meal Sauces",             item:"Poutine Gravy (Original)",                         brand:"St-Hubert",                       container:"Can",    quantity:1 },
  { category:"Gravies & Meal Sauces",             item:"Turkey Flavored Gravy (Gluten Free)",              brand:"Trader Joe's",                    container:"Box",    quantity:1 },
  { category:"Prepared Meals",                    item:"Spaghetti & Meatballs",                             brand:"Chef Boyardee",                   container:"Can",    quantity:1 },
  { category:"Sauces & Cooking Bases",            item:"Rosatella Pasta Sauce",                             brand:"Trader Joe's",                    container:"Jar",    quantity:1 },
  { category:"Sauces & Cooking Bases",            item:"Prego Traditional Pasta Sauce",                    brand:"Prego",                           container:"Jar",    quantity:1 },
  { category:"Sauces & Cooking Bases",            item:"White Clam Sauce (Garlic & Herb)",                 brand:"Progresso",                       container:"Can",    quantity:1 },
  { category:"Soups",                             item:"Cream of Chicken Soup (Condensed)",                brand:"Chef's Cupboard",                 container:"Can",    quantity:3 },
  { category:"Soups",                             item:"Tomato Condensed Soup",                             brand:"Happy Belly",                     container:"Can",    quantity:1 },
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [tab, setTab] = useState("inventory");
  const [addForm, setAddForm] = useState({ item:"", brand:"", category:"", container:"Can", quantity:1 });
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});
  const [categorizing, setCategorizing] = useState(false);
  const [scanImg, setScanImg] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMode, setScanMode] = useState("add");

  const cameraRef = useRef();
  const uploadRef = useRef();

  const notify = (msg, type="success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("pantry_items").select("*").order("category");
    if (error) { notify("Failed to load items", "error"); setLoading(false); return; }
    if (data.length === 0) {
      const { data: seeded, error: seedErr } = await supabase.from("pantry_items").insert(SEED_ITEMS).select();
      if (!seedErr) setItems(seeded);
      else notify("Failed to seed pantry", "error");
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const updateQty = async (id, delta) => {
    const item = items.find(i => i.id === id);
    const newQty = Math.max(0, item.quantity + delta);
    const { error } = await supabase.from("pantry_items").update({ quantity: newQty }).eq("id", id);
    if (!error) setItems(p => p.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (!error) { setItems(p => p.filter(i => i.id !== id)); setExpandedId(null); notify("Removed", "error"); }
  };

  const autoCategorize = async (itemName) => {
    if (!itemName.trim()) return;
    setCategorizing(true);
    try {
      const data = await callClaude({
        model: "claude-sonnet-4-20250514", max_tokens: 50,
        messages: [{ role:"user", content:`Which single category best fits "${itemName}"? Choose exactly one from this list and reply with ONLY that category name, nothing else: ${CATEGORIES.join(", ")}` }]
      });
      const cat = data.content.map(c => c.text || "").join("").trim();
      if (CATEGORIES.includes(cat)) setAddForm(f => ({ ...f, category: cat }));
    } catch {}
    setCategorizing(false);
  };

  const addItem = async () => {
    if (!addForm.item.trim()) return;
    if (!addForm.category) { notify("Still detecting category, please wait…", "error"); return; }
    const { data, error } = await supabase.from("pantry_items").insert([{ ...addForm, quantity: Number(addForm.quantity) }]).select();
    if (!error) {
      setItems(p => [...p, data[0]]);
      setAddForm({ item:"", brand:"", category:"", container:"Can", quantity:1 });
      notify("Added!");
      setTab("inventory");
    }
  };

  const handleScanFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result.split(",")[1];
      const mime = file.type || "image/jpeg";
      setScanImg(e.target.result);
      setScanLoading(true);
      setScanResult(null);
      try {
        const data = await callScan(b64, mime);
        if (data.items) setScanResult(data.items);
        else setScanResult({ error: true });
      } catch { setScanResult({ error: true }); }
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const applyScan = async (scanned) => {
    if (scanMode === "add") {
      const { data, error } = await supabase.from("pantry_items")
        .insert(scanned.map(s => ({ item:s.item, brand:s.brand||"", category:s.category, container:s.container||"Can", quantity:s.quantity||1 })))
        .select();
      if (!error) { setItems(p => [...p, ...data]); notify(`Added ${data.length} item(s)!`); }
      else notify("Failed to save items", "error");
    } else {
      let removed = 0;
      for (const s of scanned) {
        const match = items.find(i => i.item.toLowerCase().includes(s.item.toLowerCase()) || s.item.toLowerCase().includes(i.item.toLowerCase()));
        if (match) {
          const newQty = match.quantity - (s.quantity || 1);
          if (newQty <= 0) {
            await supabase.from("pantry_items").delete().eq("id", match.id);
            setItems(p => p.filter(i => i.id !== match.id));
          } else {
            await supabase.from("pantry_items").update({ quantity: newQty }).eq("id", match.id);
            setItems(p => p.map(i => i.id === match.id ? { ...i, quantity: newQty } : i));
          }
          removed++;
        }
      }
      notify(`Removed ${removed} item(s)`);
    }
    setScanResult(null);
    setScanImg(null);
    setTab("inventory");
  };

  const allCats = ["All", ...Array.from(new Set(items.map(i => i.category))).sort()];
  const totalQty = items.reduce((a, i) => a + i.quantity, 0);
  const lowStock = items.filter(i => i.quantity <= 1).length;
  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    return (!s || i.item.toLowerCase().includes(s) || (i.brand||"").toLowerCase().includes(s))
      && (filterCat === "All" || i.category === filterCat);
  });
  const grouped = filtered.reduce((acc, i) => { (acc[i.category] = acc[i.category] || []).push(i); return acc; }, {});
  const toggleCat = cat => setCollapsedCats(p => ({ ...p, [cat]: !p[cat] }));

  const inputStyle = { width:"100%", padding:"10px 14px", background:CARD, border:`1px solid ${CARD_BORDER}`, borderRadius:8, fontSize:13, color:TEXT, outline:"none", boxSizing:"border-box" };
  const btnBase = { border:"none", cursor:"pointer", fontWeight:600, fontSize:13 };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", minHeight:"100vh", background:BG, color:TEXT }}>
      <style>{`
        ::placeholder{color:${TEXT_MUTED}} select option{background:${CARD};color:${TEXT}} *{box-sizing:border-box}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* Header */}
      <div style={{ background:"#7c6bb5", borderBottom:`1px solid #6a5aaa`, padding:"14px 20px", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:CARD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🥫</div>
            <div>
              <div style={{ fontWeight:900, fontSize:17, letterSpacing:"3px", color:CARD }}>MISE EN STOCK</div>
              <div style={{ fontSize:11, color:"#d4c8f0", letterSpacing:"1px", marginTop:2 }}>powered by tinkerbot studios</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={fetchItems} style={{ ...btnBase, background:"#6a5aaa", borderRadius:8, padding:"5px 10px", color:"#e0d8ff", fontSize:16 }} title="Refresh">↻</button>
            <div style={{ background:"#6a5aaa", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#e0d8ff" }}>
              <span style={{ fontWeight:700 }}>{items.length}</span> items · <span style={{ fontWeight:700 }}>{totalQty}</span> total
            </div>
            {lowStock > 0 && <div style={{ background:"#5a2020", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#fca5a5" }}>⚠ {lowStock} low</div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#7068a8", borderBottom:`1px solid #6a5aaa`, position:"sticky", top:73, zIndex:19 }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", padding:"0 20px" }}>
          {[["inventory","Inventory"],["add","+ Add"],["scan","📸 Scan"],["howto","How to Use"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ ...btnBase, padding:"11px 16px", background:"none",
              color:tab===t ? CARD : "#c4b8e8", borderBottom:tab===t ? `2px solid ${CARD}` : "2px solid transparent", marginBottom:-1 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div style={{ position:"fixed", top:16, right:16, background:notification.type==="error"?"#7f1d1d":"#3b2f6e",
          border:`1px solid ${notification.type==="error"?"#dc2626":"#7c6bb5"}`,
          color:notification.type==="error"?"#fca5a5":"#e0d8ff",
          padding:"10px 18px", borderRadius:10, fontWeight:600, fontSize:13,
          zIndex:99, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", animation:"slideDown 0.2s ease" }}>
          {notification.msg}
        </div>
      )}

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* INVENTORY */}
        {tab === "inventory" && (
          <>
            {loading ? (
              <div style={{ textAlign:"center", padding:60, color:"#c4b8e8" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🥫</div>
                <div style={{ fontWeight:600 }}>Loading your pantry…</div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  <div style={{ flex:1, position:"relative" }}>
                    <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:TEXT_MUTED, fontSize:14 }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items or brands…" style={{ ...inputStyle, paddingLeft:34 }}/>
                  </div>
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width:"auto", minWidth:140, cursor:"pointer" }}>
                    {allCats.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {Object.keys(grouped).sort().map(cat => {
                  const color = CAT_COLORS[cat] || "#94a3b8";
                  const collapsed = collapsedCats[cat];
                  return (
                    <div key={cat} style={{ marginBottom:8, background:CARD, borderRadius:12, border:`1px solid ${CARD_BORDER}`, overflow:"hidden" }}>
                      <button onClick={() => toggleCat(cat)} style={{ ...btnBase, width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", textAlign:"left" }}>
                        <span style={{ width:3, height:20, borderRadius:2, background:color, flexShrink:0 }}/>
                        <span style={{ fontSize:14 }}>{CAT_EMOJI[cat] || "📦"}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:TEXT, flex:1 }}>{cat}</span>
                        <span style={{ fontSize:11, color:TEXT_MUTED, background:"#00000010", borderRadius:5, padding:"2px 8px" }}>{grouped[cat].length}</span>
                        <span style={{ fontSize:10, color:TEXT_MUTED, marginLeft:4 }}>{collapsed ? "▶" : "▼"}</span>
                      </button>
                      {!collapsed && grouped[cat].map(item => {
                        const expanded = expandedId === item.id;
                        const qc = qtyColor(item.quantity);
                        return (
                          <div key={item.id} style={{ borderTop:`1px solid ${CARD_BORDER_LIGHT}` }}>
                            <div onClick={() => setExpandedId(expanded ? null : item.id)}
                              style={{ display:"flex", alignItems:"center", padding:"9px 16px", cursor:"pointer", background:expanded?"#00000006":"transparent", gap:12 }}>
                              <span style={{ minWidth:28, height:28, borderRadius:7, background:`${qc}22`, border:`1px solid ${qc}55`, color:qc, fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                {item.quantity}
                              </span>
                              <span style={{ flex:1, fontSize:13, fontWeight:500, color:TEXT }}>{item.item}</span>
                              <span style={{ fontSize:11, color:TEXT_MUTED }}>{item.brand}</span>
                            </div>
                            {expanded && (
                              <div style={{ padding:"10px 16px 12px 56px", background:"#00000006", borderTop:`1px solid ${CARD_BORDER_LIGHT}`, display:"flex", alignItems:"center", gap:10, animation:"fadeIn 0.15s ease" }}>
                                <span style={{ fontSize:11, color:TEXT_MUTED, background:CARD_BORDER_LIGHT, borderRadius:5, padding:"3px 8px" }}>{item.container}</span>
                                <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
                                  {[-1, 1].map(d => (
                                    <button key={d} onClick={e => { e.stopPropagation(); updateQty(item.id, d); }}
                                      style={{ ...btnBase, width:30, height:30, borderRadius:7, border:`1px solid ${CARD_BORDER}`, background:CARD, fontSize:16, color:TEXT, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                      {d === -1 ? "−" : "+"}
                                    </button>
                                  ))}
                                  <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }}
                                    style={{ ...btnBase, marginLeft:6, width:30, height:30, borderRadius:7, border:"1px solid #fca5a5", background:"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
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
                  <div style={{ textAlign:"center", padding:60, color:"#c4b8e8" }}>
                    <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                    <div style={{ fontWeight:600 }}>No items found</div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ADD */}
        {tab === "add" && (
          <div style={{ background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:24, maxWidth:480 }}>
            <h2 style={{ margin:"0 0 20px", fontSize:16, fontWeight:800, color:TEXT }}>Add New Item</h2>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5 }}>Item Name *</label>
              <input value={addForm.item}
                onChange={e => setAddForm(f => ({ ...f, item:e.target.value, category:"" }))}
                onBlur={e => autoCategorize(e.target.value)}
                placeholder="e.g. Coconut Milk" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5 }}>Brand</label>
              <input value={addForm.brand} onChange={e => setAddForm(f => ({ ...f, brand:e.target.value }))} placeholder="e.g. Trader Joe's" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5 }}>Category</label>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input value={categorizing ? "Detecting…" : (addForm.category || "")} readOnly
                  placeholder="Auto-detected when you type a name…"
                  style={{ ...inputStyle, flex:1, color:categorizing ? TEXT_MUTED : (addForm.category ? TEXT : TEXT_MUTED), fontStyle:categorizing?"italic":"normal", cursor:"default" }}/>
                {addForm.category && !categorizing && (
                  <span style={{ fontSize:11, background:"#ede9fe", color:"#7c3aed", borderRadius:5, padding:"3px 8px", whiteSpace:"nowrap", fontWeight:600 }}>
                    {CAT_EMOJI[addForm.category] || "📦"} {addForm.category}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5 }}>Container</label>
                <select value={addForm.container} onChange={e => setAddForm(f => ({ ...f, container:e.target.value }))} style={{ ...inputStyle, cursor:"pointer" }}>
                  {["Can","Jar","Bottle","Box","Bag","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:600, color:TEXT_SUB, display:"block", marginBottom:5 }}>Quantity</label>
                <input type="number" min={1} value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity:e.target.value }))} style={inputStyle}/>
              </div>
            </div>
            <button onClick={addItem} style={{ ...btnBase, width:"100%", padding:"12px", background:"#7c6bb5", color:"white", borderRadius:10, fontSize:14, fontWeight:700, boxShadow:"0 4px 16px #7c6bb540", opacity:categorizing?0.6:1 }}>
              {categorizing ? "Detecting category…" : "Add to Pantry"}
            </button>
          </div>
        )}

        {/* SCAN */}
        {tab === "scan" && (
          <div style={{ background:CARD, borderRadius:14, border:`1px solid ${CARD_BORDER}`, padding:24, maxWidth:480 }}>
            <h2 style={{ margin:"0 0 4px", fontSize:16, fontWeight:800, color:TEXT }}>📸 Scan Items</h2>
            <p style={{ margin:"0 0 20px", fontSize:13, color:TEXT_MUTED }}>Photo your pantry items — Claude will identify and update your inventory.</p>

            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["add","➕ Add items"],["remove","➖ Remove items"]].map(([m,l]) => (
                <button key={m} onClick={() => setScanMode(m)} style={{ ...btnBase, flex:1, padding:"10px", borderRadius:8,
                  border:`2px solid ${scanMode===m?"#7c6bb5":CARD_BORDER}`,
                  background:scanMode===m?"#7c6bb5":CARD,
                  color:scanMode===m?"white":TEXT_MUTED }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Hidden inputs: camera vs photo library */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e => handleScanFile(e.target.files[0])}/>
            <input ref={uploadRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleScanFile(e.target.files[0])}/>

            {!scanImg && (
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                <button onClick={() => { cameraRef.current.value=""; cameraRef.current.click(); }}
                  style={{ ...btnBase, flex:1, padding:"14px 10px", borderRadius:10, border:`2px dashed ${CARD_BORDER}`, background:"#f5eef8", color:"#7c6bb5", fontSize:14, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:24 }}>📷</span>
                  <span>Take Photo</span>
                </button>
                <button onClick={() => { uploadRef.current.value=""; uploadRef.current.click(); }}
                  style={{ ...btnBase, flex:1, padding:"14px 10px", borderRadius:10, border:`2px dashed ${CARD_BORDER}`, background:"#f5eef8", color:"#7c6bb5", fontSize:14, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:24 }}>🖼️</span>
                  <span>Choose Photo</span>
                </button>
              </div>
            )}

            {scanImg && (
              <div style={{ marginBottom:16, position:"relative" }}>
                <img src={scanImg} alt="scan" style={{ width:"100%", borderRadius:10, maxHeight:220, objectFit:"cover" }}/>
                {!scanLoading && (
                  <button onClick={() => { setScanImg(null); setScanResult(null); }}
                    style={{ ...btnBase, position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.5)", color:"white", borderRadius:6, padding:"3px 8px", fontSize:12 }}>
                    ✕ Clear
                  </button>
                )}
              </div>
            )}

            {scanLoading && (
              <div style={{ textAlign:"center", padding:"20px 0", color:"#7c6bb5", fontWeight:600 }}>
                <div style={{ fontSize:28, marginBottom:6 }}>🔍</div>
                Identifying items…
              </div>
            )}

            {scanResult && !scanResult.error && (
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:8 }}>Found {scanResult.length} item(s):</p>
                <div style={{ marginBottom:14, maxHeight:220, overflowY:"auto" }}>
                  {scanResult.map((s, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:"#f5eef8", borderRadius:7, marginBottom:4, fontSize:13 }}>
                      <span style={{ fontWeight:600, color:TEXT }}>{s.item}</span>
                      <span style={{ fontSize:11, color:TEXT_MUTED }}>{s.brand} · {CAT_EMOJI[s.category] || "📦"} {s.category}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => applyScan(scanResult)}
                    style={{ ...btnBase, flex:1, padding:"11px", borderRadius:8, background:scanMode==="add"?"#16a34a":"#dc2626", color:"white", fontSize:14 }}>
                    {scanMode === "add" ? `➕ Add ${scanResult.length} item(s)` : `➖ Remove ${scanResult.length} item(s)`}
                  </button>
                  <button onClick={() => { setScanResult(null); setScanImg(null); }}
                    style={{ ...btnBase, padding:"11px 16px", borderRadius:8, background:CARD_BORDER_LIGHT, color:TEXT, fontSize:14 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {scanResult?.error && (
              <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:8, padding:14, color:"#dc2626", fontSize:13 }}>
                ⚠️ Couldn't identify items. Try a clearer or better-lit photo.
              </div>
            )}
          </div>
        )}

        {/* HOW TO USE */}
        {tab === "howto" && (
          <div style={{ maxWidth:480, margin:"0 auto" }}>
            <div style={{ background:CARD, borderRadius:4, border:"3px solid #2d1f5e", padding:"16px 20px" }}>
              <div style={{ borderBottom:"8px solid #2d1f5e", paddingBottom:8, marginBottom:6 }}>
                <div style={{ fontSize:38, fontWeight:900, color:TEXT, lineHeight:1, letterSpacing:"-1px" }}>How to Use</div>
                <div style={{ fontSize:13, color:TEXT, fontWeight:600, marginTop:4 }}>Mise en Stock Pantry Tracker</div>
              </div>
              <div style={{ borderBottom:"3px solid #2d1f5e", paddingBottom:6, marginBottom:6 }}>
                <div style={{ fontSize:12, color:TEXT }}>Serving size <strong>1 photo</strong></div>
                <div style={{ fontSize:12, color:TEXT }}>Steps per serving <strong>2</strong></div>
              </div>
              <div style={{ borderBottom:"8px solid #2d1f5e", paddingBottom:8, marginBottom:6 }}>
                <div style={{ fontSize:11, color:TEXT, fontWeight:600 }}>Amount per photo</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div style={{ fontSize:14, fontWeight:900, color:TEXT }}>Items identified</div>
                  <div style={{ fontSize:40, fontWeight:900, color:TEXT, lineHeight:1 }}>∞</div>
                </div>
              </div>
              {[
                { emoji:"📸", title:"Take a photo in Claude", step:"Step 1", desc:"Open Claude.ai on your phone or desktop and take a photo of any pantry items — a single can, a grocery haul, or a whole shelf." },
                { emoji:"💬", title:'Say "Add this to Mise en Stock"', step:"Step 2", desc:"Just send the photo with that message. Claude will automatically identify every item, categorize it, and add it to your pantry database." },
                { emoji:"🗑️", title:'Say "Remove this from Mise en Stock"', step:"Step 3", desc:"Used something up? Send a photo and Claude will find the matching item and remove it or reduce the quantity automatically." },
                { emoji:"↻",  title:"Refresh the app", step:"Step 4", desc:"Hit the ↻ button in the top right after any Claude update and your inventory will reflect the changes instantly." },
                { emoji:"✏️", title:"Manual edits", step:"Step 5", desc:"Tap any item to expand it and use the +/− buttons to adjust quantity, or the trash icon to delete it directly in the app." },
              ].map(({ emoji, title, step, desc }) => (
                <div key={step} style={{ borderTop:"1px solid #2d1f5e", padding:"10px 0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:TEXT }}>{emoji} {title}</div>
                    <div style={{ fontSize:11, color:TEXT_MUTED, whiteSpace:"nowrap", marginLeft:8 }}>{step}</div>
                  </div>
                  <div style={{ fontSize:12, color:TEXT_MUTED, lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
              <div style={{ borderTop:"3px solid #2d1f5e", marginTop:4, paddingTop:8 }}>
                <div style={{ fontSize:12, color:TEXT, lineHeight:1.6 }}>
                  <strong>* Pro tip:</strong> Scan a whole shelf at once — Claude identifies every visible item and updates your pantry in one shot.
                </div>
              </div>
              <div style={{ borderTop:"8px solid #2d1f5e", marginTop:10, paddingTop:8, textAlign:"center" }}>
                <div style={{ fontSize:10, color:TEXT_MUTED, letterSpacing:"1.5px", fontWeight:700 }}>POWERED BY TINKERBOT STUDIOS</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
