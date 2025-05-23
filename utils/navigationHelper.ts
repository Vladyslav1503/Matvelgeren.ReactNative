// navigationHelper.ts
import { router } from 'expo-router';

// Interface for the ProductCard (from your existing code)
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

// Interface for the full Product (from your Product component)
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

/**
 * Navigate to product page with EAN (recommended approach)
 * This will fetch fresh data from the API
 */
export function navigateToProductByEan(ean: string) {
    router.push(`/product?ean=${ean}`);
}

/**
 * Navigate to product page with product ID
 * This will fetch fresh data from the API
 */
export function navigateToProductById(id: string) {
    router.push(`/product?id=${id}`);
}

/**
 * Navigate to product page with full product data
 * This passes the complete product data to avoid additional API calls
 */
export function navigateToProductWithData(product: Product) {
    // Serialize the product data to pass it via URL parameters
    const productDataString = encodeURIComponent(JSON.stringify(product));
    router.push(`/product?id=${product.id}&productData=${productDataString}`);
}

/**
 * Convert ProductCard to Product format for navigation
 * This is useful when you have a ProductCard but need to navigate to the full product page
 * Note: This creates a basic Product object - some fields may be missing
 */
export function convertProductCardToProduct(productCard: ProductCard): Product {
    return {
        id: productCard.id,
        name: productCard.name,
        vendor: 'Unknown Vendor', // This would need to be fetched from API
        brand: productCard.brand || 'Unknown Brand',
        description: productCard.description || '',
        ingredients: '', // This would need to be fetched from API
        image: productCard.imageUrl,
        current_price: { price: productCard.price },
        store: { name: productCard.store || 'Unknown Store' },
        category: [], // This would need to be fetched from API
        calories: productCard.calories || 0,
        protein: productCard.protein || 0,
        carbs: productCard.carbs || 0,
        fat: productCard.fat || 0,
        labels: productCard.labels,
        allergens: [], // This would need to be fetched from API
        // price_history is not available in ProductCard
    };
}

/**
 * Navigate to product page from ProductCard
 * This will try to use EAN if available, otherwise use ID
 */
export function navigateToProductFromCard(productCard: ProductCard, ean?: string) {
    if (ean) {
        navigateToProductByEan(ean);
    } else {
        navigateToProductById(productCard.id);
    }
}

/**
 * Enhanced navigation function that handles different scenarios
 */
export function navigateToProduct(options: {
    productCard?: ProductCard;
    product?: Product;
    ean?: string;
    id?: string;
}) {
    const { productCard, product, ean, id } = options;

    // Priority: Full product data > EAN > Product ID > ProductCard ID
    if (product) {
        navigateToProductWithData(product);
    } else if (ean) {
        navigateToProductByEan(ean);
    } else if (id) {
        navigateToProductById(id);
    } else if (productCard) {
        navigateToProductById(productCard.id);
    } else {
        console.error('No valid navigation option provided');
    }
}

/**
 * Example usage in your ProductCard component:
 *
 * ```typescript
 * import { navigateToProduct } from './utils/navigationHelper';
 *
 * // In your ProductCard component
 * const handleProductPress = () => {
 *     navigateToProduct({
 *         productCard: productCardData,
 *         ean: productEan, // if available
 *     });
 * };
 * ```
 */