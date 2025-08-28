import { happyFaceComplete } from "../../../lib/ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, make, model, part, code, notes } = body;

    const prompt = [
      "Generate a concise diagnostic plan as JSON for an automotive issue.",
      "Always return VALID JSON. No prose. Use these keys:",
      "{",
      '  "summary": string,',
      '  "trouble_code": string,',
      '  "probable_causes": string[],',
      '  "tests": [{ "name": string, "steps": string[] }],',
      '  "recommended_parts": string[],',
      '  "estimated_difficulty": "easy" | "moderate" | "hard",',
      '  "next_actions": string[]',
      "}",
      "",
      "Vehicle: " + [year, make, model].filter(Boolean).join(" "),
      part ? `Part: ${part}` : "",
      code ? `OBD-II Code: ${code}` : "",
      notes ? `Notes: ${notes}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    // Call HappyFace API wrapper
    const aiText = await happyFaceComplete(prompt);

    // Try to parse JSON from response
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      parsed = { summary: aiText }; // fallback if not valid JSON
    }

    return NextResponse.json(
      { ok: true, data: parsed, raw: aiText },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
