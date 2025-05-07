import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Search() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 16 }}>Search</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text>Link to Index: </Text>
                <Link href="/">Index</Link>
            </View>
        </View>
    );
}
