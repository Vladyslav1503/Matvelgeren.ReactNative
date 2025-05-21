// Define types for the API response nutrition data
interface NutritionItem {
    amount: number;
    code: string;
    display_name: string;
    unit: string;
}

interface ApiProduct {
    name?: string;
    current_price?: {
        price: number;
        currency?: string;
    };
    image_url?: string;
    brand?: string;
    description?: string;
    [key: string]: any; // Allow for additional fields
}

interface ApiResponse {
    data: {
        ean: string;
        products: ApiProduct[];
        nutrition: NutritionItem[];
    };
}

// Define the structure we want to return that matches ProductCard expectations
interface ParsedNutrition {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    sugar?: number;
    salt?: number;
    saturatedFat?: number;
    // Add more fields if needed for your ProductCard
}

/**
 * Parses nutrition data from the API response into a format compatible with ProductCard
 *
 * @param nutritionData - Array of nutrition items from the API
 * @returns ParsedNutrition object with values matched to ProductCard requirements
 */
export const parseNutrition = (nutritionData: NutritionItem[]): ParsedNutrition => {
    // Initialize empty result
    const result: ParsedNutrition = {};

    // Map through nutrition data to extract relevant information
    nutritionData.forEach(item => {
        switch (item.code) {
            case 'energi_kcal':
                result.calories = item.amount;
                break;
            case 'protein':
                result.protein = item.amount;
                break;
            case 'fett_totalt':
                result.fat = item.amount;
                break;
            case 'karbohydrater':
                result.carbs = item.amount;
                break;
            case 'sukkerarter':
                result.sugar = item.amount;
                break;
            case 'salt':
                result.salt = item.amount;
                break;
            case 'mettet_fett':
                result.saturatedFat = item.amount;
                break;
            // Add more cases if needed
        }
    });

    return result;
};

/**
 * Example of how to use this parser with your API data
 *
 * @param apiResponse - The full API response from fetchProductByEAN
 * @returns An object that can be used with your ProductCard component
 */
export const mapApiResponseToProductCard = (apiResponse: ApiResponse): any => {
    try {
        // Extract necessary data from API response
        const { data } = apiResponse;

        if (!data || !data.nutrition) {
            console.warn('Invalid API response structure');
            return null;
        }

        const product = data.products && data.products.length > 0 ? data.products[0] : null;

        // If no product found, return null or some default data
        if (!product) {
            console.warn('No product found in API response');
            return {
                id: data.ean || 'unknown',
                name: 'Unknown Product',
                price: 0,
                labels: ['Unknown'],
                imageUrl: '',
            };
        }

        // Parse nutrition data
        const nutrition = parseNutrition(data.nutrition || []);

        // Create a product object compatible with your ProductCard
        return {
            id: data.ean || 'unknown',
            name: product.name || 'Unknown Product',
            price: product.current_price?.price || 0,
            labels: determineLabels(nutrition),
            imageUrl: product.image || '',
            brand: product.brand || '',
            description: product.description || '',
            ...nutrition
        };
    } catch (error) {
        console.error('Error mapping API response to ProductCard:', error);
        return null;
    }
};

/**
 * Helper function to determine product labels based on nutrition values
 * You can customize this logic based on your requirements
 */
const determineLabels = (nutrition: ParsedNutrition): string[] => {
    const labels: string[] = [];

    // Check for healthy/unhealthy based on multiple factors
    let healthScore = 0;

    // Positive factors
    if (nutrition.protein && nutrition.protein > 10) healthScore += 2;
    if (nutrition.fat && nutrition.fat < 5) healthScore += 1;
    if (nutrition.sugar && nutrition.sugar < 5) healthScore += 1;
    if (nutrition.saturatedFat && nutrition.saturatedFat < 2) healthScore += 1;
    if (nutrition.salt && nutrition.salt < 0.3) healthScore += 1;

    // Negative factors
    if (nutrition.sugar && nutrition.sugar > 10) healthScore -= 2;
    if (nutrition.saturatedFat && nutrition.saturatedFat > 5) healthScore -= 2;
    if (nutrition.fat && nutrition.fat > 17.5) healthScore -= 1;
    if (nutrition.salt && nutrition.salt > 1.5) healthScore -= 1;

    // Assign label based on health score
    if (healthScore >= 3) {
        labels.push('Healthy');
    } else if (healthScore <= -3) {
        labels.push('Unhealthy');
    }

    // Check for ultra-processed (simplified logic)
    if (nutrition.salt && nutrition.salt > 1 && nutrition.sugar && nutrition.sugar > 10) {
        labels.push('Ultra-Processed');
    }

    // This logic follows nutritional guidelines - adjust as needed for your app
    if (nutrition.calories !== undefined) {
        if (nutrition.calories <= 40) {
            labels.push('Low Calorie');
        } else if (nutrition.calories >= 200) {
            labels.push('High Calorie');
        }
    }

    if (nutrition.fat !== undefined) {
        if (nutrition.fat <= 1) {
            labels.push('Low Fat');
        } else if (nutrition.fat >= 17.5) {
            labels.push('High Fat');
        }
    }

    if (nutrition.sugar !== undefined) {
        if (nutrition.sugar >= 10) {
            labels.push('High Sugar');
        } else if (nutrition.sugar <= 2) {
            labels.push('Low Sugar');
        }
    }

    if (nutrition.carbs !== undefined && nutrition.carbs <= 1) {
        labels.push('No Carbs');
    }

    return labels;
};