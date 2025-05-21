import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Button } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import  ProductCard  from '../../components/ProductCard'
import { fetchProductByEAN } from '@/api/kassalappAPI'
import { mapApiResponseToProductCard } from '@/utils/nutritionParser';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.8;
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

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
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
                    return;
                }
                console.log("Product:", productData);
                setScannedProduct(productData);
            } catch (error) {
                console.log("Error:", error);
                alert("Could not fetch product information.");
            } finally {
                setIsLoading(false);
                setTimeout(() => setScanned(false), 3000);
            }
        }
    };

    // Function to handle removing the scanned product
    const handleRemoveProduct = () => {
        setScannedProduct(null);
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