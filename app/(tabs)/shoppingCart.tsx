import React, { useState, useCallback, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
    ActivityIndicator,
    FlatList
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { searchProducts } from '@/api/kassalappAPI';
import { favoritesStorage, FavoriteProduct } from '@/utils/shoppingStorage';

import SearchIcon from '../../assets/icons/search.svg';
import ProductCard from '../../components/ProductCard';

// Data types
interface Product {
    id: string;
    ean: string;
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

// API Product interface matching your API response
interface ApiProduct {
    id: number;
    name: string;
    brand?: string;
    vendor?: string;
    ean: string;
    url: string;
    image?: string;
    category: Array<{
        id: number;
        depth: number;
        name: string;
    }>;
    description?: string;
    ingredients?: string;
    current_price: number;
    current_unit_price?: number;
    weight?: number;
    weight_unit?: string;
    store: {
        name: string;
        code: string;
        url: string;
        logo?: string;
    };
    price_history?: Array<{
        price: number;
        date: string;
    }>;
    allergens?: Array<{
        code: string;
        display_name: string;
        contains: string;
    }>;
    nutrition?: Array<{
        code: string;
        display_name: string;
        amount: number;
        unit: string;
    }>;
    labels?: string[];
    created_at: string;
    updated_at: string;
}

// Function to convert stored favorite to our Product interface
const convertFavoriteToProduct = (favorite: FavoriteProduct): Product => {
    return {
        id: favorite.id,
        name: favorite.name,
        brand: favorite.brand,
        price: favorite.current_price?.price || 0,
        imageUrl: favorite.image || '/api/placeholder/150/150',
        store: favorite.store?.name,
        ean: favorite.ean || '',
        calories: favorite.calories || 0,
        protein: favorite.protein || 0,
        fat: favorite.fat || 0,
        carbs: favorite.carbs || 0,
        sugar: favorite.sugar || 0,
        labels: favorite.labels || [],
    };
};

// Function to convert API product to our Product interface
const convertApiProductToProduct = (apiProduct: ApiProduct): Product => {
    // Extract nutrition data if available
    const nutritionMap = new Map<string, number>();
    if (apiProduct.nutrition) {
        apiProduct.nutrition.forEach((item: { code: string; amount: number }) => {
            nutritionMap.set(item.code, item.amount);
        });
    }

    // Generate labels based on nutrition values
    const labels = determineProductLabels(nutritionMap);

    // Format weight
    let weight = '';
    if (apiProduct.weight && apiProduct.weight_unit) {
        weight = `${apiProduct.weight}${apiProduct.weight_unit}`;
    } else if (apiProduct.weight) {
        weight = `${apiProduct.weight}g`; // Default to grams if no unit
    }

    return {
        id: apiProduct.id.toString(),
        name: apiProduct.name || 'Unknown Product',
        calories: nutritionMap.get('energi_kcal'),
        protein: nutritionMap.get('protein'),
        fat: nutritionMap.get('fett_totalt'),
        carbs: nutritionMap.get('karbohydrater'),
        sugar: nutritionMap.get('sukkerarter'),
        price: Number(apiProduct.current_price) || 0,
        labels: labels,
        imageUrl: apiProduct.image || '/api/placeholder/150/150',
        store: apiProduct.store?.name,
        storeLogo: apiProduct.store?.logo,
        description: apiProduct.description || '',
        brand: apiProduct.brand || '',
        weight: weight,
        ean: apiProduct.ean || ''
    };
};

// Helper function to determine product labels based on nutrition data
const determineProductLabels = (nutritionMap: Map<string, number>): string[] => {
    const labels: string[] = [];

    if (nutritionMap.size === 0) return labels;

    // Get nutrition values with proper null checks
    const calories = nutritionMap.get('energi_kcal') || 0;
    const sugar = nutritionMap.get('sukkerarter') || 0;
    const fat = nutritionMap.get('fett_totalt') || 0;
    const protein = nutritionMap.get('protein') || 0;
    const carbs = nutritionMap.get('karbohydrater') || 0;

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

    // Check for no/low carbs
    if (carbs < 1) {
        labels.push('No carbs');
    } else if (carbs < 5) {
        labels.push('Low carb');
    }

    // Add health label based on overall profile
    if (labels.length === 0 && calories < 200 && fat < 10 && sugar < 10) {
        labels.push('Healthy');
    } else if (labels.some((label: string) => ['High sugar', 'High fat', 'High calorie'].includes(label))) {
        labels.push('Unhealthy');
    }

    return labels;
};

const { width, height } = Dimensions.get('window');
console.log(height);
let TOTAL_SUM_CONTAINER_MARGIN_BOTTOM = (height >= 890) ? height * 0.07 : height * 0.05;

if (width <= 420 && height >= 910) {
    TOTAL_SUM_CONTAINER_MARGIN_BOTTOM = (height * 0.05);
} else if (height < 890) {
    TOTAL_SUM_CONTAINER_MARGIN_BOTTOM = (height * 0.05);
} else if (height >= 890 && height < 910) {
    TOTAL_SUM_CONTAINER_MARGIN_BOTTOM = (height * 0.07);
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function ShoppingCart() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Debounce search query to avoid too many API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

    // Load stored products on component mount and when screen comes into focus
    useEffect(() => {
        loadStoredProducts();
    }, []);

    // Reload products whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadStoredProducts();
        }, [])
    );

    // Load products from storage
    const loadStoredProducts = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const storedFavorites = await favoritesStorage.getFavorites();
            const convertedProducts = storedFavorites.map(convertFavoriteToProduct);
            setProducts(convertedProducts);
        } catch (error) {
            console.error('Error loading stored products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle search
    useEffect(() => {
        if (debouncedSearchQuery.trim().length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            setSearchError(null);
            return;
        }

        performSearch(debouncedSearchQuery.trim());
    }, [debouncedSearchQuery]);

    const performSearch = async (query: string): Promise<void> => {
        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await searchProducts(query);

            // More robust response handling
            let productsArray: ApiProduct[] = [];

            if (response && response.data && Array.isArray(response.data)) {
                productsArray = response.data;
            } else if (response && Array.isArray(response)) {
                productsArray = response;
            } else {
                console.warn('Unexpected API response format:', response);
                productsArray = [];
            }

            // Convert and validate products
            const convertedProducts = productsArray
                .filter((product: ApiProduct) => product && product.id) // Filter out invalid products
                .map((product: ApiProduct) => convertApiProductToProduct(product));

            setSearchResults(convertedProducts);
            setShowSearchResults(true);

        } catch (error) {
            console.error('Search failed:', error);
            setSearchError('Failed to search products. Please try again.');
            setSearchResults([]);
            setShowSearchResults(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (text: string): void => {
        setSearchQuery(text);

        // If search is cleared, hide results immediately
        if (text.trim().length === 0) {
            setShowSearchResults(false);
            setSearchResults([]);
            setSearchError(null);
        }
    };

    // Remove product function
    const removeProduct = async (id: string): Promise<void> => {
        try {
            const success = await favoritesStorage.removeFavorite(id);
            if (success) {
                // Update local state immediately
                setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    // Calculate total price
    const totalPrice = products.reduce((sum: number, product: Product) => {
        const price = Number(product.price) || 0;
        return sum + price;
    }, 0);

    // Render search result item
    const renderSearchResult = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
        >
            <ProductCard
                product={item}
                ean={item.ean || ''}
                onRemove={undefined} // Don't show remove button in search results
                showRemoveButton={false}
            />
        </TouchableOpacity>
    );

    // Show loading state while products are being loaded
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#666" />
                <Text style={styles.loadingText}>Loading your cart...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Your shopping cart</Text>

            {/* Search Bar with SVG icon */}
            <View style={styles.searchContainer}>
                <SearchIcon width={20} height={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search product to add to your cart"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                />
                {isSearching && (
                    <ActivityIndicator
                        size="small"
                        color="#666"
                        style={styles.searchLoader}
                    />
                )}
            </View>

            {/* Search Error */}
            {searchError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{searchError}</Text>
                </View>
            )}

            {/* Search Results */}
            {showSearchResults && (
                <View style={styles.searchResultsContainer}>
                    <Text style={styles.searchResultsTitle}>
                        Search Results ({searchResults.length})
                    </Text>
                    {searchResults.length > 0 ? (
                        <View style={styles.searchResultsListContainer}>
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchResult}
                                keyExtractor={(item: Product) => item.id}
                                style={styles.searchResultsList}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    ) : (
                        <Text style={styles.noResultsText}>
                            No products found for &#34;{debouncedSearchQuery}&#34;
                        </Text>
                    )}
                </View>
            )}

            {/* Cart Products */}
            {!showSearchResults && (
                <ScrollView style={styles.productList}>
                    {products.map((product: Product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            ean={product.ean || ''}
                            onRemove={removeProduct}
                        />
                    ))}

                    {products.length > 0 && (
                        <Text style={styles.addMoreText}>
                            Add more products to keep prepare your trip to grocery store
                        </Text>
                    )}

                    {products.length === 0 && (
                        <View style={styles.emptyCartContainer}>
                            <Text style={styles.emptyCartText}>Your cart is empty</Text>
                            <Text style={styles.emptyCartSubText}>
                                Search for products above to add them to your cart
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Total sum */}
            {products.length > 0 && !showSearchResults && totalPrice > 0 && (
                <View style={styles.totalContainer}>
                    <View style={styles.totalPill}>
                        <Text style={styles.totalText}>Sum: {totalPrice.toFixed(2)} kr</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 28,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-SemiBold',
        marginTop: 0,
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginBottom: 18,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        padding: 8,
        fontFamily: 'Inter-Regular',
    },
    searchLoader: {
        marginLeft: 8,
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#c62828',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        textAlign: 'center',
    },
    searchResultsContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    searchResultsTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 12,
        color: '#333',
    },
    searchResultsList: {
        flex: 1,
    },
    searchResultsListContainer: {
        maxHeight: '100%',
        flex: 1,
    },
    searchResultItem: {
        marginBottom: 8,
    },
    noResultsText: {
        textAlign: 'center',
        color: '#666',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        padding: 20,
    },
    productList: {
        flex: 1,
    },
    addMoreText: {
        alignSelf: 'center',
        letterSpacing: 0.2,
        lineHeight: 16,
        maxWidth: '70%',
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontFamily: 'Inter-Regular',
        fontSize: 12,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    emptyCartText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    emptyCartSubText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    totalContainer: {
        bottom: TOTAL_SUM_CONTAINER_MARGIN_BOTTOM,
        alignItems: "flex-end",
        paddingVertical: 15,
    },
    totalPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        ...Platform.select({
            android: {
                boxShadow: '1px -3px 10px rgba(0, 0, 0, 0.06)',
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 1, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 5,
            }
        }),
        elevation: 1,
    },
    totalText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
});