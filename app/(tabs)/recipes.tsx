import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    SafeAreaView
} from "react-native";

import SearchIcon from '../../assets/icons/search.svg';
import RecipeCard from '../../components/recipeCard';

// Define types for recipe data
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

// Sample recipe data
const sampleRecipes: Recipe[] = [

    {
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
        imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '2',
        name: 'Chocolate Milkshake',
        calories: 3800,
        protein: 6,
        fat: 120,
        carbs: 600,
        cookingTime: 5,
        servings: 1,
        calories_per_serving: 380,
        labels: ['Sugar', 'unhealthy'],
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
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
        imageUrl: 'https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?q=80&w=2018&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '4',
        name: 'Mediterranean Bowl',
        calories: 420,
        protein: 14,
        fat: 18,
        carbs: 55,
        cookingTime: 25,
        servings: 2,
        calories_per_serving: 210,
        labels: ['Vegan', 'High Fiber', 'Gluten Free'],
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '5',
        name: 'Salad',
        calories: 320,
        protein: 8,
        fat: 25,
        carbs: 18,
        cookingTime: 10,
        servings: 2,
        calories_per_serving: 160,
        labels: ['Vegetarian', 'Healthy'],
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '6',
        name: 'Chicken Fried Rice',
        calories: 480,
        protein: 32,
        fat: 16,
        carbs: 40,
        cookingTime: 15,
        servings: 2,
        calories_per_serving: 240,
        labels: ['High Protein', 'Low Carb'],
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '7',
        name: 'Hamburger',
        calories: 650,
        protein: 35,
        fat: 20,
        carbs: 50,
        cookingTime: 5,
        servings: 1,
        calories_per_serving: 650,
        labels: ['Cholesterol'],
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '8',
        name: 'Tomato Soup',
        calories: 280,
        protein: 18,
        fat: 4,
        carbs: 45,
        cookingTime: 35,
        servings: 4,
        calories_per_serving: 70,
        labels: ['Vegan', 'High Protein', 'High Fiber'],
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '9',
        name: 'Caprese Sandwich',
        calories: 390,
        protein: 16,
        fat: 22,
        carbs: 35,
        cookingTime: 8,
        servings: 1,
        calories_per_serving: 390,
        labels: ['Vegetarian'],
        imageUrl: 'https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: '10',
        name: 'Prison Food',
        calories: 460,
        protein: 28,
        fat: 18,
        carbs: 38,
        cookingTime: 15,
        servings: 1,
        calories_per_serving: 460,
        labels: ['High Protein', 'Healthy'],
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
];

export default function Recipes() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);

    // Filter recipes based on search query
    const filteredRecipes = searchQuery.trim() === ''
        ? recipes
        : recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <SafeAreaView style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Recipes</Text>

            {/* Search Bar with SVG icon */}
            <View style={styles.searchContainer}>
                <SearchIcon width={20} height={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Find recipes"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* What's hot section */}
            <Text style={styles.sectionTitle}>The good stuff!</Text>

            {/* Recipe list */}
            <ScrollView
                style={styles.recipeList}
                showsVerticalScrollIndicator={false}
            >
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))
                ) : (
                    <View style={styles.emptyResultsContainer}>
                        <Text style={styles.emptyResultsText}>
                            No recipes found. Try a different search.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter-SemiBold',
        marginTop: 8,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 12,
        color: '#333',
    },
    recipeList: {
        flex: 1,
    },
    emptyResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyResultsText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});