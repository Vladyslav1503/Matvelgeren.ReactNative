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
import { router, useLocalSearchParams } from 'expo-router';

import Fat from '../../assets/icons/fat.svg';
import Calories from '../../assets/icons/calories.svg';
import Protein from '../../assets/icons/protein.svg';
import Carb from '../../assets/icons/carb.svg';
import BackArrow from '../../assets/icons/backarrow.svg';


const { width } = Dimensions.get('window');

// recipe interface
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
    ingredients: string[];
    instructions: string[];
}

// Mock recipe data - In a real app, this would come from your API
const mockRecipes: Record<string, Recipe> = {
    '1': {
        id: '1',
        name: 'Avocado Toast',
        calories: 450,
        protein: 8,
        fat: 20,
        carbs: 45,
        cookingTime: 5,
        servings: 1,
        calories_per_serving: 450,
        labels: ['Vegetarian', 'High Fiber'],
        imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ingredients: [
            '2 slices whole grain bread',
            '1 ripe avocado',
            '1 tsp lemon juice',
            'Salt and pepper to taste',
            '1 tsp olive oil',
            'Red pepper flakes (optional)',
            'Hemp seeds (optional)'
        ],
        instructions: [
            'Toast the bread slices until golden brown.',
            'Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.',
            'Mash the avocado with lemon juice, salt, and pepper until desired consistency.',
            'Spread the avocado mixture evenly on the toast.',
            'Drizzle with olive oil and sprinkle with red pepper flakes and hemp seeds if desired.',
            'Serve immediately and enjoy!'
        ]
    },
    '2': {
        id: '2',
        name: 'Chocolate Milkshake',
        calories: 380,
        protein: 6,
        fat: 12,
        carbs: 60,
        cookingTime: 5,
        servings: 1,
        calories_per_serving: 380,
        labels: ['High Sugar', 'Unhealthy'],
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ingredients: [
            '2 cups vanilla ice cream',
            '1/2 cup whole milk',
            '3 tbsp chocolate syrup',
            '1 tbsp co-coa powder',
            'Whipped cream for topping',
            'Chocolate shavings for garnish'
        ],
        instructions: [
            'Add ice cream, milk, chocolate syrup, and cocoa powder to a blender.',
            'Blend on high speed until smooth and creamy.',
            'Pour into a talll glass.',
            'Top with whipped cream and chocolate shavings.',
            'Serve immediately with a straw.'
        ]
    },
    '3': {
        id: '3',
        name: 'Steak, Egg, Tomato',
        calories: 520,
        protein: 35,
        fat: 28,
        carbs: 8,
        cookingTime: 20,
        servings: 1,
        calories_per_serving: 520,
        labels: ['High Protein', 'Healthy'],
        imageUrl: 'https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ingredients: [
            '6 oz sirloin steak',
            '2 large eggs',
            '2 medium tomatoes, sliced',
            '1 tbsp olive oil',
            'Salt and pepper to taste',
            '1 tsp garlic powder',
            'Fresh herbs for garnish'
        ],
        instructions: [
            'Season the steak with salt, pepper, and garlic powder.',
            'Heat olive oil in a large skillet over medium-high heat.',
            'Cook the steak for 4-5 minutes per side for medium-rare.',
            'Remove steak and let it rest for 5 minutes.',
            'In the same pan, fry the eggs to your desired doneness.',
            'Season tomato slices with salt and pepper.',
            'Slice the steak and serve with eggs and tomatoes.',
            'Garnish with fresh herbs and serve immediately.'
        ]
    }
};

// Helper function to get label styles
const getLabelStyle = (label: string) => {
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
    if (labelLower === 'unhealthy') return styles.unhealthyLabel;

    return {};
};

export default function Recipe() {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    // Getecipe ID from URL
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        // Load recipe from ID
        if (id) {
            // In real app, would fetch from API
            const foundRecipe = mockRecipes[id];
            if (foundRecipe) {
                setRecipe(foundRecipe);
            }
        }
        setLoading(false);
    }, [id]);

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.errorText}>Recipe not found</Text>
                <TouchableOpacity style={styles.errorBackButton} onPress={handleGoBack}>
                    <Text style={styles.errorBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Full Screen Image Section */}
                <View style={styles.imageSection}>
                    <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />

                    {/* Header overlay */}
                    <View style={styles.headerOverlay}>
                        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                            <BackArrow width={20} height={20} stroke="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content Card */}
                <View style={styles.mainCard}>
                    {/* Recipe Info Card */}
                    <View style={styles.recipeInfoCard}>
                        <Text style={styles.recipeName} numberOfLines={3}>
                            {recipe.name}
                        </Text>

                        {/* Nutritional info with SVG icons */}
                        <View style={styles.nutritionInfo}>
                            <View style={styles.infoItem}>
                                <Calories width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.infoText}>{recipe.calories_per_serving} kcal</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Protein width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.infoText}>{recipe.protein}g</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Carb width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.infoText}>{recipe.carbs}g</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Fat width={16} height={16} style={styles.nutritionIcon} />
                                <Text style={styles.infoText}>{recipe.fat}g</Text>
                            </View>
                        </View>

                        {/* Recipe details */}
                        <View style={styles.recipeDetails}>
                            <Text style={styles.detailText}>
                                ⏱ {recipe.cookingTime} min
                            </Text>
                            <Text style={styles.detailDot}>•</Text>
                            <Text style={styles.detailText}>
                                🍽 {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                            </Text>
                        </View>

                        {/* Labels */}
                        <View style={styles.labelsContainer}>
                            {recipe.labels.map((label, index) => (
                                <View key={index} style={[styles.labelBadge, getLabelStyle(label)]}>
                                    <Text style={styles.labelText}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Ingredients Card */}
                    <View style={styles.ingredientsCard}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        {recipe.ingredients.map((ingredient, index) => (
                            <View key={index} style={styles.ingredientItem}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.ingredientText}>{ingredient}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Instructions Card */}
                    <View style={styles.instructionsCard}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        {recipe.instructions.map((instruction, index) => (
                            <View key={index} style={styles.instructionItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.instructionText}>{instruction}</Text>
                            </View>
                        ))}
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
    imageSection: {
        height: width,
        position: 'relative',
    },
    recipeImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
    },

    mainCard: {
        backgroundColor: '#fff',
        marginTop: -20,
        marginHorizontal: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
        ...Platform.select({
            android: {
                elevation: 4,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
        }),
    },
    recipeInfoCard: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    recipeName: {
        fontSize: 24,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginBottom: 12,
        lineHeight: 28,
    },
    nutritionInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 6,
    },
    nutritionIcon: {
        marginRight: 4,
    },
    infoText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    recipeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    detailDot: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 8,
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
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
        marginBottom: 16,
    },
    ingredientsCard: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 16,
        color: '#3498db',
        marginRight: 8,
        marginTop: 2,
    },
    ingredientText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
        lineHeight: 20,
    },
    instructionsCard: {
        padding: 20,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 12,
        fontFamily: 'Inter-SemiBold',
        color: '#fff',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 40,
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
    unhealthyLabel: {
        backgroundColor: '#FFCDD2',
    },
});