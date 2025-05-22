import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    TextInput,
    Modal,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { fetchProductByEAN } from '@/api/kassalappAPI';
import { mapApiResponseToProductCardEfficient } from '@/utils/nutritionParser';
import Svg, { Defs, Rect, Mask } from 'react-native-svg';

import ScanFocusBox from '@/assets/icons/scan_focus_box.svg';

const { width, height } = Dimensions.get('window');
// Adjusted frame size for better proportions
const FRAME_WIDTH = width * 0.7;
const FRAME_HEIGHT = width * 0.5; // Smaller height for the transparent box while keeping barcode scanning area
const BORDER_RADIUS = 35;
const LINE_HEIGHT = 2;
const TAB_BAR_HEIGHT = 60; // Estimated tab bar height
const TRANSPARENT_BOX_INSET = 16; // Make transparent box smaller by 6px on each side

interface Product {
    id: string;
    name: string;
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    sugar?: number;
    price: number;
    labels: string[];
    imageUrl: string;
    store?: string;
    storeLogo?: string;
    description?: string;
    brand?: string;
    weight?: string;
}

interface ApiResponse {
    data: {
        ean: string;
        products: any[];
        nutrition: any[];
    };
}

// Sample EAN codes for testing
const sampleEANs = [
    { ean: "7039317007320", description: "Cafe Bakeriet Sjokoladeterapi" },
    { ean: "7090046311683", description: "Dried Mango" },
    { ean: "4009900484220", description: "Extra white sweet mint" },
    { ean: "7310865079770", description: "Coca-Cola uten Sukker 150ml bx" },
    { ean: "7025110070265", description: "Coop Seigmenn" },
    { ean: "7310865071156", description: "Iskaffe Latte Protein" }
];

