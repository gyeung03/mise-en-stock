export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, mimeType, prompt } = req.body;

  // Build message content — if image provided, include it; otherwise text-only (for auto-categorize)
  const content = [];
  if (image) {
    content.push({ type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: image } });
  }
  content.push({ type: "text", text: prompt });

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
        messages: [{ role: "user", content }]
      })
    });

    const data = await response.json();
    console.log("Anthropic response:", JSON.stringify(data));

    const txt = data.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
    res.status(200).json({ result: txt });
  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Failed", detail: err.message });
  }
}
