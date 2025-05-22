import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { router, useLocalSearchParams } from 'expo-router';


import Fat from '../../assets/icons/fat.svg';
import Calories from '../../assets/icons/calories.svg';
import Protein from '../../assets/icons/protein.svg';
import Carb from '../../assets/icons/carb.svg';
import BackArrow from '../../assets/icons/backarrow.svg';
import Heart from '../../assets/icons/heart.svg';

const { width } = Dimensions.get('window');

// Define the product interface
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
}

// Mock product data - In a real app, this would come from our API
const mockProducts: Record<string, Product> = {
    '1': {
        id: '1',
        name: "Monster Ultra Paradise 0,5l boks",
        vendor: "Coca-cola europacific partners norge as",
        brand: "Monster",
        description: "Monster Energy Ultra Paradise på 500ml boks uten sukker med vår egen energiblanding og 160mg koffein. Ultra Paradise har en forfriskende smak av kiwi og lime med et hint av agurk.",
        ingredients: "Kullsyreholdig vann, syre (sitronsyre), taurin (0.4%), surhetsregulerende middel (natriumsitrater), panax ginsengrot-ekstrakt (0.08%), aromaer, konserveringsmidler (kaliumsorbat, natriumbenzoat), søtstoffer (acesulfam k, sukralose), maltodextrin, koffein (0.03%), vitaminer (niacin (vit b3), pantotensyre (vit b5), b6, b12), salt, saflor-ekstrakt, vegetabilske oljer (kokosnøtt, rapsfrø), modifisert stivelse, inositol, fargestoff (e 133).",
        image: "https://bilder.ngdata.no/5060639126378/kiwi/large.jpg",
        current_price: { price: 22.6 },
        store: { name: "KIWI" },
        category: [{ name: "Energidrikk" }],
        calories: 10,
        protein: 0,
        carbs: 3,
        fat: 0,
        labels: ["Unhealthy", "High sugar", "Ultra-processed"],
        allergens: ["Kan inneholde spor av nøtter", "Kunstige søtstoffer"]
    },
    '2': {
        id: '2',
        name: "Sørlandschips CHILL Chilinøtter Buffalo Reaper",
        vendor: "Sørlandschips AS",
        brand: "Sørlandschips",
        description: "Crispy and spicy nuts with Buffalo Reaper seasoning for the ultimate heat experience.",
        ingredients: "Peanuts, rapeseed oil, salt, spices, flavor enhancers.",
        image: "https://bilder.ngdata.no/example/chips.jpg",
        current_price: { price: 20.99 },
        store: { name: "REMA 1000" },
        category: [{ name: "Snacks" }],
        calories: 512,
        protein: 6,
        carbs: 50,
        fat: 30,
        labels: ["Unhealthy", "High calorie"],
        allergens: ["Peanuts", "May contain traces of other nuts"]
    },
    '3': {
        id: '3',
        name: "Gartner SNACKS-GULROT",
        vendor: "Gartner AS",
        brand: "Gartner",
        description: "Fresh organic carrots, perfect for healthy snacking.",
        ingredients: "Organic carrots.",
        image: "https://bilder.ngdata.no/example/carrots.jpg",
        current_price: { price: 20.99 },
        store: { name: "KIWI" },
        category: [{ name: "Vegetables" }],
        calories: 45,
        protein: 1,
        carbs: 10,
        fat: 0,
        labels: ["Healthy", "Vegan"],
        allergens: []
    }
};

// Mock price history data for chart
const priceHistoryData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"],
    datasets: [
        {
            data: [24.5, 23.9, 22.6, 22.6, 21.9, 22.6],
            color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
            strokeWidth: 2
        },
        {
            data: [25.2, 24.8, 24.1, 23.5, 23.2, 23.8],
            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
            strokeWidth: 2
        }
    ],
    legend: ["KIWI", "REMA 1000"]
};

// Helper function to get label styles
const getLabelStyle = (label: string) => {
    const labelLower = label.toLowerCase();

    if (labelLower === 'unhealthy') return styles.unhealthyLabel;
    if (labelLower === 'high sugar') return styles.highSugarLabel;
    if (labelLower === 'ultra-processed') return styles.ultraprocessed;
    if (labelLower === 'high calorie') return styles.highCalorieLabel;
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

    // Get the product ID from the URL parameters
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        // Load product data based on the ID
        if (id) {
            // In a real app, we could fetch from your API here
            const foundProduct = mockProducts[id];
            if (foundProduct) {
                setProduct(foundProduct);
            }
        }
        setLoading(false);
    }, [id]);

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // This is where we could implement the cart/favorite logic
        console.log('Toggle favorite:', product?.name, !isFavorite ? 'Added to cart' : 'Removed from cart');
        // Right here is where we can integrate with your cart state here
    };

    const handleGoBack = () => {
        // Navigate to shopping cart page instead of going back
        router.push('/shoppingCart');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity style={styles.errorBackButton} onPress={handleGoBack}>
                    <Text style={styles.errorBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        <View style={styles.labelsContainer}>
                            {product.labels.map((label, index) => (
                                <View key={index} style={[styles.labelBadge, getLabelStyle(label)]}>
                                    <Text style={styles.labelText}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Product Information Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Product Information</Text>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Description</Text>
                            <Text style={styles.infoText}>{product.description}</Text>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Ingredients</Text>
                            <Text style={styles.infoText}>{product.ingredients}</Text>
                        </View>

                        {product.allergens.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Allergens</Text>
                                <Text style={styles.infoText}>{product.allergens.join(", ")}</Text>
                            </View>
                        )}
                    </View>

                    {/* Price History Chart Card */}
                    <View style={styles.chartCard}>
                        <Text style={styles.sectionTitle}>Price Charts</Text>
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={priceHistoryData}
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
                                    }
                                }}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </View>
                </View>

                {/* spacing for safe area */}
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
        paddingTop: 48, // Account for status bar
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
        marginBottom: 16,
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
    // Label styles
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
    bottomSpacing: {
        height: 40,
    },
});