import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Animated, 
    Dimensions, 
    TouchableOpacity,
    ActivityIndicator,
    Platform
} from 'react-native';
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
    const [error, setError] = useState<string | null>(null);
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

    const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
        // Filter out QR codes
        if (type === 'qr') {
            setError("QR codes are not supported. Please scan a product barcode.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        console.log('trigger:', data);
        if (!scanned) {
            setScanned(true);
            setIsLoading(true);
            setError(null);
            
            console.log('Scanned code:', data);
            try {
                const response: ApiResponse = await fetchProductByEAN(data);
                const productData = mapApiResponseToProductCard(response);

                if (!productData || !productData.id) {
                    setError("Product not found. Please try another product.");
                    setScanned(false);
                    setIsLoading(false);
                    return;
                }
                console.log("Product:", productData);
                setScannedProduct(productData);
            } catch (error) {
                console.log("Error:", error);
                setError("Could not fetch product information. Please try again.");
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
        setError(null);
        // The animation will restart automatically due to the dependency in useEffect
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera layer (always present) */}
            {isFocused && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
            )}

            {/* Overlay layer (always present when scanning) */}
            {isFocused && (
                <View style={StyleSheet.absoluteFillObject}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Mask id="mask" x="0" y="0" height="100%" width="100%">
                                <Rect height="100%" width="100%" fill="white" />
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
                        <Rect
                            height="100%"
                            width="100%"
                            fill="rgba(0, 0, 0, 0.6)"
                            mask="url(#mask)"
                        />
                    </Svg>
                </View>
            )}

            {/* Scan frame (always present when scanning) */}
            {isFocused && (
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
                    {!scannedProduct && !isLoading && (
                        <Animated.View
                            style={[
                                styles.scanLine,
                                {
                                    transform: [{ translateY: animation }],
                                },
                            ]}
                        />
                    )}
                </View>
            )}

            {/* Product container below scan frame */}
            <View style={[styles.resultContainer, { top: centerY + FRAME_SIZE + 20 }]}>
                {/* Error message */}
                {error && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Loading state */}
                {isLoading && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color="#00AA5B" />
                        <Text style={styles.loadingText}>Loading product information...</Text>
                    </View>
                )}

                {/* Product display */}
                {scannedProduct && (
                    <View>
                        <ProductCard
                            product={scannedProduct}
                            onRemove={handleRemoveProduct}
                        />
                        <TouchableOpacity 
                            style={styles.scanAgainButton} 
                            onPress={handleRemoveProduct}
                        >
                            <Text style={styles.buttonText}>Scan Another Product</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    resultContainer: {
        position: 'absolute',
        left: 24,
        right: 24,
    },
    loadingCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    loadingText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        marginLeft: 10,
        color: '#333',
    },
    errorCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    errorText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#333',
    },
    permissionText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    button: {
        backgroundColor: '#00AA5B',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 16,
        marginHorizontal: 20,
    },
    scanAgainButton: {
        backgroundColor: '#00AA5B',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
});