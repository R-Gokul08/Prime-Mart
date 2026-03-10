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
        systemPrompt = `You are an expert Indian grocery shopping assistant. When the user mentions a dish, recipe, or food category, list ALL the specific grocery items needed with realistic Indian market prices in ₹.

Format each item as a bullet point like:
• **Item Name** - ₹Price (brief note)

For example, if user asks about "biryani":
• **Basmati Rice** - ₹120/kg (India Gate or Daawat)
• **Chicken** - ₹220/kg (fresh, bone-in)
• **Onions** - ₹35/kg
• **Tomatoes** - ₹40/kg
• **Yogurt/Curd** - ₹45/500ml
• **Ginger-Garlic Paste** - ₹55
• **Biryani Masala** - ₹45/pack (Everest or MDH)
• **Green Chillies** - ₹20/100g
• **Mint Leaves** - ₹10/bunch
• **Coriander** - ₹10/bunch
• **Ghee** - ₹550/ltr (Amul)
• **Saffron** - ₹150/1g

Always use realistic 2024-2025 Indian prices. Include brand names when relevant (Amul, Tata, Fortune, Aashirvaad, etc).
Keep responses helpful with cooking tips.`;
        userPrompt = `Here's my current shopping list: ${groceryItems?.join(', ') || 'empty'}. ${context || 'Give me smart suggestions for Indian cooking.'}`;
        break;

      case 'recipe-ideas':
        systemPrompt = `You are a creative Indian chef assistant. Based on ingredients provided, suggest quick and delicious Indian recipes.
Include:
- Recipe name with emoji
- Cooking time
- Brief instructions (3-4 steps max)
- Any additional ingredients needed with prices in ₹
List the missing ingredients as bullet points with • **Item** - ₹Price format.`;
        userPrompt = `Suggest Indian recipes I can make with these ingredients: ${groceryItems?.join(', ') || context || 'general pantry items'}`;
        break;

      case 'product-info':
        systemPrompt = `You are a nutrition and product expert for the Indian market. Provide helpful information about grocery products including:
- Nutritional benefits
- Best Indian brands and their prices in ₹
- Storage tips
- Quality indicators when buying
Format product recommendations as: • **Product Name** - ₹Price (brand)
Keep it brief and practical.`;
        userPrompt = context || 'Tell me about common Indian grocery products';
        break;

      case 'lens-analyze':
        systemPrompt = `You are analyzing a grocery product image from India. Identify and provide:
1. **Product name**: (exact product name)
2. **Category**: (one of: Fruits & Vegetables, Dairy & Eggs, Meat & Seafood, Bakery, Pantry, Beverages, Snacks, Grains & Pulses, Spices)
3. **Estimated price**: ₹XX (realistic Indian market price)
4. **Nutritional highlights**: Brief nutrition info
5. **Storage tips**: How to store it
6. **Brand**: If identifiable
7. **Available at**: BigBasket, JioMart, Amazon Fresh, Zepto, Blinkit

Use the exact format above with colons. The price MUST be a realistic Indian market price.`;
        userPrompt = "Analyze this grocery product image and provide structured details for the Indian market.";
        break;

      default:
        systemPrompt = "You are a helpful Indian grocery shopping assistant. Always mention prices in ₹ (INR).";
        userPrompt = context || "Help me with grocery shopping.";
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

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

    const model = type === 'lens-analyze' ? 'google/gemini-2.5-flash' : 'google/gemini-3-flash-preview';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
