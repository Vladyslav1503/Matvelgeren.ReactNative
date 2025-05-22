import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Button } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../../components/ProductCard';
import { fetchProductByEAN } from '@/api/kassalappAPI';
import { mapApiResponseToProductCard } from '@/utils/nutritionParser';
import Svg, { Defs, Rect, Mask } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.7;
const BORDER_RADIUS = 20;
const LINE_HEIGHT = 2;

interface ApiResponse {
    data: {
        ean: string;
        products: any[];
        nutrition: any[];
    };
}

export default function BarcodeScanner() {
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [isFocused, setIsFocused] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const centerX = (width - FRAME_SIZE) / 2;
    const centerY = (height - FRAME_SIZE) / 2;

    // Simple function to start the animation
    const startAnimation = () => {
        // Reset to initial position
        animation.setValue(0);
        
        // Create and start the animation sequence
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

    // Start animation when the component mounts and permissions are granted
    useEffect(() => {
        if (permission?.granted && isFocused && !scannedProduct && !isLoading) {
            startAnimation();
        }
    }, [permission, isFocused, scannedProduct, isLoading]);

    // Handle screen focus changes
    useFocusEffect(
        React.useCallback(() => {
            setIsFocused(true);
            if (permission?.granted && !scannedProduct && !isLoading) {
                startAnimation();
            }
            
            return () => {
                setIsFocused(false);
            };
        }, [permission, scannedProduct, isLoading])
    );

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        console.log('trigger:', data);
        if (!scanned) {
            setScanned(true);
            setIsLoading(true);
            
            console.log('Scanned code:', data);
            try {
                const response: ApiResponse = await fetchProductByEAN(data);
                const productData = mapApiResponseToProductCard(response);

                if (!productData || !productData.id) {
                    alert("Product not found.");
                    setScanned(false); // allow retry immediately
                    setIsLoading(false);
                    return;
                }
                console.log("Product:", productData);
                setScannedProduct(productData);
            } catch (error) {
                console.log("Error:", error);
                alert("Could not fetch product information.");
                setIsLoading(false);
                setScanned(false);
            } finally {
                setIsLoading(false);
                setTimeout(() => setScanned(false), 3000);
            }
        }
    };

    // Function to handle removing the scanned product
    const handleRemoveProduct = () => {
        setScannedProduct(null);
        // The animation will restart automatically due to the dependency in useEffect
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text>We need your permission to show the camera</Text>
                <Button title="Grant permission" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isFocused && !scannedProduct && (
                <>
                    {/* Camera view fills the screen */}
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={handleBarCodeScanned}
                    />

                    {/* SVG overlay with cutout */}
                    <View style={StyleSheet.absoluteFillObject}>
                        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                            <Defs>
                                <Mask id="mask" x="0" y="0" height="100%" width="100%">
                                    {/* Everything is white here (visible) */}
                                    <Rect height="100%" width="100%" fill="white" />

                                    {/* This black rectangle creates the cutout (transparent) */}
                                    <Rect
                                        x={centerX}
                                        y={centerY}
                                        width={FRAME_SIZE}
                                        height={FRAME_SIZE}
                                        rx={BORDER_RADIUS}
                                        ry={BORDER_RADIUS}
                                        fill="black"
                                    />
                                </Mask>
                            </Defs>

                            {/* This rectangle uses the mask */}
                            <Rect
                                height="100%"
                                width="100%"
                                fill="rgba(0, 0, 0, 0.6)"
                                mask="url(#mask)"
                            />
                        </Svg>
                    </View>

                    {/* Frame border positioned exactly at the same coordinates */}
                    <View
                        style={[
                            styles.scanFrame,
                            {
                                position: 'absolute',
                                left: centerX,
                                top: centerY,
                                width: FRAME_SIZE,
                                height: FRAME_SIZE,
                            }
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.scanLine,
                                {
                                    transform: [{ translateY: animation }],
                                },
                            ]}
                        />
                    </View>
                </>
            )}

            {/* Rest of your component (loading state and product display) */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text>Loading product information...</Text>
                </View>
            )}

            {scannedProduct && (
                <View style={styles.productContainer}>
                    <ProductCard
                        product={scannedProduct}
                        onRemove={handleRemoveProduct}
                    />
                    <Button
                        title="Scan Another Product"
                        onPress={handleRemoveProduct}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scanFrame: {
        borderRadius: BORDER_RADIUS,
        borderWidth: 2,
        borderColor: '#00FF00',
        overflow: 'hidden',
    },
    scanLine: {
        height: LINE_HEIGHT,
        width: '100%',
        backgroundColor: '#00FF00',
        position: 'absolute',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    productContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
    },
});