import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  type: 'shopping-suggestions' | 'recipe-ideas' | 'product-info' | 'lens-analyze';
  context?: string;
  imageBase64?: string;
  groceryItems?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, imageBase64, groceryItems } = await req.json() as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'shopping-suggestions':
        systemPrompt = `You are a smart grocery shopping assistant. Analyze the user's shopping list and provide helpful suggestions for:
- Items they might have forgotten
- Healthier alternatives
- Budget-saving tips
- Meal ideas based on their items
Keep responses concise and actionable. Use emojis to make it friendly.`;
        userPrompt = `Here's my current shopping list: ${groceryItems?.join(', ') || 'empty'}. ${context || 'Give me smart suggestions.'}`;
        break;

      case 'recipe-ideas':
        systemPrompt = `You are a creative chef assistant. Based on the ingredients provided, suggest quick and delicious recipes. 
Include:
- Recipe name with emoji
- Cooking time
- Brief instructions (3-4 steps max)
- Any additional ingredients needed`;
        userPrompt = `Suggest recipes I can make with these ingredients: ${groceryItems?.join(', ') || context || 'general pantry items'}`;
        break;

      case 'product-info':
        systemPrompt = `You are a nutrition and product expert. Provide helpful information about grocery products including:
- Nutritional benefits
- Storage tips
- Best uses
- Quality indicators when buying
Keep it brief and practical.`;
        userPrompt = context || 'Tell me about common grocery products';
        break;

      case 'lens-analyze':
        systemPrompt = `You are analyzing a grocery product image. Identify:
1. Product name and type
2. Estimated category (produce, dairy, meat, etc.)
3. Approximate price range
4. Nutritional highlights
5. Storage recommendations
Format as a structured response that can be used to add the item to a shopping list.`;
        userPrompt = "Analyze this grocery product image and provide details.";
        break;

      default:
        systemPrompt = "You are a helpful grocery shopping assistant.";
        userPrompt = context || "Help me with grocery shopping.";
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Handle image input for lens feature
    if (type === 'lens-analyze' && imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:image/jpeg;base64,${imageBase64}` 
            } 
          }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});