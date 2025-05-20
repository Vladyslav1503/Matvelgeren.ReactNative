import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView, Platform
} from "react-native";

import Fat from '../assets/icons/fat.svg';
import Calories from '../assets/icons/calories.svg';
import Protein from '../assets/icons/protein.svg';
import Carb from '../assets/icons/carb.svg';
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

// Reusable Product Card Component
interface ProductCardProps {
    product: Product;
    onRemove?: (id: string) => void;
}

export default function ProductCard({ product, onRemove }: ProductCardProps)  {
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
                            <Calories width={14} height={14} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.calories} kcal</Text>
                        </View>
                    )}

                    {product.protein !== undefined && (
                        <View style={styles.infoItem}>
                            <Protein width={16} height={16} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.protein}</Text>
                        </View>
                    )}

                    {product.fat !== undefined && (
                        <View style={styles.infoItem}>
                            <Fat width={16} height={16}  style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.fat}</Text>
                        </View>
                    )}

                    {product.carbs !== undefined && (
                        <View style={styles.infoItem}>
                            <Carb width={17} height={17} style={styles.iconStyle} />
                            <Text style={styles.infoText}>{product.carbs}</Text>
                        </View>
                    )}
                </View>

                {/* Product labels (healthy, vegan, etc.) */}
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.labelsContainer}>
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
                </ScrollView>
            </View>

            {/* Price and remove button */}
            <View style={styles.priceContainer}>
                <TouchableOpacity onPress={() => onRemove && onRemove(product.id)} style={styles.removeButton}>
                    {/* Using a text X instead of Ionicon */}
                    <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.priceText}>{product.price.toFixed(2)} kr</Text>
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

const styles = StyleSheet.create({
    // Product Card Styles
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#B6B6B6',
        paddingTop: 12,
        paddingLeft: 12,
        paddingRight: 8,
        paddingBottom: 8,
        marginBottom: 18,
        ...Platform.select({
            android: {
                boxShadow: '0 -6px 8px rgba(0, 0, 0, 0.06)',
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -6 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
        }),
    },
    productImage: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 12,
    },
    imageText: {
        fontSize: 10,
        color: '#999',
    },
    productInfo: {
        flex: 1,
        alignSelf: 'center',
        width: '100%',
    },
    productName: {
        fontSize: 12,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 8,
    },
    nutritionInfo: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
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
        overflow: 'visible',
    },
    priceText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        marginBottom: 0,
    },
    removeButton: {
        paddingRight: 2,
    },
    removeButtonText: {
        marginTop: -5,
        fontSize: 20,
        color: '#999',
    },
});