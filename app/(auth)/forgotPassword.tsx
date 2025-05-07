import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import Logo from '../../assets/icons/matvelgeren_logo.svg';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleSendResetCode = async () => {
        if (!email) return Alert.alert('Please enter your email address');

        try {
            // Mock API call – replace with real endpoint
            // await api.sendResetCode(email);

            Alert.alert('Success', 'If this email exists, a new password has been sent.');
            router.replace('/'); // Optionally return to login
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Logo style={styles.logo} />
            <Text style={styles.matvelgeren}>MatVelgeren</Text>
            <Text style={styles.title}>Forgotten your Password?</Text>
            <Text style={styles.subtitle}>
                Enter your registered email. We will send you a code you can use as your new password.
            </Text>

            <TextInput
                placeholder="Email address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleSendResetCode}>
                <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    matvelgeren: {
        color: "#205446",
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        alignSelf: 'center'
    },
    logo: {
        alignSelf: 'center'
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 13,
        color: '#838383',
        fontFamily: 'Inter-Regular',
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: '#838383',
        borderRadius: 5,
        padding: 12,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#205446',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Inter-SemiBold',
        fontSize: 15
    }
});
