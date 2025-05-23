import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignUp from '../SignUp'; // adjust path
import { supabase } from '@/lib/supabase';

// Mock router from expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
        },
    },
}));

// Mock SVG components used in SignUp
jest.mock('../../assets/icons/matvelgeren_logo.svg', () => 'Logo');
jest.mock('../../assets/icons/open_eye.svg', () => 'Eye');
jest.mock('../../assets/icons/closed_eye.svg', () => 'Closed_Eye');

describe('SignUp component', () => {
    const mockedReplace = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Override useRouter mock to return the fresh mockedReplace each test
    jest.mock('expo-router', () => ({
        useRouter: () => ({
            replace: mockedReplace,
        }),
    }));

    it('renders all input fields and buttons correctly', () => {
        const { getByPlaceholderText, getByText } = render(<SignUp />);

        expect(getByPlaceholderText('Ola')).toBeTruthy();
        expect(getByPlaceholderText('Normann')).toBeTruthy();
        expect(getByPlaceholderText('username@example.com')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();

        expect(getByText('Sign Up')).toBeTruthy();
    });


    it('shows alert if fields are empty on sign up press', () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const { getByText } = render(<SignUp />);

        fireEvent.press(getByText('Sign Up'));
        expect(alertSpy).toHaveBeenCalledWith('Please fill out all fields.');
    });

    it('shows alert if passwords do not match', () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const { getByText, getByPlaceholderText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('Ola'), 'John');
        fireEvent.changeText(getByPlaceholderText('Normann'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('username@example.com'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'differentPassword');

        fireEvent.press(getByText('Sign Up'));

        expect(alertSpy).toHaveBeenCalledWith('Passwords do not match');
    });
});
