const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GroceryProduct {
  name: string;
  price: number;
  category: string;
  store: string;
  image?: string;
  dealPrice?: number;
  hasDeal: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { searchQuery, category } = await req.json();
    
    console.log('Searching for grocery products:', searchQuery || category || 'all');

    // Search for grocery products from popular stores
    const searchTerms = searchQuery || category || 'grocery products deals';
    
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${searchTerms} site:amazon.com OR site:walmart.com OR site:target.com OR site:instacart.com`,
        limit: 20,
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to search products' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse products from search results
    const products: GroceryProduct[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      for (const result of data.data) {
        // Extract store from URL
        let store = 'Unknown';
        if (result.url?.includes('amazon')) store = 'Amazon';
        else if (result.url?.includes('walmart')) store = 'Walmart';
        else if (result.url?.includes('target')) store = 'Target';
        else if (result.url?.includes('instacart')) store = 'Instacart';

        // Parse price from content if available
        const priceMatch = result.markdown?.match(/\$(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        // Try to extract deal price
        const dealMatch = result.markdown?.match(/was\s*\$(\d+\.?\d*)/i);
        const originalPrice = dealMatch ? parseFloat(dealMatch[1]) : undefined;

        if (result.title) {
          products.push({
            name: result.title.replace(/\s*-\s*Amazon\.com.*$/i, '').replace(/\s*\|.*$/i, '').trim(),
            price: originalPrice || price,
            dealPrice: originalPrice ? price : undefined,
            hasDeal: !!originalPrice,
            category: category || 'General',
            store,
            image: result.ogImage || result.image,
          });
        }
      }
    }

    console.log(`Found ${products.length} products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products,
        source: 'live',
        updatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape products';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
