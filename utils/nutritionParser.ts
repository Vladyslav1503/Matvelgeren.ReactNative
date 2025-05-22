// nutritionParser.ts

interface ApiProduct {
    id: string;
    name: string;
    current_price: {
        price: number;
        unit_price?: number;
        date?: string;
    };
    price_history?: Array<{
        date: string;
        price: number;
    }>;
    image?: string;
    brand?: string;
    description?: string;
    ingredients?: string;
    store?: {
        name: string;
        logo?: string;
        code?: string;
    };
    category?: Array<{
        name: string;
        id: number;
        depth: number;
    }>;
    weight?: number;
    weight_unit?: string;
    vendor?: string;
    [key: string]: any; // Allow for additional fields
}

interface ApiResponse {
    data: {
        ean: string;
        products: ApiProduct[];
        nutrition: NutritionItem[];
        allergens?: AllergenItem[];
    };
}

interface Product {
    id: string;
    name: string;
    vendor: string;
    brand: string;
    description: string;
    ingredients: string;
    image: string;
    current_price: { price: number };
    store: { name: string };
    category: { name: string }[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    labels: string[];
    allergens: string[];
    price_history?: Array<{
        date: string;
        price: number;
        store?: string;
    }>;
}

interface ProductCard {
    id: string;
    name: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    sugar?: number;
    price: number;
    labels: string[];
    imageUrl: string;
    store?: string;
    storeLogo?: string;
    description?: string;
    brand?: string;
    weight?: string;
}

interface NutritionItem {
    amount: number;
    code: string;
    display_name: string;
    unit: string;
}

interface AllergenItem {
    code: string;
    contains: string;
    display_name: string;
}

// Helper function to check if an image URL is valid
async function isImageValid(url: string | undefined): Promise<boolean> {
    if (!url) return false;

    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return response.ok && !!contentType && contentType.startsWith('image/');
    } catch (error) {
        console.log('Image validation error:', error);
        return false;
    }
}

// Function to find the best product from the list and return ProductCard format
export async function mapApiResponseToProductCard(apiResponse: ApiResponse): Promise<ProductCard | null> {
    if (!apiResponse?.data?.products || apiResponse.data.products.length === 0) {
        console.log('No products found in API response');
        return null;
    }

    const { products, nutrition } = apiResponse.data;

    // Extract nutrition data if available
    const nutritionData = nutrition && nutrition.length > 0 ? nutrition : null;

    // First, try to find a product with a valid image
    for (const product of products) {
        if (!product.image) continue;

        // Check if the image is valid
        const imageValid = await isImageValid(product.image);
        if (!imageValid) continue;

        // Found a product with valid image
        return createProductCardFromApiData(product, nutritionData);
    }

    // If no product with valid image found, use the first product without image validation
    return createProductCardFromApiData(products[0], nutritionData);
}

// New function to map API response to full Product format
export async function mapApiResponseToProduct(apiResponse: ApiResponse): Promise<Product | null> {
    if (!apiResponse?.data?.products || apiResponse.data.products.length === 0) {
        console.log('No products found in API response');
        return null;
    }

    const { products, nutrition, allergens } = apiResponse.data;

    // Extract nutrition data if available
    const nutritionData = nutrition && nutrition.length > 0 ? nutrition : null;
    const allergenData = allergens && allergens.length > 0 ? allergens : null;

    // First, try to find a product with a valid image
    for (const product of products) {
        if (!product.image) continue;

        // Check if the image is valid
        const imageValid = await isImageValid(product.image);
        if (!imageValid) continue;

        // Found a product with valid image
        return createProductFromApiData(product, nutritionData, allergenData, products);
    }

    // If no product with valid image found, use the first product without image validation
    return createProductFromApiData(products[0], nutritionData, allergenData, products);
}

// Helper function to create a ProductCard object from API data
function createProductCardFromApiData(product: ApiProduct, nutritionItems: NutritionItem[] | null): ProductCard {
    // Extract basic product info
    const productCard: ProductCard = {
        id: product.id.toString(),
        name: product.name || 'Unknown Product',
        price: product.current_price?.price || 0,
        labels: [], // Will be populated based on nutrition data
        imageUrl: product.image || 'https://placeholder-image.com/150x150', // Fallback image
    };

    // Add store information if available
    if (product.store) {
        productCard.store = product.store.name;
        productCard.storeLogo = product.store.logo;
    }

    // Add additional product details
    productCard.description = product.description || '';
    productCard.brand = product.brand || '';

    // Add weight information if available
    if (product.weight && product.weight_unit) {
        productCard.weight = `${product.weight}${product.weight_unit}`;
    }

    // Parse nutrition data if available
    if (nutritionItems && nutritionItems.length > 0) {
        // Map nutrition codes to our product fields
        const nutritionMap = new Map<string, number>();

        // First, build a map of all nutrition values
        nutritionItems.forEach(item => {
            nutritionMap.set(item.code, item.amount);
        });

        // Map the nutrition codes to our product properties
        productCard.calories = nutritionMap.get('energi_kcal');
        productCard.protein = nutritionMap.get('protein');
        productCard.fat = nutritionMap.get('fett_totalt');
        productCard.carbs = nutritionMap.get('karbohydrater');
        productCard.sugar = nutritionMap.get('sukkerarter');

        // Generate labels based on nutrition values
        productCard.labels = determineProductLabels(nutritionMap);
    }

    return productCard;
}

