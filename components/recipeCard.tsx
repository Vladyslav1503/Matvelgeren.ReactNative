import React from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform
} from "react-native";
import { router } from 'expo-router';

import Fat from '../assets/icons/fat.svg';
import Calories from '../assets/icons/calories.svg';
import Protein from '../assets/icons/protein.svg';
import Carb from '../assets/icons/carb.svg';

// Define types for our data
interface Recipe {
    id: string;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    cookingTime: number;
    servings: number;
    calories_per_serving: number;
    labels: string[];
    imageUrl: string;
}

// Recipe Card
interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const handleCardPress = () => {
        // Navigate to recipe page with recipe ID
        router.push(`/(tabs)/recipe?id=${recipe.id}`);
    };

    return (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={handleCardPress}
            activeOpacity={0.9}
        >
            {/* Recipe Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                />
            </View>

            {/* Recipe Info Container */}
            <View style={styles.infoContainer}>
                {/* Recipe Title */}
                <Text style={styles.recipeName} numberOfLines={1}>
                    {recipe.name}
                </Text>

                {/* Recipe Labels */}
                <View style={styles.labelsContainer}>
                    {recipe.labels.map((label: string, index: number) => (
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

                {/* Nutritional info with SVG icons */}
                <View style={styles.nutritionInfo}>
                    <View style={styles.infoItem}>
                        <Calories width={14} height={14} style={styles.iconStyle} />
                        <Text style={styles.infoText}>{recipe.calories_per_serving} kcal</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Protein width={16} height={16} style={styles.iconStyle} />
                        <Text style={styles.infoText}>{recipe.protein}g</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Fat width={16} height={16} style={styles.iconStyle} />
                        <Text style={styles.infoText}>{recipe.fat}g</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Carb width={17} height={17} style={styles.iconStyle} />
                        <Text style={styles.infoText}>{recipe.carbs}g</Text>
                    </View>
                </View>

                {/* Cooking time and servings */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>
                        {recipe.cookingTime} kcal
                    </Text>
                    <Text style={styles.detailDot}>•</Text>
                    <Text style={styles.detailText}>
                        {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Helper function to get style for different label types
const getLabelStyle = (label: string): object => {
    const labelLower = label.toLowerCase();

    if (labelLower === 'vegan') return styles.veganLabel;
    if (labelLower === 'vegetarian') return styles.vegetarianLabel;
    if (labelLower === 'healthy') return styles.healthyLabel;
    if (labelLower === 'high protein') return styles.highProteinLabel;
    if (labelLower === 'low carb') return styles.lowCarbLabel;
    if (labelLower === 'gluten free') return styles.glutenFreeLabel;
    if (labelLower === 'high fiber') return styles.highFiber;
    if (labelLower === 'nuts') return styles.nutsLabel;
    if (labelLower === 'high sugar') return styles.highSugarLabel;

    // Default label style
    return {};
};

const styles = StyleSheet.create({
    recipeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden', // image wont overflow the corners
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
        }),
    },
    imageContainer: {
        height: 180,
        width: '100%',
    },
    recipeImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    infoContainer: {
        padding: 12,
    },
    recipeName: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 6,
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    labelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 5,
        marginBottom: 4,
    },
    // Label styles
    veganLabel: {
        backgroundColor: '#DCEDC8',
    },
    vegetarianLabel: {
        backgroundColor: '#C8E6C9',
    },
    healthyLabel: {
        backgroundColor: '#C8E6C9',
    },
    highProteinLabel: {
        backgroundColor: '#BBDEFB',
    },
    lowCarbLabel: {
        backgroundColor: '#F5F5F5',
    },
    glutenFreeLabel: {
        backgroundColor: '#E1BEE7',
    },
    highFiber: {
        backgroundColor: '#D7CCC8',
    },
    nutsLabel: {
        backgroundColor: '#FFE0B2',
    },
    highSugarLabel: {
        backgroundColor: '#FFCCBC',
    },
    labelText: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
    },
    nutritionInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 4,
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
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    detailDot: {
        fontSize: 12,
        color: '#666',
        marginHorizontal: 4,
    },
});