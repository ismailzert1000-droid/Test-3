export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ result: "Method not allowed" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ result: "No text provided" });

  const prompt = `
You are a linguistic analysis AI.
Based ONLY on subtle grammar patterns, word choice, and sentence structure,
guess the writer's most likely native language.
Return EXACTLY in this format:

You might be a native speaker of X.
Confidence: XX%

Text:
"${text}"
`;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    // Hugging Face API returns text under data[0].generated_text
    const result = data[0]?.generated_text || "Could not analyze text.";

    res.status(200).json({ result });

  } catch (error) {
    res.status(500).json({ result: "Server error: " + error.message });
  }
}
