import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    if (!q) return NextResponse.json({ ok: true, results: [] });
    const url = "https://www.oreillyauto.com/search?q=" + encodeURIComponent(q);
    const resp = await fetch(url, {
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
      },
    });
    const html = await resp.text();
    const $ = cheerio.load(html);
    const items: { title: string; url: string; price?: string }[] = [];
    // Selector guesses based on O'Reilly site structure
    $("a[href*='/detail/']").each((_, el) => {
      const href = $(el).attr("href");
      let title = $(el).text().trim();
      if (!title) {
        title = $(el).attr("title") || "";
      }
      if (href && title) {
        const link = href.startsWith("http") ? href : "https://www.oreillyauto.com" + href;
        // Try to find nearby price
        const parent = $(el).closest("div");
        let price = parent.find("[data-testid='price'], .price, .product-price").first().text().trim();
        if (!price) price = parent.find("span:contains('$')").first().text().trim();
        items.push({ title, url: link, price });
      }
    });
    // Fallback: generic anchors with product-title class
    if (items.length === 0) {
      $("a.product-title, a.link--primary").each((_, el) => {
        const href = $(el).attr("href");
        const title = $(el).text().trim();
        if (href && title) {
          const link = href.startsWith("http") ? href : "https://www.oreillyauto.com" + href;
          items.push({ title, url: link });
        }
      });
    }
    const dedup = Array.from(new Map(items.map(i => [i.url, i])).values()).slice(0, 6);
    return NextResponse.json({ ok: true, results: dedup });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to scrape OReilly" }, { status: 500 });
  }
}