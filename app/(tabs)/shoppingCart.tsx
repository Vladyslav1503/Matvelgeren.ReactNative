import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform, Dimensions
} from "react-native";

import SearchIcon from '../../assets/icons/search.svg';
import  ProductCard  from '../../components/ProductCard'

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
// Reusable Product Card Component
interface ProductCardProps {
    product: Product;
    onRemove?: (id: string) => void;
}

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
        paddingTop: 28,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 20,
        backgroundColor: '#fff',
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
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            }
        }),
        elevation: 1,
    },
    totalText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
});