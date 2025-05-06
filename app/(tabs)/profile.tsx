import { Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView  } from 'react-native-safe-area-context';

export default function Profile() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
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
            </View>
        </SafeAreaView >
    );
}
