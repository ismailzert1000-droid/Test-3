export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ result: "OpenAI Error: " + JSON.stringify(data) });
    }

    const result = data.choices[0].message.content;

    res.status(200).json({ result });

  } catch (error) {
    res.status(500).json({ result: "Server crashed: " + error.message });
  }
}
