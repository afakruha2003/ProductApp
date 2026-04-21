import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#e94560',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        contentStyle: { backgroundColor: '#f0f4f8' },
      }}
    >
      <Stack.Screen name="index" options={{ title: '🛒 Product Manager' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category' }} />
      <Stack.Screen name="category-list" options={{ title: 'Categories' }} />
      <Stack.Screen name="add-product" options={{ title: 'Add Product' }} />
      <Stack.Screen name="product-list" options={{ title: 'Products' }} />
    </Stack>
  );
}