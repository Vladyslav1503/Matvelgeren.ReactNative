import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform, Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchProductByEAN } from '@/api/kassalappAPI';

// Import your existing SVG icons
import Fat from '../../assets/icons/fat.svg';
import Calories from '../../assets/icons/calories.svg';
import Protein from '../../assets/icons/protein.svg';
import Carb from '../../assets/icons/carb.svg';
import BackArrow from '../../assets/icons/backarrow.svg';
import Heart from '../../assets/icons/heart.svg';

// Import the parser functions
import { mapApiResponseToProduct, formatPriceHistoryForChart } from '@/utils/nutritionParser';

import { favoritesStorage, FavoriteProduct } from '@/utils/shoppingStorage';

const { width } = Dimensions.get('window');

// Define the product interface
interface Product {
    sugar?: number;
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

// Define store colors
const STORE_COLORS = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#9b59b6', // Purple
    '#f39c12', // Orange
    '#1abc9c', // Teal
    '#e67e22', // Dark Orange
    '#34495e', // Dark Gray
];

// Helper function to get label styles
const getLabelStyle = (label: string) => {
    const labelLower = label.toLowerCase();

    if (labelLower === 'unhealthy') return styles.unhealthyLabel;
    if (labelLower === 'high sugar') return styles.highSugarLabel;
    if (labelLower === 'ultra-processed') return styles.ultraprocessed;
    if (labelLower === 'high calorie') return styles.highCalorieLabel;
    if (labelLower === 'high fat') return styles.highFatLabel;
    if (labelLower === 'high protein') return styles.highProteinLabel;
    if (labelLower === 'healthy') return styles.healthyLabel;
    if (labelLower === 'vegan') return styles.veganLabel;
    if (labelLower === 'gluten free') return styles.glutenFreeLabel;
    if (labelLower === 'low calorie') return styles.lowCalorieLabel;
    if (labelLower === 'no carbs') return styles.noCarbs;

    return {};
};

