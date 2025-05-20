import {View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Animated, Easing} from 'react-native';
import { useRouter } from 'expo-router';
import React, {useRef, useState} from 'react';
import {supabase} from "@/lib/supabase";
import Logo from '../../assets/icons/matvelgeren_logo.svg';
import Eye from '../../assets/icons/open_eye.svg';
import Closed_Eye from '../../assets/icons/closed_eye.svg';
import CircleLoader from "@/components/circleLoader";


export default function SignUp() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
        }, 2000);
    };

    async function signUpWithEmail() {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match");
            return;
        }
        showLoader();

        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    firstName: firstName,
                    lastName: lastName,
                }
            }
        })
        if (error) Alert.alert(error.message);
        if (!session) Alert.alert('Please check your inbox for email verification!');
        router.replace('/');

        hideLoader();
    }

    return (
        <View style={styles.container}>
            <Logo style={styles.logo}></Logo>
            <Text style={styles.matvelgeren}>MatVelgeren</Text>
            <Text style={styles.title}>Sign Up to a new Account</Text>
            <Text style={styles.subTitle}>Enter your email and password to sign up</Text>
            <Text style={styles.instruction}>First Name</Text>
            <TextInput placeholder="Ola" style={styles.input} onChangeText={setFirstName} />
            <Text style={styles.instruction}>Last Name</Text>
            <TextInput placeholder="Normann" style={styles.input} onChangeText={setLastName}/>
            <Text style={styles.instruction}>Email</Text>
            <TextInput placeholder="username@example.com" style={styles.input} onChangeText={setEmail}/>
            <Text style={styles.instruction}>Enter Password</Text>

            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <Eye width={20} height={20} /> : <Closed_Eye width={20} height={20} />}
                </TouchableOpacity>
            </View>
            <Text style={styles.instruction}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.passwordInput}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    {showConfirmPassword ? <Eye width={20} height={20} /> : <Closed_Eye width={20} height={20} />}
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => signUpWithEmail()}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <View style={styles.linkContainer}>
                <Text style={styles.linkTextGray}>Already have an account? </Text>
                <Text style={styles.linkTextBlue} onPress={() => router.replace('/signIn')}>Sign in</Text>
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
        justifyContent: 'center' },
    logo: {
        alignSelf: 'center'
    },
    matvelgeren:{
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
        letterSpacing: 1 },

    subTitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        lineHeight: 20,
        letterSpacing: 1,
        color: "#838383",
        marginBottom: 40
    },

    instruction: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        lineHeight: 20,
        letterSpacing: 1,
        color: "#838383" },

    input: {
        borderWidth: 1,
        borderColor: '#838383',
        padding: 10,
        borderRadius: 5
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#838383',
        paddingRight: 10,
        borderRadius: 5,
        marginBottom: 10
    },
    passwordInput: {
        flex: 1,
        padding: 10
    },
    eyeIcon: {
        paddingHorizontal: 5
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
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

