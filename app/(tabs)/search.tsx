import React, { useState, useMemo } from "react";
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
import ProductCard from '../../components/ProductCard';
import RecipeCard from '../../components/recipeCard';

// Product interface
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
    type: 'product';
}

// Recipe interface
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
    type: 'recipe';
}

type SearchItem = Product | Recipe;

const sampleRecipes: Recipe[] = [
    {
        id: 'r1',
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
        type: 'recipe'
    },
    {
        id: 'r2',
        name: 'Chocolate Milkshake',
        calories: 3800,
        protein: 6,
        fat: 120,
        carbs: 600,
        cookingTime: 5,
        servings: 1,
        calories_per_serving: 380,
        labels: ['Sugar', 'Unhealthy'],
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: 'recipe'
    },
    {
        id: 'r3',
        name: 'Mediterranean Bowl',
        calories: 420,
        protein: 14,
        fat: 18,
        carbs: 55,
        cookingTime: 25,
        servings: 2,
        calories_per_serving: 210,
        labels: ['Vegan', 'High Fiber', 'Gluten Free'],
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: 'recipe'
    },
    {
        id: 'r4',
        name: 'Salad',
        calories: 320,
        protein: 8,
        fat: 25,
        carbs: 18,
        cookingTime: 10,
        servings: 2,
        calories_per_serving: 160,
        labels: ['Vegetarian', 'Healthy'],
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: 'recipe'
    }
];

// Combine all data
const allItems: SearchItem[] = [ ...sampleRecipes];

// Get all unique labels for filtering
const getAllLabels = (items: SearchItem[]): string[] => {
    const labelSet = new Set<string>();
    items.forEach(item => {
        item.labels.forEach(label => labelSet.add(label));
    });
    return Array.from(labelSet).sort();
};

export default function Search() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'recipes' | 'products'>('all');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const allLabels = useMemo(() => getAllLabels(allItems), []);

    // Check if any filters are active
    const hasActiveFilters = searchQuery.trim() !== '' || selectedFilter !== 'all' || selectedLabels.length > 0;

    // Filter items based on search query, type filter, and label filters
    const filteredItems = useMemo(() => {
        // If no filters are active, return empty array
        if (!hasActiveFilters) {
            return [];
        }

        let filtered = allItems;

        // Filter by search query
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.labels.some(label =>
                    label.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Filter by type
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(item =>
                selectedFilter === 'recipes' ? item.type === 'recipe' : item.type === 'product'
            );
        }

        // Filter by labels
        if (selectedLabels.length > 0) {
            filtered = filtered.filter(item =>
                selectedLabels.some(selectedLabel =>
                    item.labels.includes(selectedLabel)
                )
            );
        }

        return filtered;
    }, [searchQuery, selectedFilter, selectedLabels, hasActiveFilters]);

    // Group filtered items by type for display
    const recipes = filteredItems.filter(item => item.type === 'recipe') as Recipe[];
    const products = filteredItems.filter(item => item.type === 'product') as Product[];

    const toggleLabel = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const removeProduct = (id: string) => {
        // This would connect to our cart management logic
        console.log('Remove product:', id);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Search</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchIcon width={20} height={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search product or recipe"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Type Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                        onPress={() => setSelectedFilter('all')}
                    >
                        <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedFilter === 'recipes' && styles.filterButtonActive]}
                        onPress={() => setSelectedFilter('recipes')}
                    >
                        <Text style={[styles.filterButtonText, selectedFilter === 'recipes' && styles.filterButtonTextActive]}>
                            Recipes
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedFilter === 'products' && styles.filterButtonActive]}
                        onPress={() => setSelectedFilter('products')}
                    >
                        <Text style={[styles.filterButtonText, selectedFilter === 'products' && styles.filterButtonTextActive]}>
                            Products
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Label Filters */}
            {allLabels.length > 0 && (
                <View style={styles.labelFilterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {allLabels.map(label => (
                            <TouchableOpacity
                                key={label}
                                style={[
                                    styles.labelButton,
                                    selectedLabels.includes(label) && styles.labelButtonActive
                                ]}
                                onPress={() => toggleLabel(label)}
                            >
                                <Text style={[
                                    styles.labelButtonText,
                                    selectedLabels.includes(label) && styles.labelButtonTextActive
                                ]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Results */}
            <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
                {!hasActiveFilters ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Start searching or apply filters to see recipes and products
                        </Text>
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No results found. Try adjusting your search or filters.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Recipes Section */}
                        {recipes.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>
                                    Recipes ({recipes.length})
                                </Text>
                                {recipes.map(recipe => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </View>
                        )}

                        {/* Products Section */}
                        {products.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>
                                    Products ({products.length})
                                </Text>
                                {products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        ean={product.ean}
                                        onRemove={removeProduct}
                                    />
                                ))}
                            </View>
                        )}
                    </>
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
        marginBottom: 16,
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
    filterContainer: {
        marginBottom: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#318fea',
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    labelFilterContainer: {
        marginBottom: 16,
    },
    labelButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 8,
    },
    labelButtonActive: {
        backgroundColor: '#e3f2fd',
        borderColor: '#318fea',
    },
    labelButtonText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    labelButtonTextActive: {
        color: '#318fea',
        fontFamily: 'Inter-Medium',
    },
    resultsList: {
        flex: 1,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 12,
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: 22,
    },
});