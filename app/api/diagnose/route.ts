import { happyFaceComplete } from "../../../lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { callAI, coerceToJSONObject, normalizeToSchema } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const prompt = [
      "Generate a concise diagnostic plan as JSON for an automotive issue.",
      "Always return VALID JSON. No prose. Use these keys:",
      "{",
      "  \"summary\": string,",
      "  \"trouble_code\": string,",
      "  \"probable_causes\": string[],",
      "  \"tests\": [{ \"name\": string, \"steps\": string[] }],",
      "  \"recommended_parts\": string[],",
      "  \"estimated_difficulty\": \"easy\"| \"moderate\"| \"hard\",",
      "  \"next_actions\": string[]",
      "}",
      "",
      "Vehicle: " + [year, make, model].filter(Boolean).join(" "),
      part ? `Part: ${part}` : "",
      code ? `OBD-II Code: ${code}` : "",
      notes ? `Notes: ${notes}` : ""
    ].filter(Boolean).join("\n");


    const parsed = coerceToJSONObject(aiText);
    const normalized = normalizeToSchema(parsed);

    return NextResponse.json({ ok: true, data: normalized, raw: aiText }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}