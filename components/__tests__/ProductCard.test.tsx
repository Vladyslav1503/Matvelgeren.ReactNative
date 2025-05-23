import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../ProductCard';
import { navigateToProduct } from '@/utils/navigationHelper';

jest.mock('@/utils/navigationHelper', () => ({
    navigateToProduct: jest.fn(),
}));

const mockProduct = {
    id: '123',
    name: 'Test Product',
    calories: 150,
    protein: 10,
    fat: 5,
    carbs: 20,
    sugar: 8,
    price: 29.99,
    labels: ['Vegan', 'Healthy'],
    imageUrl: 'https://example.com/image.png',
};

describe('ProductCard', () => {
    it('renders product name, image, and price correctly', () => {
        const { getByText } = render(
            <ProductCard product={mockProduct} ean="123" />
        );

        expect(getByText('Test Product')).toBeTruthy();
        expect(getByText('29.99 kr')).toBeTruthy();
        const { getByTestId } = render(<ProductCard product={mockProduct} ean="123" />);
        expect(getByTestId('product-image')).toBeTruthy();
    });

    it('renders nutritional info if provided', () => {
        const { getByText } = render(
            <ProductCard product={mockProduct} ean="1234567890123" />
        );

        expect(getByText('150 kcal')).toBeTruthy();
        expect(getByText('10')).toBeTruthy(); // protein
        expect(getByText('5')).toBeTruthy(); // fat
        expect(getByText('20')).toBeTruthy(); // carbs
    });

    it('renders all product labels correctly', () => {
        const { getByText } = render(
            <ProductCard product={mockProduct} ean="1234567890123" />
        );

        expect(getByText('Vegan')).toBeTruthy();
        expect(getByText('Healthy')).toBeTruthy();
    });

    it('triggers navigateToProduct on card press', () => {
        const { getByTestId } = render(
            <ProductCard product={mockProduct} ean="1234567890123" />
        );

        fireEvent.press(getByTestId('ProductCardTouchable'));

        expect(navigateToProduct).toHaveBeenCalledWith({
            ean: '1234567890123',
        });
    });

    it('calls onRemove when remove button is pressed', () => {
        const onRemoveMock = jest.fn();
        const { getByTestId } = render(
            <ProductCard product={mockProduct} ean="123" onRemove={onRemoveMock} />
        );

        const removeButton = getByTestId('remove-button');

        fireEvent.press(removeButton, {
            stopPropagation: jest.fn(),  // Optional: mock stopPropagation if needed
        });

        expect(onRemoveMock).toHaveBeenCalledWith(mockProduct.id);
    });

    it('does not render remove button if showRemoveButton is false', () => {
        const { queryByText } = render(
            <ProductCard
                product={mockProduct}
                ean="1234567890123"
                showRemoveButton={false}
            />
        );

        expect(queryByText('✕')).toBeNull();
    });
});
