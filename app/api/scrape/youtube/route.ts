import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    if (!q) return NextResponse.json({ ok: true, results: [] });
    const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
    const resp = await fetch(url, {
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
      },
      // YouTube blocks some bots; no referrer helps here
    });
    const html = await resp.text();

    // Try to parse initialData blob first
    const m = html.match(/var ytInitialData = (\{[\s\S]*?\});/);
    let results: { title: string; url: string }[] = [];
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        const items = [];
        for (const section of sections) {
          const contents = section?.itemSectionRenderer?.contents || [];
          for (const it of contents) {
            const v = it?.videoRenderer;
            if (v?.videoId) {
              const title = (v?.title?.runs?.map((r: any)=>r.text).join(" ") || "").trim();
              const url = "https://www.youtube.com/watch?v=" + v.videoId;
              if (title && url) items.push({ title, url });
            }
          }
        }
        results = items;
      } catch {}
    }

    // Fallback: simple regex for /watch?v=
    if (results.length === 0) {
      const hrefs = html.match(/\/watch\?v=[A-Za-z0-9_-]{11}/g) || [];
      const urls = unique(hrefs).slice(0, 10).map(h => "https://www.youtube.com" + h);
      results = urls.map((u, i) => ({ title: "YouTube Tutorial " + (i+1), url: u }));
    }

    // Dedup and limit
    const final = unique(results.map(r => JSON.stringify(r))).map(s => JSON.parse(s)).slice(0, 6);
    return NextResponse.json({ ok: true, results: final });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to scrape YouTube" }, { status: 500 });
  }
}