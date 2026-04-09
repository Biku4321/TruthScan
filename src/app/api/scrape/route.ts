import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Fetch the HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to load website" }, { status: 400 });
    }

    const html = await response.text();

    // 2. Parse with Cheerio
    const $ = cheerio.load(html);

    // 3. Remove junk (scripts, styles, ads, nav)
    $("script, style, nav, footer, iframe, .ad, .advertisement, .social-share").remove();

    // 4. Extract Core Content
    const title = $("head > title").text() || $("h1").first().text();
    
    // Get paragraphs only from the main article body if possible
    let content = "";
    $("article p").each((_, el) => {
      content += $(el).text() + "\n\n";
    });

    // Fallback if no <article> tag found
    if (content.length < 50) {
      $("p").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) { // Filter out short menu items
           content += text + "\n\n";
        }
      });
    }

    // Limit length to prevent token overflow in AI models
    content = content.slice(0, 3000); 

    return NextResponse.json({ 
      success: true, 
      title: title.trim(), 
      content: content.trim() 
    });

  } catch (error) {
    console.error("Scrape Error:", error);
    return NextResponse.json({ error: "Could not read this website. Try pasting the text manually." }, { status: 500 });
  }
}