import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Easing , Alert } from 'react-native';
import { useRouter } from 'expo-router';
import React, {useState, useEffect, useRef} from 'react';
import { supabase } from "@/lib/supabase";
import circleLoader from "@/components/circleLoader";

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import Logo from '../../assets/icons/matvelgeren_logo.svg';
import Eye from '../../assets/icons/open_eye.svg';
import Closed_Eye from '../../assets/icons/closed_eye.svg';
import Google_logo from '../../assets/icons/google_logo.svg';
import CircleLoader from "@/components/circleLoader";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const scaleAnim = useRef(new Animated.Value(0)).current;

    const showLoader = () => {
        setLoading(true);

        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const hideLoader = () => {
        setTimeout(() => {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                setLoading(false);
            });
        }, 2000); // ensure loader stays for at least 1s
    };

    async function signInWithEmail() {
        showLoader();

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error)
            Alert.alert(error.message);
        setLoading(false);
        router.replace('/');

        hideLoader();
    }

    // Google OAuth setup
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: '751833991834-u2hbkp64mmue66baos9kr5tqe64bgs0r.apps.googleusercontent.com',
        //iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
        //androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log(' Google Access Token:', authentication?.accessToken);
            // TODO: Use token to auth with your backend or Firebase
        }
    }, [response]);

    return (
        <View style={styles.container}>
            <Logo style={styles.logo} />
            <Text style={styles.matvelgeren}>MatVelgeren</Text>
            <Text style={styles.title}>Sign In to your Account</Text>
            <Text style={styles.subTitle}>Enter your email and password to continue</Text>

            <Text style={styles.instruction}>Email</Text>
            <TextInput
                placeholder="username@example.com"
                onChangeText={setEmail}
                style={styles.input}
                />
            <Text style={styles.instruction}>Enter Password</Text>

            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    style={styles.passwordInput}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <Eye width={20} height={20} /> : <Closed_Eye width={20} height={20} />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => signInWithEmail()}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            {/* OR divider*/}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.divider} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
                style={styles.googleButton}
                onPress={() => promptAsync()}
                disabled={!request}
            >
                <View style={styles.googleButtonContent}>
                    <Google_logo width={20} height={20} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
                <Text style={styles.linkTextGray}>Dont have an account? </Text>
                <Text style={styles.linkTextBlue} onPress={() => router.replace('/signUp')}>Sign up</Text>
            </View>

            {loading && (
                <Animated.View style={[styles.loaderOverlay, { transform: [{ scale: scaleAnim }] }]}>
                    <CircleLoader />
                </Animated.View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center'
    },
    logo: {
        alignSelf: 'center'
    },
    matvelgeren: {
        color: "#205446",
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        alignSelf: 'center'
    },
    title: {
        fontFamily: 'Inter-SemiBold',
        marginBottom: 10,
        fontSize: 25,
        lineHeight: 30,
        letterSpacing: 1
    },
    subTitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        lineHeight: 20,
        letterSpacing: 1,
        color: "#838383",
        marginBottom: 80
    },
    instruction: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        lineHeight: 20,
        letterSpacing: 1,
        color: "#838383"
    },
    input: {
        borderWidth: 1,
        borderColor: '#838383',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#838383',
        paddingRight: 10,
        marginBottom: 10,
        borderRadius: 5
    },
    passwordInput: {
        flex: 1,
        padding: 10
    },
    eyeIcon: {
        paddingHorizontal: 5
    },
    button: {
        marginTop: "5%",
        paddingVertical: "5%",
        backgroundColor: "#205446",
        borderRadius: 8,
        alignSelf: "center",
        width: "95%",
    },
    buttonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0,
        color: "#ffffff",
        alignSelf: "center"
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc'
    },
    orText: {
        marginHorizontal: 10,
        fontSize: 12,
        color: '#838383',
        fontFamily: 'Inter-Regular'
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#838383',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '95%',
        alignSelf: 'center'
    },

    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleButtonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 15,
        color: '#000',
        marginLeft: 10
    },

    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    linkTextGray: {
        color: '#838383',
        fontFamily: 'Inter-Regular',
        fontSize: 13
    },
    linkTextBlue: {
        color: '#4578E5',
        fontFamily: 'Inter-SemiBold',
        fontSize: 13
    },

    forgotPassword: {
        color: '#4578E5',
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        alignSelf: 'flex-end',
        marginBottom: 15
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    }
});
