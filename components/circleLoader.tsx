import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const CircleLoader = () => {
    const spinValue = new Animated.Value(0);

    Animated.loop(
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }),
    ).start();

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.circle, { transform: [{ rotate: spin }] }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#D9D9D9',
        borderTopColor: '#5DB075', // Accent green (same as Healthy tag)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});

export default CircleLoader;
