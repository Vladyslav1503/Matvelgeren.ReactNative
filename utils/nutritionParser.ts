// nutritionParser.ts

interface ApiProduct {
    id: string;
    name: string;
    current_price: {
        price: number;
        unit_price?: number;
        date?: string;
    };
    image?: string;
    brand?: string;
    description?: string;
    store?: {
        name: string;
        logo?: string;
    };
    weight?: number;
    weight_unit?: string;
    [key: string]: any; // Allow for additional fields
}

interface ApiResponse {
    data: {
        ean: string;
        products: ApiProduct[];
        nutrition: any[];
    };
}

interface Product {
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

// Function to find the best product from the list
export async function mapApiResponseToProductCard(apiResponse: ApiResponse): Promise<Product | null> {
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
        return createProductFromApiData(product, nutritionData);
    }

    // If no product with valid image found, use the first product without image validation
    return createProductFromApiData(products[0], nutritionData);
}

// Helper function to create a product object from API data
function createProductFromApiData(product: ApiProduct, nutritionItems: NutritionItem[] | null): Product {
    // Extract basic product info
    const productInfo: Product = {
        id: product.id.toString(),
        name: product.name || 'Unknown Product',
        price: product.current_price?.price || 0,
        labels: [], // Will be populated based on nutrition data
        imageUrl: product.image || 'https://placeholder-image.com/150x150', // Fallback image
    };
    
    // Add store information if available
    if (product.store) {
        productInfo.store = product.store.name;
        productInfo.storeLogo = product.store.logo;
    }
    
    // Add additional product details
    productInfo.description = product.description || '';
    productInfo.brand = product.brand || '';
    
    // Add weight information if available
    if (product.weight && product.weight_unit) {
        productInfo.weight = `${product.weight}${product.weight_unit}`;
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
        productInfo.calories = nutritionMap.get('energi_kcal');
        productInfo.protein = nutritionMap.get('protein');
        productInfo.fat = nutritionMap.get('fett_totalt');
        productInfo.carbs = nutritionMap.get('karbohydrater');
        productInfo.sugar = nutritionMap.get('sukkerarter');
        
        // Generate labels based on nutrition values
        productInfo.labels = determineProductLabels(nutritionMap);
    }
    
    return productInfo;
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
    
    // Add health label based on overall profile
    if (labels.length === 0 && calories < 200 && fat < 10) {
        labels.push('Healthy');
    } else if (labels.length > 0) {
        labels.push('Unhealthy');
    }
    
    return labels;
}

// More efficient version with Promise.all for concurrent image checking
export async function mapApiResponseToProductCardEfficient(apiResponse: ApiResponse): Promise<Product | null> {
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
        return createProductFromApiData(products[0], nutritionData);
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
            return createProductFromApiData(productWithValidImage.product, nutritionData);
        }
        
        // If no valid images found, use the first product
        return createProductFromApiData(products[0], nutritionData);
    } catch (error) {
        console.log('Error validating images:', error);
        // Fallback to first product if there's an error during image validation
        return createProductFromApiData(products[0], nutritionData);
    }
}

// Function to extract a specific nutrition value by code
export function getNutritionValue(nutritionItems: NutritionItem[] | null, code: string): number | undefined {
    if (!nutritionItems) return undefined;
    
    const item = nutritionItems.find(item => item.code === code);
    return item ? item.amount : undefined;
}