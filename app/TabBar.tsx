import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RecipeIcon from '../assets/icons/recipe.svg';
import ShoppingCartIcon from '../assets/icons/shop.svg';
import ScanIcon from '../assets/icons/scan.svg';
import SearchIcon from '../assets/icons/search.svg';
import ProfileIcon from '../assets/icons/profile.svg';

const { width, height } = Dimensions.get('window');
const TAB_WIDTH = width / 5;
const TAB_CONTEXT_MARGIN = (height >= 890) ? "50%" : "55%";
let TAB_BAR_HEIGHT: number;

if (height >= 890 && height < 910) {
    TAB_BAR_HEIGHT = (height * 0.09);
} else if (height < 890) {
    TAB_BAR_HEIGHT = (height * 0.07);
} else if (height >= 910 && width <= 420) {
    TAB_BAR_HEIGHT = 55;
} else {
    TAB_BAR_HEIGHT = (height * 0.1);
}

const tabs = [
    { label: 'Recipe', route: 'recipes', Icon: RecipeIcon },
    { label: 'Shop', route: 'shoppingCart', Icon: ShoppingCartIcon },
    { label: 'Scan', route: 'barCodeScanner', Icon: ScanIcon },
    { label: 'Search', route: 'search', Icon: SearchIcon },
    { label: 'Profile', route: 'profile', Icon: ProfileIcon },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const { bottom } = useSafeAreaInsets();
    const translateX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
    const animatedValues = useRef(
        tabs.map((_, i) =>
            new Animated.Value(i === state.index ? 1 : 0)
        )
    ).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * TAB_WIDTH,
            useNativeDriver: true,
            stiffness: 120,
            damping: 14,
        }).start();
    }, [state.index, translateX]);

    useEffect(() => {
        animatedValues.forEach((val, i) => {
            Animated.spring(val, {
                toValue: i === state.index ? 1 : 0,
                useNativeDriver: true,
            }).start();
        });
    }, [animatedValues, state.index]);

    return (
        <View style={[styles.container, { paddingBottom: bottom + 6 }]}>
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX }],
                        left: (TAB_WIDTH - 58) / 2,
                    },
                ]}
            />
            {tabs.map((tab, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    const routeKey = state.routes[index].key;
                    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(tab.route);
                    }
                };
                const animatedStyle = {
                    transform: [
                        {
                            scale: animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.3],
                            }),
                        },
                        {
                            translateY: animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -8],
                            }),
                        },
                    ],
                };

                return (
                    <TouchableOpacity key={tab.route} style={styles.tab} onPress={onPress}>
                        <View style={styles.tabContent}>
                            <Animated.View style={animatedStyle}>
                                <tab.Icon width={24} height={24}/>
                            </Animated.View>

                            <Text style={[styles.label, isFocused && styles.focusedLabel]}>
                                {tab.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        maxHeight: 80,
        height: TAB_BAR_HEIGHT,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'visible',
        zIndex: 1,
        ...Platform.select({
            android: {
                boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.06)',
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -16 },
                elevation: 8,
            },
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: -10 },
            },
        }),
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabContent: {
        marginTop: TAB_CONTEXT_MARGIN,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        marginTop: 4,
        fontSize: 11,
        textAlign: 'center',
        color: '#225D4F',
        fontFamily: 'Inter-Regular',
        lineHeight: 12,
        //maxHeight: 56,
        includeFontPadding: false,
        paddingBottom: 2,
    },
    focusedLabel: {
        fontFamily: 'Inter-SemiBold',
    },
    indicator: {
        position: 'absolute',
        top: -15,
        width: 58,
        height: 58,
        backgroundColor: '#fff',
        borderRadius: 58 / 2,
        zIndex: -1,
        ...Platform.select({
            android: {
                elevation: 0,
                boxShadow: '0 -20px 14px rgba(0, 0, 0, 0.02)',
            },
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.02,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: -22 },
            },
        }),
    },
});
