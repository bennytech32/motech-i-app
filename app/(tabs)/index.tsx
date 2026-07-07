import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import React, { useEffect, useRef, useState } from 'react';
import { Video, ResizeMode } from 'expo-av'; // 🔴 TUMEINGIZA VIDEO PLAYER HAPA
import {
  ActivityIndicator, Alert,
  Animated, Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  LayoutAnimation,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../supabase';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

const APP_CONFIG = {
  intro1Bg: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=100', 
  intro2Bg: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=100', 
  localLogo: require('../../assets/images/logo.jpg'), 
};

// ==========================================
// DATA MPYA YA MAGARI KWA AJILI YA MANUALS (ICONS ONLY)
// ==========================================
const COMMON_MANUALS = [
  { id: 1, name: 'Toyota Crown', icon: 'car-sports' },
  { id: 2, name: 'Subaru Forester', icon: 'car-estate' },
  { id: 3, name: 'Toyota IST', icon: 'car-hatchback' },
  { id: 4, name: 'BMW X5', icon: 'car' },
  { id: 5, name: 'Toyota Harrier', icon: 'car-estate' },
  { id: 6, name: 'Toyota Land Cruiser', icon: 'jeepney' },
  { id: 7, name: 'Mercedes Benz C-Class', icon: 'car-sports' },
  { id: 8, name: 'Toyota Vitz', icon: 'car-hatchback' },
  { id: 9, name: 'Ford Ranger', icon: 'car-pickup' },
  { id: 10, name: 'Nissan Dualis', icon: 'car' },
  { id: 11, name: 'Honda CR-V', icon: 'car-estate' },
  { id: 12, name: 'Range Rover', icon: 'jeepney' },
  { id: 13, name: 'Audi Q7', icon: 'car' },
  { id: 14, name: 'VW Golf', icon: 'car-hatchback' },
  { id: 15, name: 'Mazda CX-5', icon: 'car' },
];

export default function AppFlow() {
  const [currentScreen, setCurrentScreen] = useState('splash'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [welcomeStep, setWelcomeStep] = useState(0); 
  const [selectedService, setSelectedService] = useState('');
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSettingsMode, setIsSettingsMode] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [carModel, setCarModel] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingTime, setBookingTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const [showroomCars, setShowroomCars] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [academyVideos, setAcademyVideos] = useState<any[]>([]);

  const [showNotif, setShowNotif] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [sosForm, setSosForm] = useState({ name: '', issue: '', location: '' });
  const [notifications, setNotifications] = useState([{ id: 1, title: 'Karibu MoTECH-i', sub: 'Akaunti yako ipo tayari.', type: 'success' }]);

  const [academyView, setAcademyView] = useState('menu'); 
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([{ id: 1, role: 'ai', text: 'Habari! Mimi ni MoTECH-i AI. Niulize swali lolote la kiufundi kuhusu gari lako, au chagua Manual kwenye orodha.' }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [manualCarInfo, setManualCarInfo] = useState('');

  const colors = { bg: '#070b12', card: '#111a2a', primary: '#dc2626', secondary: '#1e293b', accent: '#facc15', text: '#ffffff', textMuted: '#94a3b8', success: '#10b981' };

  const pulseAnim = useRef(new Animated.Value(1)).current; 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) {
        setFullName(session.user.user_metadata?.full_name || '');
        setPhone(session.user.user_metadata?.phone_number || '');
        fetchUserData(session.user.id);
        setCurrentScreen('main'); 
      } else {
        setTimeout(() => { setCurrentScreen('welcome'); }, 3500);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (session) {
        setFullName(session.user.user_metadata?.full_name || '');
        setPhone(session.user.user_metadata?.phone_number || '');
        fetchUserData(session.user.id);
        setCurrentScreen('main');
      } else {
        setMyVehicles([]);
        setMyBookings([]);
      }
    });
    fetchPublicData();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentScreen === 'sos' || currentScreen === 'splash') {
      Animated.loop(Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])).start();
    } else { pulseAnim.stopAnimation(); }
  }, [currentScreen]);

  const fetchUserData = async (userId: string) => {
    let { data: vehicles } = await supabase.from('vehicles').select('*').eq('user_id', userId);
    if (vehicles) setMyVehicles(vehicles);
    let { data: bookings } = await supabase.from('bookings').select('*, vehicles(model, plate_number)').eq('user_id', userId).order('created_at', { ascending: false });
    if (bookings) setMyBookings(bookings);
  };

  const fetchPublicData = async () => {
    const { data: cars } = await supabase.from('showroom').select('*').order('created_at', { ascending: false });
    if (cars) setShowroomCars(cars);
    const { data: parts } = await supabase.from('spare_parts').select('*').order('created_at', { ascending: false });
    if (parts) setSpareParts(parts);
    const { data: vids } = await supabase.from('academy_videos').select('*').order('created_at', { ascending: false });
    if (vids) setAcademyVideos(vids);
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName || !phone) { alert("Tafadhali jaza nafasi zote!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName, phone_number: phone, plan: 'Free' } } });
      if (error) throw error;
      alert("Usajili Umekamilika! Sasa login kuingia.");
      setIsLoginMode(true);
    } catch (error: any) {
      const message = error?.message === 'Network request failed'
        ? 'Imeshindwa kuunganishwa na Supabase Auth. Hakikisha Supabase URL/API key ni sahihi na simu ina internet.'
        : error.message;
      alert(message);
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!email || !password) { alert("Tafadhali jaza Email na Password!"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.session?.user?.id) await fetchUserData(data.session.user.id);
      setCurrentScreen('main');
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    if (!fullName || !phone) { alert("Nafasi hizi haziwezi kuwa wazi!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone_number: phone } });
      if (error) throw error;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phone })
        .eq('id', userSession?.user?.id);
      if (profileError) throw profileError;
      alert("Mabadiliko yamehifadhiwa! ✅");
      setIsSettingsMode(false);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleChangeSubscription = async (planName: string, price: string) => {
    Alert.alert("Dhibitisha Kifurushi", `Je, unataka kujiunga na Kifurushi cha ${planName} kwa TZS ${price}/mwezi?`, [
      { text: "Ghairi" },
      { text: "Ndio, Lipia", onPress: async () => {
          setLoading(true);
          const { error } = await supabase.auth.updateUser({ data: { plan: planName } });
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: planName })
            .eq('id', userSession?.user?.id);
          if (!error && !profileError) {
            alert(`Umejiunga kikamilifu na kifurushi cha ${planName}! 🚀`);
            setNotifications([{ id: Date.now(), title: 'Kifurushi Kipya!', sub: `Sasa upo kwenye ${planName}`, type: 'success' }, ...notifications]);
          } else {
            alert(error?.message || profileError?.message || 'Imeshindikana kubadilisha kifurushi.');
          }
          setLoading(false);
        }}
    ]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setCurrentScreen('login'); setIsSettingsMode(false); setWelcomeStep(0); };

  const toggleAddCarForm = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowAddCarForm(!showAddCarForm); };

  const ensureUserProfile = async () => {
    const user = userSession?.user;
    if (!user?.id) throw new Error('Tafadhali login tena kabla ya kusajili gari.');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || fullName || null,
        phone_number: user.user_metadata?.phone_number || phone || null,
        plan: user.user_metadata?.plan || 'Free',
      });

    if (error) throw error;
    return user.id;
  };

  const handleAddVehicle = async () => {
    if (!carModel || !carPlate) { alert("Jaza Jina na Namba ya Gari!"); return; }
    setLoading(true);
    try {
      const userId = await ensureUserProfile();
      const { error } = await supabase.from('vehicles').insert([{ user_id: userId, model: carModel, plate_number: carPlate }]);
      if (error) throw error;
      alert("Gari Limesajiliwa Kwenye Garage Yako! 🚘");
      setCarModel(''); setCarPlate(''); toggleAddCarForm(); fetchUserData(userSession.user.id);
      setNotifications([{ id: Date.now(), title: 'Gari Limesajiliwa', sub: `${carModel} imeongezwa.`, type: 'success' }, ...notifications]);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleCreateBooking = async () => {
    if (!selectedVehicleId || !selectedService) { alert("Tafadhali chagua Gari na Aina ya Huduma!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert([{ user_id: userSession?.user?.id, vehicle_id: selectedVehicleId, service_type: selectedService, booking_date: bookingDate.toISOString().split('T')[0], booking_time: bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), notes: bookingNotes }]);
      if (error) throw error;
      alert("📅 Booking Imetumwa Kikamilifu!");
      setSelectedService(''); setBookingNotes(''); fetchUserData(userSession.user.id); setCurrentScreen('main'); setActiveTab('history'); 
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleGetLocation = async () => {
    setFetchingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert('Ruhusu GPS kwenye simu yako kwanza.'); setFetchingLocation(false); return; }
      let location = await Location.getCurrentPositionAsync({});
      setSosForm({ ...sosForm, location: `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}` });
    } catch (error) { alert('Imeshindwa kusoma GPS.'); } finally { setFetchingLocation(false); }
  };

  const handleSendSOS = async () => {
    if (!sosForm.location || !sosForm.name || !sosForm.issue) { alert("Jaza fomu yote na ubonyeze kitufe kusoma GPS!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('sos_requests').insert([{ user_id: userSession?.user?.id || null, customer_name: sosForm.name, issue: sosForm.issue, coordinates: sosForm.location, status: 'Pending' }]);
      if (error) throw error;
      alert('🚨 SOS Signal Imetumwa! Rescue team inakufuata.'); setCurrentScreen('main');
    } catch (error: any) { alert(error.message || 'Imeshindwa kutuma SOS. Jaribu tena.'); } finally { setLoading(false); }
  };

  const handleSendAiMessage = async (customMessage?: string) => {
    const userMsgText = customMessage || aiInput.trim();
    if (!userMsgText) return;
    setAiMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsgText }]);
    if (!customMessage) setAiInput(''); 
    setAiLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsgText }) });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      setAiMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply || "Samahani, Backend haipatikani." }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: `⚠ Imeshindwa kuunganishwa na Backend (${BACKEND_URL}). Hakikisha server inawaka.` }]);
    } finally { setAiLoading(false); }
  };

  const handleFetchManual = (carName: string) => { setAcademyView('ai'); handleSendAiMessage(`Nipe mwongozo mfupi wa matunzo (Maintenance Manual) na mambo ya kuzingatia kwa gari aina ya ${carName}.`); };

  const onChangeDate = (event: any, selectedDate: any) => { setShowDatePicker(false); if (selectedDate) setBookingDate(selectedDate); };
  const onChangeTime = (event: any, selectedTime: any) => { setShowTimePicker(false); if (selectedTime) setBookingTime(selectedTime); };

  // ==========================================
  // RENDER SCREENS
  // ==========================================
  const renderSplash = () => (
    <View style={[styles.fullScreenBg, { justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
        <View style={styles.premiumLogoContainer}><Image source={APP_CONFIG.localLogo} style={styles.roundLogo} /></View>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 25 }}>Mo<Text style={{ color: colors.primary }}>TECH</Text>-i</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '800', letterSpacing: 3 }}>INTELLIGENT AUTO CARE</Text>
      </Animated.View>
      <ActivityIndicator size="large" color={colors.primary} style={{ position: 'absolute', bottom: 80 }} />
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.fullScreenBg}>
      <View style={{ height: height * 0.55, width: '100%' }}><Image source={{ uri: welcomeStep === 0 ? APP_CONFIG.intro1Bg : APP_CONFIG.intro2Bg }} style={StyleSheet.absoluteFillObject} /><LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={StyleSheet.absoluteFillObject} /></View>
      <View style={styles.welcomeBottomContainer}>
        <View style={styles.welcomeContent}>
          <View style={styles.iconCircle}><Feather name={welcomeStep === 0 ? 'shield' : 'alert-triangle'} size={35} color="#fff" /></View>
          <Text style={styles.welcomeTagline}>{welcomeStep === 0 ? 'Pre-Purchase Check' : '24/7 Emergency SOS'}</Text>
          <Text style={styles.welcomeDesc}>{welcomeStep === 0 ? 'Elite 150-point diagnostics before buying your next car.' : 'Towing and rapid roadside rescue anywhere, anytime.'}</Text>
        </View>
        <View style={styles.onboardingFooter}>
          <View style={styles.paginationDots}><View style={[styles.dot, welcomeStep === 0 ? styles.activeDot : {}]} /><View style={[styles.dot, welcomeStep === 1 ? styles.activeDot : {}]} /></View>
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => { if(welcomeStep === 0) setWelcomeStep(1); else setCurrentScreen('login'); }}><Text style={styles.btnTextLarge}>{welcomeStep === 1 ? 'Get Started' : 'Next'}</Text><Feather name="arrow-right" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLogin = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fullScreenBg}>
      <ScrollView contentContainerStyle={styles.loginPadding}>
        <Text style={styles.loginTitle}>{isLoginMode ? 'Welcome Back' : 'Create Account'}</Text>
        {!isLoginMode && (
          <><View style={styles.inputGroup}><Text style={styles.label}>Full Name</Text><View style={styles.inputWithIcon}><Feather name="user" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="e.g John Doe" placeholderTextColor="#475569" style={{ flex: 1, color: '#fff' }} value={fullName} onChangeText={setFullName} /></View></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Phone Number</Text><View style={styles.inputWithIcon}><Feather name="phone" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="e.g 0712345678" keyboardType="phone-pad" placeholderTextColor="#475569" style={{ flex: 1, color: '#fff' }} value={phone} onChangeText={setPhone} /></View></View></>
        )}
        <View style={styles.inputGroup}><Text style={styles.label}>Email Address</Text><View style={styles.inputWithIcon}><Feather name="mail" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="mail@domain.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#475569" style={{ flex: 1, color: '#fff' }} value={email} onChangeText={setEmail} /></View></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Password</Text><View style={styles.inputWithIcon}><Feather name="lock" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="••••••••" placeholderTextColor="#475569" secureTextEntry style={{ flex: 1, color: '#fff' }} value={password} onChangeText={setPassword} /></View></View>
        <TouchableOpacity style={styles.mainLoginBtn} onPress={isLoginMode ? handleLogin : handleRegister} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>{isLoginMode ? 'Sign In' : 'Sign Up'}</Text>}</TouchableOpacity>
        <View style={styles.dividerRow}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or continue with</Text><View style={styles.dividerLine} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 20 }}>
          <TouchableOpacity style={styles.appleBtn} onPress={() => alert('Apple Authentication inakuja hivi punde!')}><Ionicons name="logo-apple" size={22} color="#000" /><Text style={styles.appleBtnText}>Apple</Text></TouchableOpacity>
          <TouchableOpacity style={styles.googleBtn} onPress={() => alert('Google Authentication inakuja hivi punde!')}><Ionicons name="logo-google" size={22} color="#fff" /><Text style={styles.googleBtnText}>Google</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signupRow} onPress={() => setIsLoginMode(!isLoginMode)}><Text style={{ color: colors.textMuted }}>{isLoginMode ? "Don't have an account? " : "Already have an account? "}</Text><Text style={{ color: colors.primary, fontWeight: 'bold' }}>{isLoginMode ? 'Sign Up' : 'Sign In'}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderSOS = () => (
    <View style={[styles.fullScreenBg, { backgroundColor: '#140505' }]}>
      <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="x" size={28} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>Emergency Rescue</Text><View style={{ width: 28 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <View style={styles.inputGroup}><Text style={styles.label}>Your Name</Text><TextInput value={sosForm.name} style={[styles.input, { backgroundColor: '#2a1111', borderColor: '#dc2626' }]} onChangeText={t => setSosForm({...sosForm, name: t})} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Emergency Issue</Text><TextInput placeholder="e.g Puncture, Engine Smoking" placeholderTextColor="#6b2121" value={sosForm.issue} style={[styles.input, { backgroundColor: '#2a1111', borderColor: '#dc2626' }]} onChangeText={t => setSosForm({...sosForm, issue: t})} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>GPS coordinates</Text><View style={{ flexDirection: 'row', gap: 10 }}><TextInput value={sosForm.location} placeholder="Click icon to fetch GPS ->" placeholderTextColor="#6b2121" style={[styles.input, { flex: 1, backgroundColor: '#2a1111', borderColor: '#dc2626', color: '#fff' }]} editable={false} /><TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation}>{fetchingLocation ? <ActivityIndicator color="#fff" /> : <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />}</TouchableOpacity></View></View>
        <View style={{ alignItems: 'center', marginTop: 40 }}><Animated.View style={[styles.sosPulseCircle, { transform: [{ scale: pulseAnim }] }]}><TouchableOpacity style={styles.sosHugeBtn} onPress={handleSendSOS} disabled={loading}>{loading ? <ActivityIndicator color="#fff" size="large" /> : <Text style={styles.sosHugeText}>SOS</Text>}</TouchableOpacity></Animated.View></View>
      </ScrollView>
    </View>
  );

  const renderBookService = () => (
    <View style={styles.fullScreenBg}>
      <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>Book Live Service</Text><View style={{ width: 24 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        <Text style={styles.formTitle}>Select Vehicle</Text>
        {myVehicles.length === 0 ? (
          <TouchableOpacity style={styles.vehicleSelectCard} onPress={() => { setCurrentScreen('main'); setActiveTab('garage'); }}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>⚠ Hauna gari! Bonyeza hapa ukasajili gari kwanza.</Text></TouchableOpacity>
        ) : (
          <View style={styles.chipContainer}>{myVehicles.map(car => (<TouchableOpacity key={car.id} onPress={() => setSelectedVehicleId(car.id)} style={[styles.chip, selectedVehicleId === car.id && styles.chipActive]}><Text style={[styles.chipText, selectedVehicleId === car.id && styles.chipTextActive]}>{car.model} ({car.plate_number})</Text></TouchableOpacity>))}</View>
        )}
        <Text style={[styles.formTitle, { marginTop: 25 }]}>Select Service Type</Text>
        <View style={styles.chipContainer}>{['Diagnostics Scan', 'General Repair', 'Major Maintenance', 'Pre-Purchase 150-Point'].map(item => (<TouchableOpacity key={item} onPress={() => setSelectedService(item)} style={[styles.chip, selectedService === item && styles.chipActive]}><Text style={[styles.chipText, selectedService === item && styles.chipTextActive]}>{item}</Text></TouchableOpacity>))}</View>
        <Text style={[styles.formTitle, { marginTop: 25 }]}>Preferred Schedule</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}><Text style={styles.label}>Date</Text><TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowDatePicker(true)}><Feather name="calendar" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><Text style={{ color: '#fff', marginTop: 2 }}>{bookingDate.toISOString().split('T')[0]}</Text></TouchableOpacity>{showDatePicker && (<DateTimePicker value={bookingDate} mode="date" display="default" onChange={onChangeDate} />)}</View>
          <View style={{ flex: 1 }}><Text style={styles.label}>Time</Text><TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowTimePicker(true)}><Feather name="clock" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><Text style={{ color: '#fff', marginTop: 2 }}>{bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></TouchableOpacity>{showTimePicker && (<DateTimePicker value={bookingTime} mode="time" display="default" onChange={onChangeTime} />)}</View>
        </View>
        <Text style={[styles.formTitle, { marginTop: 25 }]}>Fault Notes</Text>
        <TextInput placeholder="Elezea matatizo ya gari kwa undani..." placeholderTextColor={colors.textMuted} multiline style={styles.textArea} value={bookingNotes} onChangeText={setBookingNotes} />
        <TouchableOpacity style={[styles.mainLoginBtn, { marginTop: 30 }]} onPress={handleCreateBooking} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>Confirm Live Booking</Text>}</TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderSpareParts = () => {
    const recommendedParts = spareParts.slice(0, 2);

    return (
      <View style={styles.fullScreenBg}>
        <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>OEM Spare Parts</Text><View style={{ width: 24 }} /></View>
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
          {spareParts.length === 0 ? (
             <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>Duka linapakia mzigo hivi punde...</Text>
          ) : (
            <>
              {recommendedParts.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.accent, marginBottom: 15 }]}>🔥 Recommended For You</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
                    {recommendedParts.map(part => (
                      <View key={`rec_${part.id}`} style={{ width: 220, backgroundColor: '#111a2a', borderRadius: 20, marginRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: colors.accent }}>
                        <Image source={{ uri: part.image_url }} style={{ width: '100%', height: 120, backgroundColor: '#fff' }} resizeMode="cover" />
                        <View style={{ padding: 12 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>{part.name}</Text>
                          <Text style={{ color: colors.accent, fontWeight: '900', marginTop: 5, fontSize: 16 }}>{part.price}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.sectionTitle}>All Spare Parts</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {spareParts.map(part => (
                  <View key={part.id} style={{ width: '48%', backgroundColor: '#111a2a', borderRadius: 20, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' }}>
                    <Image source={{ uri: part.image_url }} style={{ width: '100%', height: 130, backgroundColor: '#fff' }} resizeMode="cover" />
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }} numberOfLines={2}>{part.name}</Text>
                      <Text style={{ color: '#f97316', fontWeight: '900', marginTop: 5, fontSize: 15 }}>{part.price}</Text>
                      <TouchableOpacity style={{ backgroundColor: '#f97316', marginTop: 10, paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Order Part</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderShowroom = () => (
    <View style={styles.fullScreenBg}>
      <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>MoTECH-i Showroom</Text><View style={{ width: 24 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
         {showroomCars.length === 0 ? (
           <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>Hakuna magari mapya yaliyowekwa kwa sasa...</Text>
         ) : (
           showroomCars.map(car => (
             <View key={car.id} style={{ marginBottom: 25, backgroundColor: '#111a2a', borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' }}>
               <Image source={{ uri: car.image_url }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
               <View style={{ padding: 20 }}>
                 <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{car.title}</Text>
                 <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: '900', marginTop: 5 }}>{car.price}</Text>
                 <TouchableOpacity style={{ backgroundColor: '#3b82f6', marginTop: 15, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Schedule Viewing</Text></TouchableOpacity>
               </View>
             </View>
           ))
         )}
      </ScrollView>
    </View>
  );

  const renderAcademy = () => (
    <View style={styles.fullScreenBg}>
      <View style={styles.innerHeader}>
        <TouchableOpacity onPress={() => academyView === 'menu' ? setCurrentScreen('main') : setAcademyView('menu')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.innerHeaderTitle}>{academyView === 'menu' ? 'MoTECH-i Academy' : academyView === 'ai' ? 'AI Assistant' : academyView === 'manuals' ? 'Car Manuals' : 'Video Tutorials'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {academyView === 'menu' && (
        <ScrollView contentContainerStyle={{ padding: 25 }}>
           <Image source={{ uri: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' }} style={{ width: '100%', height: 180, borderRadius: 20, marginBottom: 25 }} />
           
           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('ai')}>
             <LinearGradient colors={['rgba(220,38,38,0.2)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="robot-outline" size={30} color={colors.primary} /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>MoTECH-i AI Assistant</Text><Text style={styles.academyDesc}>Uliza maswali ya kiufundi upate majibu ya papo hapo.</Text></View>
             <Feather name="chevron-right" size={24} color={colors.textMuted} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('videos')}>
             <LinearGradient colors={['rgba(59,130,246,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="play-circle-outline" size={30} color="#3b82f6" /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>Video Tutorials</Text><Text style={styles.academyDesc}>Jifunze kurekebisha matatizo madogo madogo ya gari lako.</Text></View>
             <Feather name="chevron-right" size={24} color={colors.textMuted} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('manuals')}>
             <LinearGradient colors={['rgba(16,185,129,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="book-open-page-variant" size={30} color="#10b981" /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>Car Info & Manuals</Text><Text style={styles.academyDesc}>Pata mwongozo kamili wa matunzo ya gari lako.</Text></View>
             <Feather name="chevron-right" size={24} color={colors.textMuted} />
           </TouchableOpacity>
        </ScrollView>
      )}

      {academyView === 'ai' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            {aiMessages.map(msg => (
              <View key={msg.id} style={[styles.chatBubble, msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi]}>
                {msg.role === 'ai' && <MaterialCommunityIcons name="robot" size={20} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />}
                <Text style={{ color: '#fff', fontSize: 15, flex: 1, lineHeight: 22 }}>{msg.text}</Text>
              </View>
            ))}
            {aiLoading && (<View style={[styles.chatBubble, styles.chatBubbleAi, { width: 80, alignItems: 'center' }]}><ActivityIndicator color={colors.primary} size="small" /></View>)}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput placeholder="Uliza AI swali la kiufundi hapa..." placeholderTextColor={colors.textMuted} style={styles.chatInput} value={aiInput} onChangeText={setAiInput} multiline />
            <TouchableOpacity style={styles.chatSendBtn} onPress={() => handleSendAiMessage()} disabled={aiLoading}><Feather name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ==========================================
          CAR MANUALS YENYE ICONS KWA MAGARI MENGI
          ========================================== */}
      {academyView === 'manuals' && (
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
           <Text style={styles.formTitle}>Search Car Manual</Text>
           <View style={styles.inputGroup}><View style={styles.inputWithIcon}><Feather name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="e.g Toyota Vanguard 2012" placeholderTextColor="#475569" style={{ flex: 1, color: '#fff' }} value={manualCarInfo} onChangeText={setManualCarInfo} /></View></View>
           <TouchableOpacity style={styles.mainLoginBtn} onPress={() => handleFetchManual(manualCarInfo)}><Text style={styles.mainLoginBtnText}>Search Manual</Text></TouchableOpacity>

           <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Popular Models</Text>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
             {COMMON_MANUALS.map(car => (
               <TouchableOpacity 
                  key={car.id} 
                  style={{ width: '31%', backgroundColor: '#111a2a', paddingVertical: 15, paddingHorizontal: 5, borderRadius: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' }} 
                  onPress={() => handleFetchManual(car.name)}
               >
                 <MaterialCommunityIcons name={car.icon as any} size={35} color={colors.primary} />
                 <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center', marginTop: 8 }} numberOfLines={2}>{car.name}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </ScrollView>
      )}

      {/* ==========================================
          REAL VIDEO PLAYER INAYO-PLAY LIVE KUTOKA SUPABASE
          ========================================== */}
      {academyView === 'videos' && (
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
          {academyVideos.length === 0 ? (
             <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>Hakuna mafunzo mapya yaliyowekwa...</Text>
          ) : (
             academyVideos.map(vid => (
               <View key={vid.id} style={{ marginBottom: 20, backgroundColor: '#111a2a', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' }}>
                 
                 <View style={{ width: '100%', height: 200, backgroundColor: '#000', borderRadius: 15, overflow: 'hidden' }}>
                    <Video
                      style={{ width: '100%', height: '100%' }}
                      source={{ uri: vid.video_url }}
                      useNativeControls
                      resizeMode={ResizeMode.COVER}
                    />
                 </View>

                 <View style={{ padding: 10, paddingTop: 15 }}>
                   <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{vid.title}</Text>
                   <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 5 }}>{vid.description}</Text>
                 </View>
               </View>
             ))
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderMainApp = () => (
    <View style={styles.fullScreenBg}>
      <View style={styles.header}>
        <View><Text style={styles.headerGreeting}>{activeTab === 'home' ? `Habari, ${fullName?.split(' ')[0] || userSession?.user?.email?.split('@')[0] || 'Mteja'}` : activeTab === 'garage' ? 'My Garage' : activeTab === 'history' ? 'Booking History' : 'Profile Control'}</Text><View style={styles.brandRow}><Text style={[styles.brandText, { color: colors.text }]}>Mo</Text><Text style={[styles.brandText, { color: colors.primary }]}>TECH</Text><Text style={[styles.brandText, { color: colors.text }]}>-i</Text></View></View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotif(!showNotif)}><Feather name="bell" size={22} color={colors.text} />{notifications.length > 0 && <View style={styles.notifBadge} />}</TouchableOpacity>
      </View>

      {showNotif && (
        <View style={styles.notifDropdown}>
          <Text style={styles.notifTitle}>Recent Alerts</Text>
          {notifications.map(notif => (<View key={notif.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}><View style={[styles.notifDot, { backgroundColor: notif.type === 'success' ? colors.success : colors.primary }]} /><View><Text style={styles.notifText}>{notif.title}</Text><Text style={styles.notifSub}>{notif.sub}</Text></View></View>))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {activeTab === 'home' && (
          <View><View style={styles.sectionPadding}>
              <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.welcomeBanner}>
                <View style={styles.bannerContent}><Text style={styles.bannerTitle}>Need an expert mechanic?</Text><Text style={styles.bannerDesc}>Book a service instantly from your App.</Text>
                  <View style={styles.bannerButtons}><TouchableOpacity style={styles.bookBtn} onPress={() => setCurrentScreen('book_service')}><Text style={styles.bookBtnText}>Book Now</Text></TouchableOpacity><TouchableOpacity style={styles.sosBtnSmall} onPress={() => { setSosForm({...sosForm, name: fullName}); setCurrentScreen('sos'); }}><MaterialCommunityIcons name="alert-decagram" size={16} color="#dc2626" /><Text style={styles.sosBtnText}>SOS</Text></TouchableOpacity></View></View>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80' }} style={styles.bannerImage} />
              </LinearGradient></View>
            <View style={styles.sectionPadding}><Text style={styles.sectionTitle}>Our Expert Services</Text>
              <View style={styles.servicesGrid}>
                {[{ t: 'Diagnostics', i: 'engine-outline', c: colors.accent, a: 'book_service' }, { t: 'Repair', i: 'wrench', c: colors.primary, a: 'book_service' }, { t: 'Pre-Purchase', i: 'clipboard-check-outline', c: '#10b981', a: 'book_service' }, { t: 'Spare Parts', i: 'cogs', c: '#f97316', a: 'spare_parts' }, { t: 'Showroom', i: 'car', c: '#3b82f6', a: 'showroom' }, { t: 'Academy', i: 'school-outline', c: '#a855f7', a: 'academy' }].map((item, idx) => (<TouchableOpacity key={idx} style={styles.serviceCard} onPress={() => setCurrentScreen(item.a)}><View style={[styles.serviceIconBox, { backgroundColor: item.c + '20' }]}><MaterialCommunityIcons name={item.i as any} size={26} color={item.c} /></View><Text style={styles.serviceTitle}>{item.t}</Text></TouchableOpacity>))}</View></View>
          </View>
        )}

        {activeTab === 'garage' && (
          <View style={styles.sectionPadding}>
            <TouchableOpacity style={styles.mainLoginBtn} onPress={toggleAddCarForm}><Text style={styles.mainLoginBtnText}>{showAddCarForm ? 'Close Form' : '➕ Register New Vehicle'}</Text></TouchableOpacity>
            {showAddCarForm && (<View style={styles.addCarCard}><View style={styles.inputGroup}><Text style={styles.label}>Car Model</Text><TextInput placeholder="e.g Toyota Land Cruiser" placeholderTextColor="#475569" style={styles.input} value={carModel} onChangeText={setCarModel} /></View><View style={styles.inputGroup}><Text style={styles.label}>Plate Number</Text><TextInput placeholder="e.g T 123 ABC" placeholderTextColor="#475569" style={styles.input} value={carPlate} onChangeText={setCarPlate} /></View><TouchableOpacity style={[styles.mainLoginBtn, { backgroundColor: colors.success }]} onPress={handleAddVehicle} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>Save Vehicle</Text>}</TouchableOpacity></View>)}
            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>My Registered Vehicles</Text>
            {myVehicles.length === 0 ? (<Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>Hauna gari lolote lililosajiliwa.</Text>) : (myVehicles.map(car => (<View key={car.id} style={styles.carDisplayCard}><MaterialCommunityIcons name="car-sports" size={35} color={colors.primary} /><View style={{ marginLeft: 15 }}><Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{car.model}</Text><Text style={{ color: colors.textMuted }}>Plate: {car.plate_number}</Text></View></View>)))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.sectionPadding}>
            <Text style={styles.sectionTitle}>Live Service Requests</Text>
            {myBookings.length === 0 ? (<Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>Hauna historia ya booking bado.</Text>) : (myBookings.map(b => (<View key={b.id} style={styles.bookingCard}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>{b.service_type}</Text><View style={[styles.statusBadge, { backgroundColor: b.status === 'Pending' ? '#b45309' : '#047857' }]}><Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{b.status}</Text></View></View><Text style={{ color: '#fff', marginTop: 8, fontSize: 14 }}>Vehicle: {b.vehicles?.model} [{b.vehicles?.plate_number}]</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 5 }}>Schedle: {b.booking_date} • {b.booking_time}</Text></View>)))}
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.sectionPadding}>
            {isSettingsMode ? (
              <View><View style={styles.settingsHeader}><TouchableOpacity onPress={() => setIsSettingsMode(false)}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.settingsTitle}>Account Settings</Text></View><View style={styles.inputGroup}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} /></View><View style={styles.inputGroup}><Text style={styles.label}>Phone Number</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View><TouchableOpacity style={styles.mainLoginBtn} onPress={handleUpdateProfile} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>Save Settings</Text>}</TouchableOpacity></View>
            ) : (
              <><View style={{ alignItems: 'center' }}><View style={styles.avatarContainer}><Feather name="user" size={40} color="#fff" /></View><Text style={styles.profileName}>{fullName || userSession?.user?.email?.split('@')[0] || 'Mteja'}</Text><View style={styles.planBadge}><Text style={styles.planText}>{userSession?.user?.user_metadata?.plan || 'Free'}</Text></View></View>
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Premium Subscriptions</Text>
                <View style={styles.subGrid}><TouchableOpacity style={styles.subCard} onPress={() => handleChangeSubscription('Standard', '5,000')}><Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Standard</Text><Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 20, marginTop: 5 }}>5,000/=</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 5 }}>Ufuatiliaji wa gari 1 kwa mwezi mzima.</Text></TouchableOpacity><TouchableOpacity style={styles.subCard} onPress={() => handleChangeSubscription('Premium', '10,000')}><Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Premium</Text><Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 20, marginTop: 5 }}>10,000/=</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 5 }}>Ufuatiliaji wa magari hadi 3 kwa mwezi.</Text></TouchableOpacity></View>
                <View style={{ marginTop: 30 }}><TouchableOpacity style={styles.profileOption} onPress={() => setIsSettingsMode(true)}><Feather name="settings" size={20} color="#fff" /><Text style={styles.profileOptionText}>Account Settings</Text></TouchableOpacity><TouchableOpacity style={[styles.profileOption, { borderBottomWidth: 0 }]} onPress={handleLogout}><Feather name="log-out" size={20} color={colors.primary} /><Text style={[styles.profileOptionText, { color: colors.primary }]}>Sign Out</Text></TouchableOpacity></View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navItem}><Feather name="home" size={24} color={activeTab === 'home' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'home' ? colors.primary : colors.textMuted }]}>Home</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem}><MaterialCommunityIcons name="garage" size={24} color={activeTab === 'garage' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'garage' ? colors.primary : colors.textMuted }]}>Garage</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.navItem}><Feather name="clock" size={24} color={activeTab === 'history' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'history' ? colors.primary : colors.textMuted }]}>Bookings</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navItem}><Feather name="user" size={24} color={activeTab === 'profile' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'profile' ? colors.primary : colors.textMuted }]}>Profile</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {currentScreen === 'splash' && renderSplash()}
      {currentScreen === 'welcome' && renderWelcome()}
      {currentScreen === 'login' && renderLogin()}
      {currentScreen === 'main' && renderMainApp()}
      {currentScreen === 'book_service' && renderBookService()}
      {currentScreen === 'sos' && renderSOS()}
      {currentScreen === 'spare_parts' && renderSpareParts()}
      {currentScreen === 'showroom' && renderShowroom()}
      {currentScreen === 'academy' && renderAcademy()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b12' },
  fullScreenBg: { flex: 1, backgroundColor: '#070b12' },
  premiumLogoContainer: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#dc2626', shadowOpacity: 0.8, shadowRadius: 30, elevation: 15 },
  roundLogo: { width: '100%', height: '100%', borderRadius: 85 },
  welcomeBottomContainer: { flex: 1, backgroundColor: '#070b12', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -40, paddingTop: 40 },
  skipBtn: { position: 'absolute', top: 50, right: 25, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  skipText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  welcomeContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35 },
  iconCircle: { width: 80, height: 80, backgroundColor: 'rgba(220,38,38,0.1)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  welcomeTagline: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  welcomeDesc: { color: '#94a3b8', fontSize: 15, textAlign: 'center' },
  onboardingFooter: { paddingBottom: 40, paddingHorizontal: 35 },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#334155', marginHorizontal: 5 },
  activeDot: { width: 24, backgroundColor: '#dc2626' },
  getStartedBtn: { backgroundColor: '#dc2626', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20 },
  btnTextLarge: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  loginPadding: { paddingHorizontal: 30, paddingTop: 80, paddingBottom: 50 },
  loginTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 10 },
  loginSubtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#cbd5e1', marginBottom: 10, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  input: { backgroundColor: '#111a2a', height: 60, borderRadius: 15, paddingHorizontal: 20, color: '#fff', borderWidth: 1, borderColor: '#1e293b' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111a2a', height: 60, borderRadius: 15, paddingHorizontal: 20, borderWidth: 1, borderColor: '#1e293b' },
  mainLoginBtn: { backgroundColor: '#dc2626', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainLoginBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  dividerText: { color: '#475569', paddingHorizontal: 15, fontWeight: 'bold' },
  appleBtn: { flex: 1, backgroundColor: '#fff', height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  appleBtnText: { color: '#000', fontWeight: 'bold', marginLeft: 8 },
  googleBtn: { flex: 1, backgroundColor: '#1e293b', height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  googleBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerGreeting: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  brandRow: { flexDirection: 'row' },
  brandText: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  notifBtn: { width: 45, height: 45, backgroundColor: '#111a2a', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: '#dc2626', borderRadius: 4, borderWidth: 2, borderColor: '#1e293b' },
  notifDropdown: { position: 'absolute', top: 110, right: 25, width: 280, backgroundColor: '#111a2a', borderRadius: 15, padding: 20, zIndex: 100, borderWidth: 1, borderColor: '#1e293b' },
  notifTitle: { color: '#fff', fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 10, marginBottom: 10 },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  notifText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  notifSub: { color: '#94a3b8', fontSize: 11 },
  sectionPadding: { paddingHorizontal: 25, marginTop: 25 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20 },
  welcomeBanner: { borderRadius: 30, flexDirection: 'row', overflow: 'hidden', height: 160 },
  bannerContent: { flex: 1, padding: 20, justifyContent: 'center', zIndex: 10 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 5 },
  bannerDesc: { color: '#94a3b8', fontSize: 11, marginBottom: 15 },
  bannerButtons: { flexDirection: 'row', gap: 10 },
  bookBtn: { backgroundColor: '#dc2626', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  sosBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(220,38,38,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  sosBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 12 },
  bannerImage: { position: 'absolute', right: -30, top: 0, width: 180, height: '100%', opacity: 0.5 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { width: '48%', backgroundColor: '#111a2a', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  serviceIconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  serviceTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: '#111a2a', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e293b' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  avatarContainer: { width: 100, height: 100, backgroundColor: '#1e293b', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#dc2626' },
  profileName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  planBadge: { backgroundColor: 'rgba(250, 204, 21, 0.1)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginTop: 5, borderWidth: 1, borderColor: '#facc15' },
  planText: { color: '#facc15', fontSize: 12, fontWeight: 'bold' },
  profileOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  profileOptionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  settingsTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  locationBtn: { backgroundColor: '#dc2626', width: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  sosPulseCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(220,38,38,0.2)', justifyContent: 'center', alignItems: 'center' },
  sosHugeBtn: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' },
  sosHugeText: { color: '#fff', fontSize: 35, fontWeight: '900' },
  carCard: { height: 220, borderRadius: 25, overflow: 'hidden', backgroundColor: '#111a2a' },
  carImage: { width: '100%', height: '100%' },
  carOverlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'space-between' },
  carBadgeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  plateBadge: { backgroundColor: '#facc15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  plateText: { color: '#070b12', fontSize: 12, fontWeight: '900' },
  carModel: { color: '#fff', fontSize: 24, fontWeight: '900' },
  carYear: { color: '#94a3b8', fontSize: 13 },
  addCarCard: { backgroundColor: '#111a2a', padding: 20, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: '#1e293b' },
  carDisplayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111a2a', padding: 18, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: '#1e293b' },
  formTitle: { color: '#cbd5e1', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, backgroundColor: '#111a2a', borderWidth: 1, borderColor: '#1e293b' },
  chipActive: { backgroundColor: 'rgba(220,38,38,0.1)', borderColor: '#dc2626' },
  chipText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 13 },
  chipTextActive: { color: '#dc2626' },
  textArea: { backgroundColor: '#111a2a', borderRadius: 15, padding: 15, color: '#fff', minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#1e293b' },
  bookingCard: { backgroundColor: '#111a2a', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  subGrid: { flexDirection: 'row', gap: 15, marginTop: 10 },
  subCard: { flex: 1, backgroundColor: '#111a2a', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b' },
  innerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  innerHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backBtnInner: { padding: 5 },
  academyMenuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111a2a', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  academyIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#070b12', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  academyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  academyDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 18, paddingRight: 10 },
  chatBubble: { padding: 15, borderRadius: 20, marginBottom: 15, maxWidth: '85%', flexDirection: 'row' },
  chatBubbleUser: { backgroundColor: '#dc2626', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  chatBubbleAi: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#334155' },
  chatInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#111a2a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  chatInput: { flex: 1, backgroundColor: '#070b12', color: '#fff', borderRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, minHeight: 45, maxHeight: 100, borderWidth: 1, borderColor: '#1e293b' },
  chatSendBtn: { width: 45, height: 45, backgroundColor: '#dc2626', borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
