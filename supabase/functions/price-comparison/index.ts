import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a grocery price comparison expert for India. Given a product name, return realistic current market prices from major Indian online grocery stores. 
    
IMPORTANT: Return ONLY valid JSON array, no markdown, no explanation. Each item must have these exact fields:
- store (string): Store name
- price (number): Price in INR (realistic 2024-2025 Indian market prices)
- originalPrice (number or null): MRP if different from selling price
- distance (string): Approximate delivery distance
- deliveryTime (string): Estimated delivery time
- inStock (boolean): Whether available
- rating (number): Store rating out of 5

Use these stores: BigBasket, JioMart, Amazon Fresh, Zepto, Blinkit, DMart, Swiggy Instamart, Flipkart Minutes

Make prices realistic for India. For example:
- Tata Salt 1kg: ₹24-28
- Amul Butter 500g: ₹270-290
- Basmati Rice 5kg: ₹450-600
- Atta 5kg: ₹250-310
- Milk 1L: ₹60-72
- Tomatoes 1kg: ₹30-60 (seasonal)`;

    const userPrompt = `Get current prices for: "${productName}" ${category ? `(category: ${category})` : ''}. Return JSON array only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let prices;
    try {
      prices = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      prices = [];
    }

    return new Response(
      JSON.stringify({ success: true, prices, productName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Price comparison error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