export default function BarcodeScanner() {
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [isFocused, setIsFocused] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testMode, setTestMode] = useState(false);
    const [testEAN, setTestEAN] = useState('');
    const [showTestModal, setShowTestModal] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    // Add a state variable to keep track of the last scanned EAN
    const [lastScannedEAN, setLastScannedEAN] = useState<string | null>(null);

    const centerX = (width - FRAME_WIDTH) / 2;
    const centerY = (height - FRAME_HEIGHT - TAB_BAR_HEIGHT - insets.bottom) / 2.2; // Adjust position to account for tab bar

    // Simple function to start the animation
    const startAnimation = () => {
        // Reset to initial position
        animation.setValue(0);

        // Create and start the animation sequence
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: FRAME_HEIGHT - (TRANSPARENT_BOX_INSET * 2) - LINE_HEIGHT, // Animate only within the transparent box height
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
        if ((permission?.granted || testMode) && isFocused && !scannedProduct && !isLoading) {
            startAnimation();
        }
    }, [permission, isFocused, scannedProduct, isLoading, testMode]);

    // Handle screen focus changes
    useFocusEffect(
        React.useCallback(() => {
            setIsFocused(true);
            if ((permission?.granted || testMode) && !scannedProduct && !isLoading) {
                startAnimation();
            }

            return () => {
                setIsFocused(false);
            };
        }, [permission, scannedProduct, isLoading, testMode])
    );

    // Automatically clear error after 3 seconds
    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                setError(null);
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
        // Filter out QR codes
        if (type === 'qr') {
            setError("QR codes are not supported. Please scan a product barcode.");
            return;
        }

        await processEAN(data);
    };

    const processEAN = async (ean: string) => {
        console.log('Processing EAN:', ean);
        if (!scanned) {
            setScanned(true);
            setIsLoading(true);
            setError(null);
            // Save the last scanned EAN for potential retry
            setLastScannedEAN(ean);

            try {
                const response = await fetchProductByEAN(ean);

                // Check if we have valid products in the response
                if (!response?.data?.products || response.data.products.length === 0) {
                    setError(`Product with barcode ${ean} not found in database.`);
                    setScanned(false);
                    setIsLoading(false);
                    return;
                }

                // Use the efficient version that validates images in parallel
                const productData = await mapApiResponseToProductCardEfficient(response);

                if (!productData || !productData.id) {
                    setError("Product not found. Please try another product.");
                    setScanned(false);
                    setIsLoading(false);
                    return;
                }

                console.log("Product:", JSON.stringify(productData));
                setScannedProduct(productData);
            } catch (error: unknown) {
                console.log("Error:", error);

                // Type guard to check if error is an Error object
                if (error instanceof Error) {
                    // Now TypeScript knows error is an Error object with a message property
                    if (error.message && error.message.includes("No query results for model")) {
                        setError("This product doesn't exist in our database yet. Try scanning another product.");
                    } else {
                        setError("Could not fetch product information. Please try again.");
                    }
                } else {
                    // Handle case where error is not an Error object
                    setError("An unexpected error occurred. Please try again.");
                }

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

    // Function to dismiss error
    const dismissError = () => {
        setError(null);
    };

    // Toggle test mode
    const toggleTestMode = () => {
        setTestMode(!testMode);
    };

    // Function to test scanning a product
    const testScanProduct = () => {
        if (testEAN) {
            processEAN(testEAN);
            setTestEAN('');
            setShowTestModal(false);
        } else {
            setError("Please enter a valid EAN code");
        }
    };

    // Function to select a sample EAN
    const selectSampleEAN = (ean: string) => {
        setTestEAN(ean);
    };

    // Function to retry scanning with the same EAN
    const retryScan = () => {
        if (lastScannedEAN) {
            processEAN(lastScannedEAN);
        } else {
            setError("No previous scan to retry. Please scan a product.");
        }
    };

    if (!permission && !testMode) return <View />;

    if (!permission?.granted && !testMode) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.testModeButton} onPress={toggleTestMode}>
                    <Text style={styles.testModeButtonText}>Enter Test Mode</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Calculate safe height for result container
    const safeResultContainerHeight = height - centerY - FRAME_HEIGHT - TAB_BAR_HEIGHT - insets.bottom - 40;

    return (
        <SafeAreaView style={styles.container}>
            {/* Camera layer (shown only when not in test mode) */}
            {isFocused && !testMode && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
            )}

            {/* Test mode background */}
            {testMode && (
                <View style={styles.testModeBackground}>
                    <Text style={styles.testModeTitle}>Test Mode</Text>
                    <Text style={styles.testModeDescription}>
                        Use this mode to test product scanning without a camera
                    </Text>
                </View>
            )}

            {/* Overlay layer (always present when scanning) */}
            {isFocused && (
                <View style={StyleSheet.absoluteFillObject}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Mask id="mask" x="0" y="0" height="100%" width="100%">
                                <Rect height="100%" width="100%" fill="white" />
                                <Rect
                                    x={centerX + TRANSPARENT_BOX_INSET}
                                    y={centerY + TRANSPARENT_BOX_INSET -7}
                                    width={FRAME_WIDTH - (TRANSPARENT_BOX_INSET * 2)}
                                    height={FRAME_HEIGHT - (TRANSPARENT_BOX_INSET * 2)+14}
                                    rx={BORDER_RADIUS}
                                    ry={BORDER_RADIUS}
                                    fill="black"
                                />
                            </Mask>
                        </Defs>
                        <Rect
                            height="100%"
                            width="100%"
                            fill={testMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.6)"}
                            mask="url(#mask)"
                        />
                    </Svg>
                </View>
            )}

            {/* Custom scan frame - Using the custom SVG from ScanFocusBox */}
            {isFocused && (
                <View
                    style={{
                        position: 'absolute',
                        left: centerX,
                        top: centerY,
                        width: FRAME_WIDTH,
                        height: FRAME_HEIGHT,
                        borderRadius: BORDER_RADIUS,
                    }}
                >
                    {/* Keep ScanFocusBox SVG at original size */}
                    <ScanFocusBox
                        width={FRAME_WIDTH}
                        height={FRAME_HEIGHT}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    />

                    {/* Container for the scan line animation - constrained to transparent box */}
                    <View
                        style={{
                            position: 'absolute',
                            left: TRANSPARENT_BOX_INSET,
                            top: TRANSPARENT_BOX_INSET,
                            width: FRAME_WIDTH - (TRANSPARENT_BOX_INSET-5 * 2)-6,
                            height: FRAME_HEIGHT - (TRANSPARENT_BOX_INSET * 2),
                            overflow: 'hidden', // This keeps the scan line inside the transparent box
                        }}
                    >
                        {/* Keep the scan line animation inside the transparent box */}
                        {!scannedProduct && !isLoading && (
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        width: FRAME_WIDTH - (TRANSPARENT_BOX_INSET * 2) - 10, // Slightly narrower than the transparent box
                                        transform: [{ translateY: animation }],
                                        left: 5, // Center the line within the transparent box
                                    },
                                ]}
                            />
                        )}
                    </View>
                </View>
            )}

            {/* Error display */}
            {error && (
                <TouchableOpacity
                    style={[styles.errorToast, { top: centerY + FRAME_HEIGHT + 20 }]}
                    onPress={dismissError}
                >
                    <Text style={styles.errorText}>{error}</Text>
                    <View style={styles.errorActions}>
                        {lastScannedEAN && (
                            <TouchableOpacity style={styles.retryButton} onPress={retryScan}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.dismissText}>Tap to dismiss</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Loading indicator */}
            {isLoading && (
                <View style={[
                    styles.resultContainer,
                    { top: centerY + FRAME_HEIGHT + 20, height: safeResultContainerHeight }
                ]}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color="#00AA5B" />
                        <Text style={styles.loadingText}>Looking up product information...</Text>
                    </View>
                </View>
            )}

            {/* Scanned product display */}
            {scannedProduct && (
                <View style={[
                    styles.resultContainer,
                    { top: centerY + FRAME_HEIGHT + 20, height: safeResultContainerHeight }
                ]}>
                    <ProductCard
                        product={scannedProduct}
                        onRemove={handleRemoveProduct}
                    />
                    <TouchableOpacity style={styles.scanAgainButton} onPress={handleRemoveProduct}>
                        <Text style={styles.buttonText}>Scan another product</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Test mode controls */}
            {testMode && (
                <>
                    <TouchableOpacity
                        style={[styles.toggleTestModeButton, { top: 60, right: 16 }]}
                        onPress={toggleTestMode}
                    >
                        <Text style={styles.testModeButtonText}>Exit Test Mode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testScanButton, { bottom: 150 }]}
                        onPress={() => setShowTestModal(true)}
                    >
                        <Text style={styles.buttonText}>Test Scan Product</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Test EAN input modal */}
            <Modal
                visible={showTestModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter EAN Code</Text>
                        <TextInput
                            style={styles.eanInput}
                            value={testEAN}
                            onChangeText={setTestEAN}
                            placeholder="Enter EAN code (e.g., 7039317007320)"
                            keyboardType="numeric"
                        />

                        <Text style={styles.sampleEansTitle}>Sample EAN Codes:</Text>
                        <ScrollView style={styles.sampleEansContainer}>
                            {sampleEANs.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.sampleEanItem}
                                    onPress={() => selectSampleEAN(item.ean)}
                                >
                                    <Text style={styles.sampleEanCode}>{item.ean}</Text>
                                    <Text style={styles.sampleEanDescription}>{item.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowTestModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.testButton}
                                onPress={testScanProduct}
                            >
                                <Text style={styles.buttonText}>Test Scan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 10,
    },
    resultContainer: {
        position: 'absolute',
        left: 24,
        right: 24,
        overflow: 'visible',
    },
    errorToast: {
        position: 'absolute',
        left: 24,
        right: 24,
        backgroundColor: 'rgba(255, 107, 107, 0.95)',
        borderRadius: 12,
        padding: 16,
        zIndex: 100,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    errorText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: 'white',
        marginBottom: 4,
    },
    dismissText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
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
    permissionText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 40,
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
    testModeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 16,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#00AA5B',
    },
    toggleTestModeButton: {
        position: 'absolute',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#00AA5B',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 500,
    },
    testModeButtonText: {
        color: '#00AA5B',
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },
    testModeBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f7f7f7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    testModeTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 24,
        color: '#333',
        marginBottom: 8,
    },
    testModeDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        maxWidth: '80%',
    },
    testScanButton: {
        position: 'absolute',
        left: width / 2 - 80,
        backgroundColor: '#00AA5B',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        zIndex: 100,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    eanInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        flex: 1,
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontFamily: 'Inter-Medium',
        fontSize: 16,
    },
    testButton: {
        backgroundColor: '#00AA5B',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        flex: 1,
        marginLeft: 8,
    },
    sampleEansTitle: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    sampleEansContainer: {
        maxHeight: 150,
        marginBottom: 8,
    },
    sampleEanItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
    },
    sampleEanCode: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#333',
    },
    sampleEanDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#666',
    },
    errorActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    retryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    retryText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: 'white',
    },
});