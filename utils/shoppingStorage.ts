// @/utils/shoppingStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'user_favorites';

export interface FavoriteProduct {
    id: string;
    name: string;
    brand: string;
    vendor: string;
    image: string;
    current_price: { price: number };
    store: { name: string };
    ean: string;
    dateAdded: string;

    // Required nutrition data - matching Product interface
    calories: number;
    protein: number;
    fat: number;
    carbs: number;

    // Additional nutrition data
    sugar?: number;

    // Labels and allergens - required arrays
    labels: string[];
    allergens: string[];

    // Optional additional data
    description?: string;
    ingredients?: string;
    weight?: string;
    category?: { name: string }[];

    // Price history for consistency
    price_history?: Array<{
        date: string;
        price: number;
        store?: string;
    }>;
}

export const favoritesStorage = {
    // Get all favorites
    async getFavorites(): Promise<FavoriteProduct[]> {
        try {
            const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
            const parsedFavorites = favorites ? JSON.parse(favorites) : [];

            // Ensure all favorites have required nutrition data and labels
            return parsedFavorites.map((fav: any) => ({
                ...fav,
                calories: fav.calories || 0,
                protein: fav.protein || 0,
                fat: fav.fat || 0,
                carbs: fav.carbs || 0,
                labels: Array.isArray(fav.labels) ? fav.labels : [],
                allergens: Array.isArray(fav.allergens) ? fav.allergens : [],
            }));
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    },

    // Add product to favorites
    async addFavorite(product: FavoriteProduct): Promise<boolean> {
        try {
            const favorites = await this.getFavorites();

            // Check if product already exists
            const exists = favorites.some(fav => fav.id === product.id);
            if (exists) {
                console.log('Product already in favorites:', product.name);
                return true; // Already in favorites
            }

            // Ensure all required fields are present and properly formatted
            const productWithCompleteData: FavoriteProduct = {
                id: product.id,
                name: product.name,
                brand: product.brand || '',
                vendor: product.vendor || '',
                image: product.image || '',
                current_price: product.current_price || { price: 0 },
                store: product.store || { name: '' },
                ean: product.ean,
                dateAdded: new Date().toISOString(),

                // Required nutrition data
                calories: product.calories || 0,
                protein: product.protein || 0,
                fat: product.fat || 0,
                carbs: product.carbs || 0,

                // Optional nutrition data
                sugar: product.sugar,

                // Required arrays
                labels: Array.isArray(product.labels) ? product.labels : [],
                allergens: Array.isArray(product.allergens) ? product.allergens : [],

                // Optional additional data
                description: product.description,
                ingredients: product.ingredients,
                weight: product.weight,
                category: product.category,
                price_history: product.price_history,
            };

            favorites.push(productWithCompleteData);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

            console.log('Successfully added to favorites:', product.name);
            console.log('Nutrition data saved:', {
                calories: productWithCompleteData.calories,
                protein: productWithCompleteData.protein,
                fat: productWithCompleteData.fat,
                carbs: productWithCompleteData.carbs,
                labels: productWithCompleteData.labels
            });

            return true;
        } catch (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
    },

    // Remove product from favorites
    async removeFavorite(productId: string): Promise<boolean> {
        try {
            const favorites = await this.getFavorites();
            const updatedFavorites = favorites.filter(fav => fav.id !== productId);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
            console.log('Successfully removed from favorites:', productId);
            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            return false;
        }
    },

    // Check if product is in favorites
    async isFavorite(productId: string): Promise<boolean> {
        try {
            const favorites = await this.getFavorites();
            return favorites.some(fav => fav.id === productId);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    },

    // Clear all favorites
    async clearFavorites(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(FAVORITES_KEY);
            console.log('All favorites cleared');
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    },

    // Update existing favorite with new data (useful for price updates)
    async updateFavorite(productId: string, updates: Partial<FavoriteProduct>): Promise<boolean> {
        try {
            const favorites = await this.getFavorites();
            const index = favorites.findIndex(fav => fav.id === productId);

            if (index === -1) {
                console.log('Product not found in favorites for update:', productId);
                return false;
            }

            // Update the product while preserving required fields
            favorites[index] = {
                ...favorites[index],
                ...updates,
                // Ensure arrays are always arrays
                labels: Array.isArray(updates.labels) ? updates.labels : favorites[index].labels,
                allergens: Array.isArray(updates.allergens) ? updates.allergens : favorites[index].allergens,
            };

            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            console.log('Successfully updated favorite:', productId);
            return true;
        } catch (error) {
            console.error('Error updating favorite:', error);
            return false;
        }
    }
};