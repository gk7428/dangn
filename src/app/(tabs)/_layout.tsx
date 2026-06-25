import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuth } from '@/context/auth-context';

const CORAL = '#FF5A4D';
const INK3 = '#A49C92';
const LINE2 = '#E4DCD1';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { account } = useAuth();
  const isAdmin = account?.role === 'admin';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: CORAL,
          tabBarInactiveTintColor: INK3,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: LINE2,
            borderTopWidth: 1,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: '동네생활',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="write"
          options={{
            title: '글쓰기',
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.centerButton}
                activeOpacity={0.85}
                onPress={() => router.push('/sell')}>
                <View style={styles.centerButtonInner}>
                  <Ionicons name="add" size={24} color="#fff" />
                </View>
                <Text style={styles.centerButtonLabel}>글쓰기</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="nearby"
          options={{
            title: '채팅',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="my-daangn"
          options={{
            title: '나의부산',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Protected guard={isAdmin}>
          <Tabs.Screen
            name="admin"
            options={{
              title: '관리자',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'shield' : 'shield-outline'} size={24} color={color} />
              ),
            }}
          />
        </Tabs.Protected>
      </Tabs>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  centerButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: CORAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 8,
    elevation: 5,
  },
  centerButtonLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: INK3,
    marginTop: 3,
  },
});
