import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, Image, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function GarageScreen() {
  const colors = {
    bg: '#070b12', card: '#111a2a', primary: '#dc2626', secondary: '#1e293b',
    accent: '#facc15', text: '#ffffff', textMuted: '#94a3b8', success: '#10b981',
  };

  const serviceSteps = [
    { id: 1, title: 'Vehicle Dropped Off', desc: 'Keys handed over at reception', time: '08:30 AM', status: 'completed' },
    { id: 2, title: 'Full Diagnostics Scan', desc: 'OBD2 scanning & physical check', time: '09:15 AM', status: 'completed' },
    { id: 3, title: 'Engine Overhaul & Repair', desc: 'Replacing gasket and spark plugs', time: 'In Progress', status: 'active' },
    { id: 4, title: 'Quality Assurance (QA)', desc: 'Test drive and final checks', time: 'Pending', status: 'pending' },
    { id: 5, title: 'Ready for Pickup', desc: 'Car wash and handover', time: 'Pending', status: 'pending' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070b12" translucent />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Garage</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        
        <View style={styles.sectionPadding}>
          <View style={styles.carCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1550428383-7c4273ab3304?auto=format&fit=crop&w=1200&q=80' }} style={styles.carImage} />
            <LinearGradient colors={['transparent', 'rgba(7, 11, 18, 1)']} style={styles.carOverlay}>
              <View style={styles.carBadgeRow}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusBadgeText}>IN SERVICE</Text>
                </View>
                <View style={styles.plateBadge}>
                  <Text style={styles.plateText}>T 123 ABC</Text>
                </View>
              </View>
              <View>
                <Text style={styles.carModel}>Toyota Land Cruiser V8</Text>
                <Text style={styles.carYear}>2020 • 4.5L Diesel</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.sectionPadding}>
          <View style={styles.mechanicCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }} style={styles.mechanicPic} />
            <View style={styles.mechanicInfo}>
              <Text style={styles.mechanicName}>Master Mechanic: David</Text>
              <Text style={styles.mechanicNote}>{'"We found a minor leak in the radiator hose. Fixing it now. ETA: 2 hours."'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionPadding}>
          <Text style={styles.sectionTitle}>Service Tracker</Text>
          <View style={styles.timelineContainer}>
            {serviceSteps.map((step, index) => {
              const isLast = index === serviceSteps.length - 1;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <View key={step.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineIconBox, isCompleted ? { backgroundColor: colors.success } : isActive ? { backgroundColor: colors.primary } : { backgroundColor: colors.secondary }]}>
                      <Feather name={isCompleted ? "check" : isActive ? "tool" : "clock"} size={14} color={isCompleted || isActive ? "#fff" : colors.textMuted} />
                    </View>
                    {!isLast && <View style={[styles.timelineLine, isCompleted ? { backgroundColor: colors.success } : { backgroundColor: colors.secondary }]} />}
                  </View>
                  <View style={[styles.timelineContent, { opacity: step.status === 'pending' ? 0.5 : 1 }]}>
                    <View style={styles.timelineHeader}>
                      <Text style={[styles.stepTitle, isActive && { color: colors.primary }]}>{step.title}</Text>
                      <Text style={styles.stepTime}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 25, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  sectionPadding: { paddingHorizontal: 25, marginTop: 25 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 15 },
  carCard: { height: 220, borderRadius: 25, overflow: 'hidden', backgroundColor: '#111a2a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  carImage: { width: '100%', height: '100%' },
  carOverlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'space-between' },
  carBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(220,38,38,0.5)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc2626', marginRight: 6 },
  statusBadgeText: { color: '#fca5a5', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  plateBadge: { backgroundColor: '#facc15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  plateText: { color: '#070b12', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  carModel: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 5 },
  carYear: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  mechanicCard: { flexDirection: 'row', backgroundColor: '#111a2a', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', alignItems: 'center' },
  mechanicPic: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  mechanicInfo: { flex: 1 },
  mechanicName: { color: '#fff', fontSize: 13, fontWeight: '900', marginBottom: 4 },
  mechanicNote: { color: '#94a3b8', fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  timelineContainer: { backgroundColor: '#111a2a', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#1e293b' },
  timelineRow: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { alignItems: 'center', width: 30, marginRight: 15 },
  timelineIconBox: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, marginBottom: 4 },
  timelineContent: { flex: 1, paddingBottom: 25 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stepTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  stepTime: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  stepDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 18 }
});
