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
  rating?: number;
  unit?: string;
  description?: string;
}

// Indian grocery stores to search
const indianStoreQueries = [
  { store: 'BigBasket', query: 'site:bigbasket.com' },
  { store: 'JioMart', query: 'site:jiomart.com' },
  { store: 'Amazon Fresh', query: 'site:amazon.in grocery fresh' },
  { store: 'Flipkart Grocery', query: 'site:flipkart.com grocery' },
  { store: 'Zepto', query: 'site:zepto.com' },
  { store: 'Blinkit', query: 'site:blinkit.com' },
];

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
    
    console.log('Searching for Indian grocery products:', searchQuery || category || 'all');

    // Build search query for Indian grocery stores
    const searchTerms = searchQuery || category || 'grocery products fresh vegetables fruits';
    
    // Search across multiple Indian stores
    const storeSearches = indianStoreQueries.slice(0, 3); // Limit to 3 stores for speed
    const allProducts: GroceryProduct[] = [];

    for (const storeInfo of storeSearches) {
      try {
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${searchTerms} ${storeInfo.query}`,
            limit: 10,
            lang: 'en',
            country: 'IN',
            scrapeOptions: {
              formats: ['markdown'],
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.data && Array.isArray(data.data)) {
          for (const result of data.data) {
            // Parse price in INR from content
            const priceMatch = result.markdown?.match(/₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:INR|rupees)/i);
            let price = 0;
            if (priceMatch) {
              const priceStr = (priceMatch[1] || priceMatch[2] || priceMatch[3]).replace(/,/g, '');
              price = parseFloat(priceStr);
            }

            // Try to extract deal/MRP price
            const mrpMatch = result.markdown?.match(/MRP[:\s]*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
            const originalPrice = mrpMatch ? parseFloat(mrpMatch[1].replace(/,/g, '')) : undefined;

            // Extract rating
            const ratingMatch = result.markdown?.match(/(\d+\.?\d*)\s*(?:out of 5|\/5|stars?)/i);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

            // Extract unit/quantity
            const unitMatch = result.markdown?.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|ml|l|ltr|litre|piece|pcs|pack|dozen)/i);
            const unit = unitMatch ? `${unitMatch[1]} ${unitMatch[2]}` : undefined;

            if (result.title && price > 0) {
              // Clean up the title
              let cleanName = result.title
                .replace(/\s*-\s*(?:Buy|Online|at|Best|Price).*$/i, '')
                .replace(/\s*\|.*$/i, '')
                .replace(/\s*–.*$/i, '')
                .trim();

              // Limit name length
              if (cleanName.length > 60) {
                cleanName = cleanName.substring(0, 60) + '...';
              }

              // Determine category from content
              let detectedCategory = category || 'General';
              const content = (result.title + ' ' + (result.markdown || '')).toLowerCase();
              if (content.includes('fruit') || content.includes('mango') || content.includes('apple') || content.includes('banana')) {
                detectedCategory = 'Fruits';
              } else if (content.includes('vegetable') || content.includes('tomato') || content.includes('onion') || content.includes('potato')) {
                detectedCategory = 'Vegetables';
              } else if (content.includes('milk') || content.includes('dairy') || content.includes('paneer') || content.includes('curd') || content.includes('egg')) {
                detectedCategory = 'Dairy & Eggs';
              } else if (content.includes('chicken') || content.includes('mutton') || content.includes('meat')) {
                detectedCategory = 'Meat & Poultry';
              } else if (content.includes('fish') || content.includes('prawn') || content.includes('seafood')) {
                detectedCategory = 'Seafood';
              } else if (content.includes('rice') || content.includes('atta') || content.includes('dal') || content.includes('grain') || content.includes('flour')) {
                detectedCategory = 'Grains & Pulses';
              } else if (content.includes('spice') || content.includes('masala')) {
                detectedCategory = 'Spices';
              } else if (content.includes('snack') || content.includes('chips') || content.includes('biscuit')) {
                detectedCategory = 'Snacks';
              } else if (content.includes('beverage') || content.includes('juice') || content.includes('drink')) {
                detectedCategory = 'Beverages';
              }

              allProducts.push({
                name: cleanName,
                price: originalPrice || price,
                dealPrice: originalPrice && price < originalPrice ? price : undefined,
                hasDeal: !!(originalPrice && price < originalPrice),
                category: detectedCategory,
                store: storeInfo.store,
                image: result.ogImage || result.image,
                rating,
                unit,
                description: result.description?.substring(0, 100),
              });
            }
          }
        }
      } catch (storeError) {
        console.error(`Error fetching from ${storeInfo.store}:`, storeError);
        // Continue with other stores
      }
    }

    // Remove duplicates based on name similarity
    const uniqueProducts = allProducts.reduce((acc: GroceryProduct[], product) => {
      const exists = acc.find(p => 
        p.name.toLowerCase().includes(product.name.toLowerCase().substring(0, 20)) ||
        product.name.toLowerCase().includes(p.name.toLowerCase().substring(0, 20))
      );
      if (!exists) {
        acc.push(product);
      }
      return acc;
    }, []);

    console.log(`Found ${uniqueProducts.length} unique products from Indian stores`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: uniqueProducts.slice(0, 20), // Limit to 20 products
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
