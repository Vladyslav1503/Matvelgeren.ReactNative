import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RecipeCard from '../RecipeCard';

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

import { router } from 'expo-router';

const mockRecipe = {
    id: '123',
    name: 'Test Recipe',
    calories: 500,
    protein: 25,
    fat: 10,
    carbs: 50,
    cookingTime: 30,
    servings: 2,
    calories_per_serving: 250,
    labels: ['Vegan', 'Low Carb'],
    imageUrl: 'https://example.com/image.jpg',
};

describe('RecipeCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders recipe info correctly', () => {
        const { getByText, getAllByText } = render(<RecipeCard recipe={mockRecipe} />);

        // Recipe name
        expect(getByText('Test Recipe')).toBeTruthy();

        // Labels
        expect(getByText('Vegan')).toBeTruthy();
        expect(getByText('Low Carb')).toBeTruthy();

        // Nutrition info (calories per serving, protein, fat, carbs)
        expect(getByText(`${mockRecipe.calories_per_serving} kcal`)).toBeTruthy();
        expect(getByText(`${mockRecipe.protein}g`)).toBeTruthy();
        expect(getByText(`${mockRecipe.fat}g`)).toBeTruthy();
        expect(getByText(`${mockRecipe.carbs}g`)).toBeTruthy();

        // Cooking time and servings text
        expect(getByText(`${mockRecipe.cookingTime} kcal`)).toBeTruthy();
        expect(getByText(`${mockRecipe.servings} servings`)).toBeTruthy();
    });

    it('navigates to recipe page on press', () => {
        const { getByTestId } = render(<RecipeCard recipe={mockRecipe} />);

        // TouchableOpacity doesn't have accessibilityLabel or testID by default,
        // so we add testID in the component or select by role or text container.
        // Here we use the top-level TouchableOpacity with accessibilityRole "button"
        // But since it's not defined, let's add testID in component:
        // <TouchableOpacity testID="recipe-card" ... >

        // Let's assume testID="recipe-card" was added to TouchableOpacity in your component.

        const card = getByTestId('recipe-card');
        fireEvent.press(card);

        expect(router.push).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith(`/(tabs)/recipe?id=${mockRecipe.id}`);
    });
});
