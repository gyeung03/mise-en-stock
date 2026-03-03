export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { image, mimeType } = req.body;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType || "image/jpeg", data: image }
            },
            {
              type: "text",
              text: `Identify all pantry items in this image. Return ONLY a JSON array: [{"item":"name","brand":"brand or empty","container":"Can/Jar/Bottle/Box/Bag/Other","quantity":1,"category":"best match from: Broths & Stocks, Canned Beans & Legumes, Canned Fish & Seafood, Canned Meats, Canned Shellfish, Canned Tomatoes, Canned Vegetables, Condiments & Chili Pastes, Condiments & Pickled Items, Condiments & Preserved Vegetables, Condiments & Sauces, Dairy & Shelf-Stable Milk, Gravies & Meal Sauces, Prepared Meals, Sauces & Cooking Bases, Soups, Other"}]. No other text.`
            }
          ]
        }]
      })
    });
    const data = await response.json();
    // Log the full response so we can see what's coming back
    console.log("Anthropic response:", JSON.stringify(data));
    const txt = data.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
    const items = JSON.parse(txt);
    res.status(200).json({ items });
  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Failed to identify items", detail: err.message });
  }
}
