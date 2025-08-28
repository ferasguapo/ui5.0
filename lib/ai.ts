// lib/ai.ts
// Replaced OpenAI integration with Happy Face API integration

export async function happyFaceComplete(prompt: string): Promise<string> {
  const res = await fetch("https://api.happyface.ai/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.HAPPYFACE_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      model: "hf-mini", // adjust if needed
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Happy Face API error");
  }

  return json.choices?.[0]?.text || json.result || "";
}
