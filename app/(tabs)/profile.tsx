import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Page (Coming Soon)</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#070b12', justifyContent: 'center', alignItems: 'center' }, text: { color: '#fff', fontSize: 18, fontWeight: 'bold' }});