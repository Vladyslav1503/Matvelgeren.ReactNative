import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native";

import Fat from '../../assets/icons/fat.svg';
import Calories from '../../assets/icons/calories.svg';
import Protein from '../../assets/icons/protein.svg';
import Carb from '../../assets/icons/carb.svg';
import SearchIcon from '../../assets/icons/search.svg';

// Define types for our data
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
}

// Sample product data
const sampleProducts: Product[] = [
    {
        id: '1',
        name: 'Monster energy drink zero ultra 500 ml',
        calories: 10,
        protein: 0,
        fat: 0,
        carbs: 3,
        sugar: 600,
        price: 20.99,
        labels: ['Unhealthy', 'High sugar'],
        imageUrl: 'https://placeholder.com/150' // This would be replaced with your actual image
    },
    {
        id: '2',
        name: 'Sørlandchips CHILL Chilinøtter Buffalo Reaper',
        calories: 512,
        protein: 6,
        fat: 30,
        carbs: 50,
        price: 20.99,
        labels: ['Unhealthy', 'High calorie'],
        imageUrl: 'https://placeholder.com/150'
    },
    {
        id: '3',
        name: 'Gartner SNACKS-GULROT',
        calories: 45,
        protein: 1,
        fat: 0,
        carbs: 10,
        price: 20.99,
        labels: ['Healthy', 'Vegan'],
        imageUrl: 'https://placeholder.com/150'
    }
];

// Reusable Product Card Component
interface ProductCardProps {
    product: Product;
    onRemove?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onRemove }) => {
    return (
        <View style={styles.productCard}>
            {/* Image placeholder - would be replaced with actual Image component */}
            <View style={styles.productImage}>
                <Text style={styles.imageText}>Product Image</Text>
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>

                {/* Nutritional info with SVG icons */}
                <View style={styles.nutritionInfo}>
                    {product.calories !== undefined && (
                        <View style={styles.infoItem}>
                            <Calories width={50} height={50} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.calories} kcal</Text>
                        </View>
                    )}

                    {product.protein !== undefined && (
                        <View style={styles.infoItem}>
                            <Protein width={32} height={32} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.protein}g</Text>
                        </View>
                    )}

                    {product.fat !== undefined && (
                        <View style={styles.infoItem}>
                            <Fat width={30} height={30}  style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.fat}g</Text>
                        </View>
                    )}

                    {product.carbs !== undefined && (
                        <View style={styles.infoItem}>
                            <Carb width={17} height={17} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.carbs}g</Text>
                        </View>
                    )}
                </View>

                {/* Product labels (healthy, vegan, etc.) */}
                <View style={styles.labelsContainer}>
                    {product.labels.map((label: string, index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.labelBadge,
                                getLabelStyle(label)
                            ]}
                        >
                            <Text style={styles.labelText}>{label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Price and remove button */}
            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{product.price.toFixed(2)} kr</Text>
                <TouchableOpacity onPress={() => onRemove && onRemove(product.id)} style={styles.removeButton}>
                    {/* Using a text X instead of Ionicon */}
                    <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Helper function to get style for different label types
const getLabelStyle = (label: string): object => {
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

    // Default label style
    return {};
};

export default function ShoppingCart() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [products, setProducts] = useState<Product[]>(sampleProducts);

    // Calculate total price
    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

    // Remove product function
    const removeProduct = (id: string): void => {
        setProducts(products.filter(product => product.id !== id));
    };

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
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Product list */}
            <ScrollView style={styles.productList}>
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
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
                    </View>
                )}
            </ScrollView>

            {/* Total sum */}
            {products.length > 0 && (
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
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-SemiBold',
        marginTop: 40,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginBottom: 20,
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
    productList: {
        flex: 1,
    },
    // Product Card Styles
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    productImage: {
        width: 70,
        height: 70,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    imageText: {
        fontSize: 10,
        color: '#999',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 4,
    },
    nutritionInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 2,
    },
    iconStyle: {
        width: 16,
        height: 16,
        marginRight: 2,
    },
    infoText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
        marginLeft: 2,
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    labelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 5,
        marginBottom: 2,
    },
    // Label styles
    unhealthyLabel: {
        backgroundColor: '#FFCDD2', // Light red
    },
    highSugarLabel: {
        backgroundColor: '#FFECB3', // Light amber
    },
    ultraprocessed: {
        backgroundColor: '#d57c84',
    },
    highCalorieLabel: {
        backgroundColor: '#FFD180', // Light orange
    },
    healthyLabel: {
        backgroundColor: '#C8E6C9', // Light green
    },
    veganLabel: {
        backgroundColor: '#DCEDC8', // Light lime
    },
    glutenFreeLabel: {
        backgroundColor: '#E1BEE7', // Light purple
    },
    lowCalorieLabel: {
        backgroundColor: '#B3E5FC', // Light blue
    },
    noCarbs: {
        backgroundColor: '#F5F5F5', // Light grey
    },
    labelText: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
    },
    priceContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 15,
    },
    removeButton: {
        padding: 3,
    },
    removeButtonText: {
        fontSize: 22,
        color: '#999',
    },
    addMoreText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
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
    },
    totalContainer: {
        bottom:40,
        alignItems: "flex-end",
        paddingVertical: 15,
    },
    totalPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    totalText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
});