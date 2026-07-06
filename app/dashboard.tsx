import React, { useRef, useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, Image, Animated, Dimensions, Platform 
} from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('home');

  // Rangi za MoTECH-i
  const colors = {
    bg: '#070b12',
    card: '#111a2a',
    primary: '#dc2626',
    secondary: '#1e293b',
    accent: '#facc15',
    text: '#ffffff',
    textMuted: '#94a3b8'
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#070b12" />
      
      {/* 1. TOP HEADER (Custom) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Habari, John Doe</Text>
          <View style={styles.brandRow}>
             <Text style={[styles.brandText, { color: colors.text }]}>Mo</Text>
             <Text style={[styles.brandText, { color: colors.primary }]}>TECH</Text>
             <Text style={[styles.brandText, { color: colors.text }]}>-i</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
           <Feather name="bell" size={22} color={colors.text} />
           <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }} 
      >
        
        {/* 2. WELCOME BANNER / CTA - Imebaki na SOS juu pekee */}
        <View style={styles.sectionPadding}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.welcomeBanner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Need an expert mechanic?</Text>
              <Text style={styles.bannerDesc}>Book a service instantly or request roadside assistance.</Text>
              
              <View style={styles.bannerButtons}>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
                {/* SOS Imebaki hapa, Bolded */}
                <TouchableOpacity style={styles.sosBtnSmall}>
                  <MaterialCommunityIcons name="alert-decagram" size={16} color="#dc2626" />
                  <Text style={styles.sosBtnText}>SOS</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80' }}
              style={styles.bannerImage}
            />
          </LinearGradient>
        </View>

        {/* 3. QUICK SERVICES GRID */}
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionTitle}>Our Expert Services</Text>
          <View style={styles.servicesGrid}>
            {[
              { title: 'Diagnostics', icon: 'zap', col: colors.accent, desc: 'OBD2 Scanning' },
              { title: 'Repair', icon: 'tool', col: colors.primary, desc: 'Major Fixes' },
              { title: 'Maintenance', icon: 'droplet', col: '#3b82f6', desc: 'Oil & Fluids' },
              { title: 'Body Work', icon: 'shield', col: '#10b981', desc: 'Paint & Panel' },
              { title: 'Pre Purchase', icon: 'search', col: '#a855f7', desc: 'Car Inspection' },
              // MPYA: Spare Parts imeongezwa kufikisha huduma 6
              { title: 'Spare Parts', icon: 'shopping-bag', col: '#f97316', desc: 'OEM Components' }
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.serviceCard}>
                <View style={[styles.serviceIconBox, { backgroundColor: item.col + '20' }]}>
                  <Feather name={item.icon as any} size={24} color={item.col} />
                </View>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. PREMIUM FEATURES (Showroom & Academy) */}
        <View style={[styles.sectionPadding, { marginBottom: 30 }]}> 
          <Text style={styles.sectionTitle}>MoTECH-i Universe</Text>
          
          {/* Showroom Promo - Picha ya Premium Car */}
          <TouchableOpacity style={styles.promoCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80' }} 
              style={styles.promoBg} 
            />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.promoOverlay}>
              <View>
                <Text style={styles.promoTag}>PREMIUM SELECTION</Text>
                <Text style={styles.promoTitle}>Visit Showroom</Text>
              </View>
              <Feather name="arrow-right-circle" size={30} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Academy Promo - Picha imerudishwa kuwa ya Engine */}
          <TouchableOpacity style={[styles.promoCard, { marginTop: 15 }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' }} 
              style={styles.promoBg} 
            />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.promoOverlay}>
              <View>
                <Text style={styles.promoTag}>LEARN & MASTER</Text>
                <Text style={styles.promoTitle}>MoTECH-i Academy</Text>
              </View>
              <MaterialCommunityIcons name="play-circle" size={35} color={colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ==================== 5. BOTTOM TAB NAVIGATION ==================== */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navItem}>
          <Feather name="home" size={24} color={activeTab === 'home' ? colors.primary : colors.textMuted} />
          <Text style={[styles.navText, { color: activeTab === 'home' ? colors.primary : colors.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem}>
          <MaterialCommunityIcons name="garage" size={24} color={activeTab === 'garage' ? colors.primary : colors.textMuted} />
          <Text style={[styles.navText, { color: activeTab === 'garage' ? colors.primary : colors.textMuted }]}>My Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.navItem}>
          <Feather name="clock" size={24} color={activeTab === 'history' ? colors.primary : colors.textMuted} />
          <Text style={[styles.navText, { color: activeTab === 'history' ? colors.primary : colors.textMuted }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navItem}>
          <Feather name="user" size={24} color={activeTab === 'profile' ? colors.primary : colors.textMuted} />
          <Text style={[styles.navText, { color: activeTab === 'profile' ? colors.primary : colors.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingVertical: 20 
  },
  headerGreeting: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandText: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  notifBtn: { 
    width: 45, 
    height: 45, 
    backgroundColor: '#1e293b', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notifBadge: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 8, 
    height: 8, 
    backgroundColor: '#dc2626', 
    borderRadius: 4, 
    borderWidth: 2, 
    borderColor: '#1e293b' 
  },
  sectionPadding: { paddingHorizontal: 25, marginTop: 25 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20 },
  
  // Welcome Banner Styles
  welcomeBanner: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    overflow: 'hidden',
    height: 160
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 10
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 5 },
  bannerDesc: { color: '#94a3b8', fontSize: 11, marginBottom: 15, lineHeight: 16 },
  bannerButtons: { flexDirection: 'row', gap: 10 },
  bookBtn: { backgroundColor: '#dc2626', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  sosBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(220,38,38,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)' },
  sosBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 12 }, // Bolded hapa
  bannerImage: {
    position: 'absolute',
    right: -30,
    top: 0,
    width: 180,
    height: '100%',
    opacity: 0.5,
  },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { 
    width: '48%', 
    backgroundColor: '#111a2a', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  serviceIconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  serviceTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  serviceDesc: { color: '#64748b', fontSize: 11, marginTop: 4 },
  
  promoCard: { height: 160, borderRadius: 25, overflow: 'hidden' },
  promoBg: { width: '100%', height: '100%' },
  promoOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    padding: 20 
  },
  promoTag: { color: '#facc15', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  promoTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },

  // Bottom Navigation Styles
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: Platform.OS === 'ios' ? 25 : 15, 
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 }
});