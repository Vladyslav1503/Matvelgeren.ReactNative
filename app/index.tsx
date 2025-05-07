import { Text, View } from "react-native";
import{ Link, Redirect } from 'expo-router'
import { useState } from 'react'

export default function Index() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Edit app/index.tsx to edit this screen.</Text>
                <Link href={"/signIn"} style={{color:'blue'}}>Sign In</Link>
                <Link href={"/signUp"} style={{ color: 'blue', marginTop: 10 }}>
                    Sign Up
                </Link>
            </View>
        );
    }
    return <Redirect href={"/barCodeScanner"}/>
}
