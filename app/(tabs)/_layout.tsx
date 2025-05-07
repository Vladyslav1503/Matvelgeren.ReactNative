import { View, Text } from 'react-native';
import CustomTabBar from '../TabBar';
import { Tabs, Redirect } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                lazy: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="recipe" />
            <Tabs.Screen name="shoppingCart" />
            <Tabs.Screen name="barCodeScanner" />
            <Tabs.Screen name="search" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
/*
export default function Layout() {
  return (
      <Tabs
        screenOptions={{
           headerShown: false,
            lazy: false
        }}>
          <Tabs.Screen name="barCodeScanner"
          options={{
              title: 'Scan bar code',
              headerShown: false,
          }}/>
          <Tabs.Screen name="shoppingCart"
          options={{
              title: 'Shopping cart',
              headerShown: false,
          }}/>
          <Tabs.Screen name="recipe"
          options={{
            title: 'Recipes',
            headerShown: false,
          }}/>
          <Tabs.Screen name="search"
          options={{
            title: 'Search',
            headerShown: false,
          }}/>
          <Tabs.Screen name="profile"
          options={{
              title: 'Profile',
              headerShown: false,
          }} />
      </Tabs>
  );
}*/