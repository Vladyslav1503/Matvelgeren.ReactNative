import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RecipeIcon from '../assets/icons/recipe.svg';
import ShoppingCartIcon from '../assets/icons/favorite.svg';
import ScanIcon from '../assets/icons/scan.svg';
import SearchIcon from '../assets/icons/search.svg';
import ProfileIcon from '../assets/icons/profile.svg';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const tabs = [
    { label: 'Recipe', route: 'recipe', Icon: RecipeIcon },
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
        height: 80,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabContent: {
        marginTop: 16,
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
        maxHeight: 56,
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
    },
});
