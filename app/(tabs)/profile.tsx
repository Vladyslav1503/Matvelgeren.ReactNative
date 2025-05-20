import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export default function Profile() {
    const router = useRouter();

    const logout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            Alert.alert("Logout failed", error.message);
        } else {
            router.replace("/signIn");
        }
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 16 }}>Profile</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text>Link to Index: </Text>
                <Link href="/">Index</Link>
            </View>
            <TouchableOpacity onPress={logout}>
                <Text>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}