export default function Product() {
    const [isFavorite, setIsFavorite] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get the EAN/ID from the URL parameters
    const { id, ean, productData } = useLocalSearchParams<{
        id?: string;
        ean?: string;
        productData?: string;
    }>();

    useEffect(() => {
        loadProductData();
    }, [id, ean, productData]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            setError(null);

            // First check if we have direct product data passed via navigation
            if (productData) {
                try {
                    const parsedProduct = JSON.parse(decodeURIComponent(productData)) as Product;
                    setProduct(parsedProduct);
                    setLoading(false);
                    return;
                } catch (parseError) {
                    console.log('Error parsing product data:', parseError);
                    // Continue to API fetch if parsing fails
                }
            }

            // Determine what identifier to use for API call
            const productIdentifier = ean;

            if (!productIdentifier) {
                setError('No product identifier provided');
                setLoading(false);
                return;
            }

            console.log('Fetching product with EAN:', productIdentifier);

            // Fetch from API using EAN - fetchProductByEAN returns data directly, not a Response object
            const apiResponse = await fetchProductByEAN(productIdentifier);

            console.log('API Response:', apiResponse);

            // Check if we have valid products in the response
            if (!apiResponse?.data?.products || apiResponse.data.products.length === 0) {
                setError('Product not found in database');
                setLoading(false);
                return;
            }

            // Use the parser to convert API response to Product format
            const parsedProduct = await mapApiResponseToProduct(apiResponse);

            if (parsedProduct) {
                console.log('Parsed product:', parsedProduct);
                setProduct(parsedProduct);
            } else {
                setError('Product not found or could not be parsed');
            }
        } catch (err) {
            console.error('Error loading product:', err);

            // Handle different types of errors
            if (err instanceof Error) {
                if (err.message && err.message.includes("No query results for model")) {
                    setError("This product doesn't exist in our database yet.");
                } else {
                    setError(`Failed to load product: ${err.message}`);
                }
            } else {
                setError('Failed to load product data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!product) return;

        try {
            if (isFavorite) {
                // Remove from favorites
                const success = await favoritesStorage.removeFavorite(product.id);
                if (success) {
                    setIsFavorite(false);
                    console.log('Removed from favorites:', product.name);
                } else {
                    Alert.alert('Error', 'Failed to remove from favorites');
                }
            } else {
                // Add to favorites with complete nutrition data and labels
                const favoriteProduct: FavoriteProduct = {
                    id: product.id,
                    name: product.name,
                    brand: product.brand || '',
                    vendor: product.vendor || '',
                    image: product.image || '',
                    current_price: product.current_price || { price: 0 },
                    store: product.store || { name: '' },
                    ean: ean || '',
                    dateAdded: new Date().toISOString(),

                    // Required nutrition data - ensure all are numbers
                    calories: product.calories || 0,
                    protein: product.protein || 0,
                    fat: product.fat || 0,
                    carbs: product.carbs || 0,

                    // Optional nutrition data
                    sugar: product.sugar || 0,

                    // Required arrays - ensure they are always arrays
                    labels: Array.isArray(product.labels) ? product.labels : [],
                    allergens: Array.isArray(product.allergens) ? product.allergens : [],

                    // Optional additional data
                    description: product.description,
                    ingredients: product.ingredients,
                    category: product.category,
                    price_history: product.price_history,
                };

                console.log('Attempting to save favorite with data:', {
                    name: favoriteProduct.name,
                    nutrition: {
                        calories: favoriteProduct.calories,
                        protein: favoriteProduct.protein,
                        fat: favoriteProduct.fat,
                        carbs: favoriteProduct.carbs
                    },
                    labels: favoriteProduct.labels,
                    allergens: favoriteProduct.allergens
                });

                const success = await favoritesStorage.addFavorite(favoriteProduct);
                if (success) {
                    setIsFavorite(true);
                    console.log('Added to favorites with complete data:', product.name);
                } else {
                    Alert.alert('Error', 'Failed to add to favorites');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleGoBack = () => {
        // Navigate to shopping cart page instead of going back
        router.push('/shoppingCart');
    };

    // Function to format date to show days - optimized for clean display
    const formatDateToDay = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d';
        if (diffDays < 7) return `${diffDays}d`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
        return `${Math.floor(diffDays / 30)}m`;
    };

    // Function to generate chart data from price history with proper colors and clean labels
    const generateChartData = () => {
        if (!product?.price_history || product.price_history.length === 0) {
            // Return default/empty chart data
            return {
                labels: ["No Data"],
                datasets: [{
                    data: [product?.current_price.price || 0],
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                    strokeWidth: 2
                }],
                legend: []
            };
        }

        // Filter price history to last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentPriceHistory = product.price_history.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= sixMonthsAgo;
        });

        // If no data in last 6 months, show message
        if (recentPriceHistory.length === 0) {
            return {
                labels: ["No Recent Data"],
                datasets: [{
                    data: [product?.current_price.price || 0],
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                    strokeWidth: 2
                }],
                legend: []
            };
        }

        // Group price history by store (only last 6 months)
        const storeData: { [key: string]: Array<{date: string, price: number}> } = {};

        recentPriceHistory.forEach(item => {
            const storeName = item.store || product.store.name;
            if (!storeData[storeName]) {
                storeData[storeName] = [];
            }
            storeData[storeName].push({
                date: item.date,
                price: item.price
            });
        });

        // Sort each store's data by date
        Object.keys(storeData).forEach(store => {
            storeData[store].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        // Create labels from all unique dates in last 6 months, sorted
        const allDates = [...new Set(recentPriceHistory.map(item => item.date))];
        allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // Limit and space out labels to prevent overlap
        const maxLabels = 6; // Maximum number of labels to show
        let labelIndices: number[] = [];

        if (allDates.length <= maxLabels) {
            labelIndices = allDates.map((_, index) => index);
        } else {
            // Distribute labels evenly across the data range
            const step = Math.floor(allDates.length / (maxLabels - 1));
            for (let i = 0; i < maxLabels - 1; i++) {
                labelIndices.push(i * step);
            }
            labelIndices.push(allDates.length - 1); // Always include the last point
        }

        // Create clean labels array with empty strings for non-displayed labels
        const labels = allDates.map((date, index) => {
            if (labelIndices.includes(index)) {
                return formatDateToDay(date);
            }
            return ''; // Empty string for labels we don't want to show
        });

        // Create datasets for each store
        const datasets = Object.keys(storeData).map((storeName, index) => {
            const storeColor = STORE_COLORS[index % STORE_COLORS.length];

            // Create data array matching the labels
            const data = allDates.map(date => {
                const priceEntry = storeData[storeName].find(entry => entry.date === date);
                return priceEntry ? priceEntry.price : null;
            }).filter(price => price !== null);

            return {
                data: data,
                color: (opacity = 1) => {
                    const rgb = hexToRgb(storeColor);
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                },
                strokeWidth: 2
            };
        });

        return {
            labels: labels,
            datasets: datasets,
            legend: Object.keys(storeData) // Keep unique store names
        };
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 52, g: 152, b: 219}; // Default blue
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.errorText}>{error || 'Product not found'}</Text>
                <TouchableOpacity style={styles.errorBackButton} onPress={handleGoBack}>
                    <Text style={styles.errorBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const chartData = generateChartData();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                        <BackArrow width={20} height={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                        onPress={handleToggleFavorite}
                    >
                        <Heart
                            width={20}
                            height={20}
                            fill={isFavorite ? '#ff7400' : 'none'}
                            stroke={isFavorite ? '#ff7400' : '#999'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Product Image Section */}
                <View style={styles.imageSection}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                </View>

                {/* Main Container Card */}
                <View style={styles.mainCard}>
                    {/* Product Info Card */}
                    <View style={styles.productInfoCard}>
                        <Text style={styles.brandText}>{product.brand}</Text>
                        <Text style={styles.productName} numberOfLines={3}>
                            {product.name}
                        </Text>
                        <Text style={styles.vendorText}>{product.vendor}</Text>

                        {/* Categories */}
                        {product.category && product.category.length > 0 && (
                            <View style={styles.categoryContainer}>
                                {product.category.map((cat, index) => (
                                    <Text key={index} style={styles.categoryText}>
                                        {cat.name}
                                        {index < product.category.length - 1 ? ' • ' : ''}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {/* Price */}
                        <View style={styles.priceRow}>
                            <Text style={styles.priceText}>
                                {product.current_price.price.toFixed(2)} kr
                            </Text>
                            <Text style={styles.storeText}>
                                hos {product.store.name}
                            </Text>
                        </View>
                    </View>

                    {/* Nutritional Info Card */}
                    <View style={styles.nutritionCard}>
                        <Text style={styles.sectionTitle}>Nutritional Information</Text>
                        <View style={styles.nutritionGrid}>
                            <View style={styles.nutritionItem}>
                                <Calories width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.nutritionLabel}>Calories</Text>
                                <Text style={styles.nutritionValue}>{product.calories} kcal</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                                <Protein width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.nutritionLabel}>Protein</Text>
                                <Text style={styles.nutritionValue}>{product.protein}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                                <Carb width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.nutritionLabel}>Carbs</Text>
                                <Text style={styles.nutritionValue}>{product.carbs}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                                <Fat width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.nutritionLabel}>Fat</Text>
                                <Text style={styles.nutritionValue}>{product.fat}g</Text>
                            </View>
                        </View>

                        {/* Labels */}
                        {product.labels && product.labels.length > 0 && (
                            <View style={styles.labelsContainer}>
                                {product.labels.map((label, index) => (
                                    <View key={index} style={[styles.labelBadge, getLabelStyle(label)]}>
                                        <Text style={styles.labelText}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Product Information Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Product Information</Text>

                        {product.description && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Description</Text>
                                <Text style={styles.infoText}>{product.description}</Text>
                            </View>
                        )}

                        {product.ingredients && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Ingredients</Text>
                                <Text style={styles.infoText}>{product.ingredients}</Text>
                            </View>
                        )}

                        {product.allergens && product.allergens.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Allergens</Text>
                                <Text style={styles.infoText}>{product.allergens.join(", ")}</Text>
                            </View>
                        )}
                    </View>

                    {/* Price History Chart Card */}
                    <View style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>Price History (Last 6 Months)</Text>
                        <View style={styles.chartContainer}>
                            {chartData.datasets.length > 0 && chartData.labels.length > 0 && (
                                <LineChart
                                    data={chartData}
                                    width={width - 80}
                                    height={200}
                                    chartConfig={{
                                        backgroundColor: '#ffffff',
                                        backgroundGradientFrom: '#ffffff',
                                        backgroundGradientTo: '#ffffff',
                                        decimalPlaces: 1,
                                        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            r: "3",
                                            strokeWidth: "1",
                                        },
                                        propsForLabels: {
                                            fontSize: 10,
                                        }
                                    }}
                                    bezier
                                    style={styles.chart}
                                    withVerticalLabels={true}
                                    withHorizontalLabels={true}
                                />
                            )}
                            {(!chartData.datasets.length || !chartData.labels.length || chartData.labels[0] === "No Data" || chartData.labels[0] === "No Recent Data") && (
                                <View style={styles.noChartData}>
                                    <Text style={styles.noChartText}>
                                        {chartData.labels[0] === "No Recent Data"
                                            ? "No price history in the last 6 months"
                                            : "No price history available"}
                                    </Text>
                                </View>
                            )}
                        </View>


                    </View>
                </View>

                {/* Add spacing for safe area */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#e74c3c',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    errorBackButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    errorBackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#f8f9fa',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
    },
    favoriteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
    },
    favoriteButtonActive: {
        opacity: 1,
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#f8f9fa',
        marginBottom: 20,
    },
    productImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    mainCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            android: {
                elevation: 4,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
        }),
    },
    productInfoCard: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    brandText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: '#3498db',
        marginBottom: 4,
    },
    productName: {
        fontSize: 20,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginBottom: 8,
        lineHeight: 24,
    },
    vendorText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#666',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 20,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginRight: 8,
    },
    storeText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    nutritionCard: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginBottom: 16,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    nutritionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
    },
    nutritionIcon: {
        marginRight: 8,
    },
    nutritionLabel: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
        flex: 1,
    },
    nutritionValue: {
        fontSize: 12,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    labelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 6,
    },
    labelText: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        color: '#333',
    },
    unhealthyLabel: {
        backgroundColor: '#FFCDD2',
    },
    highSugarLabel: {
        backgroundColor: '#FFECB3',
    },
    ultraprocessed: {
        backgroundColor: '#d57c84',
    },
    highCalorieLabel: {
        backgroundColor: '#FFD180',
    },
    highFatLabel: {
        backgroundColor: '#FFAB91',
    },
    highProteinLabel: {
        backgroundColor: '#C5E1A5',
    },
    healthyLabel: {
        backgroundColor: '#C8E6C9',
    },
    veganLabel: {
        backgroundColor: '#DCEDC8',
    },
    glutenFreeLabel: {
        backgroundColor: '#E1BEE7',
    },
    lowCalorieLabel: {
        backgroundColor: '#B3E5FC',
    },
    noCarbs: {
        backgroundColor: '#F5F5F5',
    },
    infoCard: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoSection: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: '#666',
        lineHeight: 18,
    },
    chartCard: {
        padding: 20,
    },
    chartContainer: {
        alignItems: 'center',
        overflow: 'hidden',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noChartData: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        width: width - 80,
    },
    noChartText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    chartLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 4,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    bottomSpacing: {
        height: 40,
    },
});