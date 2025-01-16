import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#363636',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen name="index" options={{
                headerTitle: 'Logs',
            }} />
            <Stack.Screen name="[logId]" options={{
                headerBackButtonMenuEnabled: true,
            }} />
        </Stack>
    );
}
