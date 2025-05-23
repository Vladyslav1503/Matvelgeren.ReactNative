import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../SignIn';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            getSession: jest.fn(),
        },
    },
}));

jest.mock('expo-auth-session/providers/google', () => ({
    useAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock('expo-web-browser', () => ({
    maybeCompleteAuthSession: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SignIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all the main UI elements correctly', () => {
        const { getByPlaceholderText, getByText } = render(<SignIn />);

        expect(getByText('Matvelgeren')).toBeTruthy();
        expect(getByText('Sign In to your Account')).toBeTruthy();
        expect(getByPlaceholderText('username@example.com')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText('Forgot your password?')).toBeTruthy();
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Or')).toBeTruthy();
        expect(getByText('Continue with Google')).toBeTruthy();
        expect(getByText("Dont have an account?")).toBeTruthy();
        expect(getByText('Sign up')).toBeTruthy();
    });

    it('toggles password visibility when eye icon is pressed', () => {
        const { getByPlaceholderText, getByRole } = render(<SignIn />);

        const passwordInput = getByPlaceholderText('Password');
        // Initially secureTextEntry should be true
        expect(passwordInput.props.secureTextEntry).toBe(true);

        const eyeButton = getByRole('button', { hidden: true }); // TouchableOpacity around eye icon

        fireEvent.press(eyeButton);

        // After press, secureTextEntry should be false
        expect(passwordInput.props.secureTextEntry).toBe(false);

        fireEvent.press(eyeButton);

        // Toggles back
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('shows alert if email or password is missing when signing in', async () => {
        const { getByText } = render(<SignIn />);

        const signInButton = getByText('Sign In');

        fireEvent.press(signInButton);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Missing Fields',
            'Please enter both email and password.'
        );
    });

    it('shows alert on login failure', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            error: { message: 'Invalid credentials' },
            data: null,
        });

        const { getByText, getByPlaceholderText } = render(<SignIn />);

        fireEvent.changeText(getByPlaceholderText('username@example.com'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');

        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
        });
    });

    it('shows alert if no session is returned after login', async () => {
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            error: null,
            data: { user: { id: 'abc' } },
        });

        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null },
        });

        const { getByText, getByPlaceholderText } = render(<SignIn />);

        fireEvent.changeText(getByPlaceholderText('username@example.com'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'No session returned after login');
        });
    });
});
