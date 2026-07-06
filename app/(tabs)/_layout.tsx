import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { display: 'none' } // HII NDIO INAUWA DOUBLE TASKBAR 100%
      }}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}