// Helper function to create a full Product object from API data
function createProductFromApiData(
    product: ApiProduct,
    nutritionItems: NutritionItem[] | null,
    allergenItems: AllergenItem[] | null,
    allProducts: ApiProduct[]
): Product {
    // Extract basic product info
    const fullProduct: Product = {
        id: product.id.toString(),
        name: product.name || 'Unknown Product',
        vendor: extractVendorFromDescription(product.description) || 'Unknown Vendor',
        brand: product.brand || 'Unknown Brand',
        description: product.description || '',
        ingredients: product.ingredients || '',
        image: product.image || 'https://placeholder-image.com/150x150',
        current_price: { price: product.current_price?.price || 0 },
        store: { name: product.store?.name || 'Unknown Store' },
        category: product.category?.map(cat => ({ name: cat.name })) || [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        labels: [],
        allergens: [],
    };

    // Parse nutrition data if available
    if (nutritionItems && nutritionItems.length > 0) {
        const nutritionMap = new Map<string, number>();

        nutritionItems.forEach(item => {
            nutritionMap.set(item.code, item.amount);
        });

        // Map the nutrition codes to our product properties
        fullProduct.calories = nutritionMap.get('energi_kcal') || 0;
        fullProduct.protein = nutritionMap.get('protein') || 0;
        fullProduct.fat = nutritionMap.get('fett_totalt') || 0;
        fullProduct.carbs = nutritionMap.get('karbohydrater') || 0;

        // Generate labels based on nutrition values
        fullProduct.labels = determineProductLabels(nutritionMap);
    }

    // Parse allergen data if available
    if (allergenItems && allergenItems.length > 0) {
        fullProduct.allergens = allergenItems
            .filter(allergen => allergen.contains === 'YES')
            .map(allergen => allergen.display_name);
    }

    // Build comprehensive price history from all products (different stores)
    if (allProducts && allProducts.length > 0) {
        const priceHistory: Array<{ date: string; price: number; store?: string }> = [];

        allProducts.forEach(prod => {
            if (prod.price_history && prod.price_history.length > 0) {
                // Add all historical prices for this store
                prod.price_history.forEach(historyItem => {
                    priceHistory.push({
                        date: historyItem.date,
                        price: historyItem.price,
                        store: prod.store?.name || 'Unknown Store'
                    });
                });
            }

            // Also add current price as the most recent data point
            if (prod.current_price) {
                priceHistory.push({
                    date: prod.current_price.date || new Date().toISOString(),
                    price: prod.current_price.price,
                    store: prod.store?.name || 'Unknown Store'
                });
            }
        });

        // Sort by date (newest first) and remove duplicates
        const uniquePriceHistory = new Map<string, { date: string; price: number; store?: string }>();

        priceHistory
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(item => {
                const key = `${item.date}-${item.store}`;
                if (!uniquePriceHistory.has(key)) {
                    uniquePriceHistory.set(key, item);
                }
            });

        // Convert back to array and limit to reasonable number
        fullProduct.price_history = Array.from(uniquePriceHistory.values())
            .slice(0, 100); // Limit to last 100 data points
    }

    return fullProduct;
}

// Helper function to extract vendor from description or other fields
function extractVendorFromDescription(description?: string): string | null {
    if (!description) return null;

    // Try to extract vendor from description
    // This is a simple pattern match - you might need to adjust based on your data
    const vendorPatterns = [
        /produced by (.+?)(?:\.|,|$)/i,
        /manufactured by (.+?)(?:\.|,|$)/i,
        /by (.+?)(?:\.|,|$)/i,
    ];

    for (const pattern of vendorPatterns) {
        const match = description.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
}

// Helper function to determine product labels based on nutrition data
function determineProductLabels(nutritionMap: Map<string, number>): string[] {
    const labels: string[] = [];

    if (nutritionMap.size === 0) return labels;

    // Get nutrition values with proper null checks
    const calories = nutritionMap.get('energi_kcal') || 0;
    const sugar = nutritionMap.get('sukkerarter') || 0;
    const fat = nutritionMap.get('fett_totalt') || 0;
    const protein = nutritionMap.get('protein') || 0;

    // Check for high sugar content (per 100g)
    if (sugar > 15) {
        labels.push('High sugar');
    }

    // Check for high fat content (per 100g)
    if (fat > 17.5) {
        labels.push('High fat');
    }

    // Check for high calorie content (per 100g)
    if (calories > 300) {
        labels.push('High calorie');
    }

    // Check for high protein content (per 100g)
    if (protein > 20) {
        labels.push('High protein');
    }

    // Check for low calorie
    if (calories < 50) {
        labels.push('Low calorie');
    }

    // Check for no carbs
    const carbs = nutritionMap.get('karbohydrater') || 0;
    if (carbs < 1) {
        labels.push('No carbs');
    }

    // Add health label based on overall profile
    if (labels.length === 0 && calories < 200 && fat < 10) {
        labels.push('Healthy');
    } else if (labels.some(label => ['High sugar', 'High fat', 'High calorie'].includes(label))) {
        labels.push('Unhealthy');
    }

    // Check for ultra-processed indicators (artificial sweeteners, preservatives, etc.)
    // This would need to be determined from ingredients list analysis
    // For now, we'll add it based on high artificial content indicators
    if (sugar === 0 && calories > 0) {
        // Likely contains artificial sweeteners
        labels.push('Ultra-processed');
    }

    return labels;
}

// More efficient version with Promise.all for concurrent image checking
export async function mapApiResponseToProductCardEfficient(apiResponse: ApiResponse): Promise<ProductCard | null> {
    if (!apiResponse?.data?.products || apiResponse.data.products.length === 0) {
        console.log('No products found in API response');
        return null;
    }

    const { products, nutrition } = apiResponse.data;
    const nutritionData = nutrition && nutrition.length > 0 ? nutrition : null;

    // Create an array of products with image URLs
    const productsWithImages = products.filter(product => product.image);

    if (productsWithImages.length === 0) {
        // If no products have images, just use the first product
        return createProductCardFromApiData(products[0], nutritionData);
    }

    try {
        // Check all images concurrently
        const imageValidationPromises = productsWithImages.map(product =>
            isImageValid(product.image).then(isValid => ({ product, isValid }))
        );

        // Wait for all image validations to complete
        const validationResults = await Promise.all(imageValidationPromises);

        // Find the first product with a valid image
        const productWithValidImage = validationResults.find(result => result.isValid);

        if (productWithValidImage) {
            return createProductCardFromApiData(productWithValidImage.product, nutritionData);
        }

        // If no valid images found, use the first product
        return createProductCardFromApiData(products[0], nutritionData);
    } catch (error) {
        console.log('Error validating images:', error);
        // Fallback to first product if there's an error during image validation
        return createProductCardFromApiData(products[0], nutritionData);
    }
}

// Function to extract a specific nutrition value by code
export function getNutritionValue(nutritionItems: NutritionItem[] | null, code: string): number | undefined {
    if (!nutritionItems) return undefined;

    const item = nutritionItems.find(item => item.code === code);
    return item ? item.amount : undefined;
}

// Helper function to format price history for charts
export function formatPriceHistoryForChart(priceHistory: Array<{ date: string; price: number; store?: string }>): any {
    if (!priceHistory || priceHistory.length === 0) {
        return {
            labels: [],
            datasets: []
        };
    }

    // Group by store
    const storeGroups = new Map<string, Array<{ date: string; price: number }>>();

    priceHistory.forEach(item => {
        const store = item.store || 'Unknown Store';
        if (!storeGroups.has(store)) {
            storeGroups.set(store, []);
        }
        storeGroups.get(store)!.push({ date: item.date, price: item.price });
    });

    // Sort each store's data by date
    storeGroups.forEach((data, store) => {
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Get common time labels (use the store with most data points)
    let maxDataPoints = 0;
    let mainStoreData: Array<{ date: string; price: number }> = [];

    storeGroups.forEach((data, store) => {
        if (data.length > maxDataPoints) {
            maxDataPoints = data.length;
            mainStoreData = data;
        }
    });

    // Create labels from dates (limit to last 6 months or 10 data points)
    const labels = mainStoreData
        .slice(-10)
        .map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('no-NO', { month: 'short' });
        });

    // Create datasets for each store
    const datasets: any[] = [];
    const colors = [
        'rgba(52, 152, 219, 1)',   // Blue
        'rgba(231, 76, 60, 1)',    // Red
        'rgba(46, 204, 113, 1)',   // Green
        'rgba(155, 89, 182, 1)',   // Purple
        'rgba(241, 196, 15, 1)',   // Yellow
    ];

    let colorIndex = 0;
    storeGroups.forEach((data, store) => {
        const storeData = data.slice(-10).map(item => item.price);

        datasets.push({
            data: storeData,
            color: (opacity = 1) => colors[colorIndex % colors.length].replace('1)', `${opacity})`),
            strokeWidth: 2
        });

        colorIndex++;
    });

    return {
        labels,
        datasets,
        legend: Array.from(storeGroups.keys()).slice(0, datasets.length)
    };
}