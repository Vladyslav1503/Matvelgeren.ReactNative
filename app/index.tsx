import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 16 }}>Edit app/index.tsx to edit this screen.</Text>
        <Link href="/barCodeScanner">/Open tab bar</Link>
    </View>
  );
}
