import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Button } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.8;
const LINE_HEIGHT = 2;

export default function BarcodeScanner() {
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [isFocused, setIsFocused] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (permission?.granted) {
            startLineAnimation();
        }
    }, [permission]);

    useFocusEffect(
        React.useCallback(() => {
            setIsFocused(true);
            return () => {
                setIsFocused(false);
            };
        }, [])
    );

    const startLineAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: FRAME_SIZE - LINE_HEIGHT,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
        if (!scanned) {
            setScanned(true);
            console.log('Scanned code:', data);
            setTimeout(() => setScanned(false), 3000);
        }
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Text>We need your permission to show the camera</Text>
                    <Button title="Grant permission" onPress={requestPermission} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
            {(isFocused &&
                <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                >
                    <View style={styles.overlay}>
                        <View style={styles.fade} />
                        <View style={styles.middleRow}>
                            <View style={styles.fade} />
                            <View style={styles.focusBox}>
                                <Animated.View
                                    style={[
                                        styles.scanLine,
                                        {
                                            transform: [{ translateY: animation }],
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.fade} />
                        </View>
                        <View style={styles.fade} />
                    </View>
                </CameraView>
            )}
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    fade: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleRow: {
        flexDirection: 'row',
        flex: 1,
    },
    focusBox: {
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        borderColor: '#00FF00',
        borderWidth: 2,
        overflow: 'hidden',
    },
    scanLine: {
        height: LINE_HEIGHT,
        width: '100%',
        backgroundColor: '#00FF00', // solid color for now
        position: 'absolute',
    },
});
