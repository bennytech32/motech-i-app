import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
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
  useColorScheme,
  LayoutAnimation,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithAppleIdToken, signInWithGoogleOAuth } from '../../lib/socialAuth';
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

type ThemePreference = 'system' | 'light' | 'dark';
type LanguagePreference = 'en' | 'sw';
type SettingsScreen = 'settings' | 'pin' | 'device';

const THEME_PREF_KEY = 'motech_theme_preference';
const LANGUAGE_PREF_KEY = 'motech_language_preference';
const PROFILE_PHOTO_BUCKET = 'profile-photos';

const getProfilePhotoPath = (userId: string) => `${userId}/avatar`;

const SETTINGS_TEXT = {
  en: {
    preferences: 'Preferences',
    settings: 'Settings',
    profile: 'Profile',
    changePhoto: 'Change Photo',
    remove: 'Remove',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    saveSettings: 'Save Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    useDeviceMode: 'Use Device Mode',
    language: 'Language',
    deviceModeHint: 'Device is currently using {{mode}} mode.',
    security: 'Security',
    biometricVerification: 'Biometric Verification',
    biometricLogin: 'Biometric Login',
    updatePin: 'Update Password',
    deviceSession: 'Device & Session',
    myDevice: 'My Device',
    logout: 'Logout',
    changePin: 'Change Password',
    oldPin: 'Old Password',
    newPin: 'New Password',
    confirmPin: 'Confirm Password',
    pinHint: 'Password must contain letters and numbers.',
    oldPasswordPlaceholder: 'Enter old password',
    newPasswordPlaceholder: 'Letters and numbers',
    confirmPasswordPlaceholder: 'Confirm password',
    proceed: 'Proceed',
    secureFooter: 'Encrypted & Secured',
    deviceSettings: 'Settings',
    os: 'OS',
    name: 'name',
    systemName: 'system Name',
    systemVersion: 'system Version',
    model: 'model',
    isPhysicalDevice: 'is Physical Device',
    unlinkHint: 'Unlinking this device will require signing in again.',
    unlinkDevice: 'Unlink Device',
    light: 'Light',
    dark: 'Dark',
    appTagline: 'INTELLIGENT AUTO CARE',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    emailAddress: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    orContinueWith: 'or continue with',
    noAccount: "Don't have an account? ",
    haveAccount: 'Already have an account? ',
    registerRequired: 'Please fill all fields.',
    registerSuccess: 'Registration complete. Please sign in.',
    loginRequired: 'Please enter email and password.',
    profileRequired: 'These fields cannot be empty.',
    profileSaved: 'Changes saved.',
    authNetworkError: 'Failed to connect to Supabase Auth. Check Supabase URL/API key and internet connection.',
    prePurchaseCheck: 'Pre-Purchase Check',
    emergencySos: '24/7 Emergency SOS',
    welcomeDesc1: 'Elite 150-point diagnostics before buying your next car.',
    welcomeDesc2: 'Towing and rapid roadside rescue anywhere, anytime.',
    next: 'Next',
    getStarted: 'Get Started',
    emergencyRescue: 'Emergency Rescue',
    yourName: 'Your Name',
    emergencyIssue: 'Emergency Issue',
    gpsCoordinates: 'GPS Coordinates',
    gpsPlaceholder: 'Tap icon to fetch GPS',
    sosRequired: 'Fill the form and tap the GPS button first.',
    gpsPermission: 'Allow GPS access on your phone first.',
    gpsFailed: 'Failed to read GPS.',
    sosSent: 'SOS signal sent. Rescue team is on the way.',
    sosFailed: 'Failed to send SOS. Try again.',
    bookLiveService: 'Book Live Service',
    selectVehicle: 'Select Vehicle',
    noVehicleBook: 'No vehicle yet. Tap here to register one first.',
    selectServiceType: 'Select Service Type',
    preferredSchedule: 'Preferred Schedule',
    date: 'Date',
    time: 'Time',
    faultNotes: 'Fault Notes',
    faultNotesPlaceholder: 'Describe the vehicle problem in detail...',
    confirmBooking: 'Confirm Live Booking',
    bookingRequired: 'Please choose a vehicle and service type.',
    bookingSent: 'Booking sent successfully.',
    home: 'Home',
    garage: 'Garage',
    bookings: 'Bookings',
    recentAlerts: 'Recent Alerts',
    hello: 'Hello',
    customer: 'Customer',
    myGarage: 'My Garage',
    bookingHistory: 'Booking History',
    profileControl: 'Profile Control',
    expertMechanic: 'Need an expert mechanic?',
    bookInstantly: 'Book a service instantly from your app.',
    bookNow: 'Book Now',
    expertServices: 'Our Expert Services',
    diagnostics: 'Diagnostics',
    repair: 'Repair',
    prePurchase: 'Pre-Purchase',
    spareParts: 'Spare Parts',
    showroom: 'Showroom',
    academy: 'Academy',
    closeForm: 'Close Form',
    registerVehicle: 'Register New Vehicle',
    carModel: 'Car Model',
    plateNumber: 'Plate Number',
    saveVehicle: 'Save Vehicle',
    registeredVehicles: 'My Registered Vehicles',
    noVehicles: 'No registered vehicles yet.',
    vehiclePlate: 'Plate',
    liveServiceRequests: 'Live Service Requests',
    noBookings: 'No booking history yet.',
    vehicle: 'Vehicle',
    schedule: 'Schedule',
    premiumSubscriptions: 'Premium Subscriptions',
    oneCarPlan: 'Track 1 vehicle for the whole month.',
    threeCarPlan: 'Track up to 3 vehicles per month.',
    accountSettings: 'Account Settings',
    signOut: 'Sign Out',
    confirmSubscriptionTitle: 'Confirm Subscription',
    confirmSubscriptionMessage: 'Do you want to subscribe to {{plan}} for TZS {{price}}/month?',
    cancel: 'Cancel',
    yesPay: 'Yes, Pay',
    subscriptionSuccess: 'You have successfully joined {{plan}}.',
    subscriptionChanged: 'New Subscription',
    subscriptionChangedSub: 'You are now on {{plan}}',
    subscriptionFailed: 'Failed to change subscription.',
    vehicleProfileRequired: 'Please sign in again before registering a vehicle.',
    vehicleRequired: 'Enter vehicle model and plate number.',
    vehicleAdded: 'Vehicle registered in your garage.',
    vehicleAddedTitle: 'Vehicle Registered',
    vehicleAddedSub: '{{model}} has been added.',
    oemSpareParts: 'OEM Spare Parts',
    shopLoading: 'Shop inventory is loading soon...',
    recommendedForYou: 'Recommended For You',
    allSpareParts: 'All Spare Parts',
    orderPart: 'Order Part',
    showroomTitle: 'MoTECH-i Showroom',
    noShowroomCars: 'No new vehicles have been posted yet.',
    scheduleViewing: 'Schedule Viewing',
    aiAssistant: 'AI Assistant',
    carManuals: 'Car Manuals',
    videoTutorials: 'Video Tutorials',
    aiAssistantTitle: 'MoTECH-i AI Assistant',
    aiAssistantDesc: 'Ask technical questions and get instant answers.',
    videoTutorialsDesc: 'Learn how to fix small vehicle problems.',
    carManualsTitle: 'Car Info & Manuals',
    carManualsDesc: 'Get a complete maintenance guide for your vehicle.',
    aiInitialMessage: 'Hi! I am MoTECH-i AI. Ask me any technical question about your vehicle, or choose a manual from the list.',
    aiPlaceholder: 'Ask AI a technical question here...',
    aiBackendFallback: 'Sorry, backend is not available.',
    aiConnectionFailed: 'Failed to connect to backend',
    manualPrompt: 'Give me a short maintenance manual and key things to consider for a {{car}}.',
    searchCarManual: 'Search Car Manual',
    searchManual: 'Search Manual',
    popularModels: 'Popular Models',
    noVideos: 'No new tutorials have been posted yet.',
    welcomeNotificationTitle: 'Welcome to MoTECH-i',
    welcomeNotificationSub: 'Your account is ready.',
    appleComingSoon: 'Apple Authentication is coming soon.',
    googleComingSoon: 'Google Authentication is coming soon.',
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    socialLoginFailed: 'Social sign-in failed. Please try again.',
    googleLoginFailed: 'Google sign-in failed. Please try again.',
    appleLoginFailed: 'Apple sign-in failed. Please try again.',
    photoUploadSoon: 'Profile photo upload is coming soon.',
    photoRemoveSoon: 'Profile photo remove is coming soon.',
    photoPermissionRequired: 'Allow photo library access to change your profile picture.',
    photoUploadSuccess: 'Profile photo updated.',
    photoUploadFailed: 'Failed to upload profile photo.',
    photoRemoveSuccess: 'Profile photo removed.',
    photoRemoveFailed: 'Failed to remove profile photo.',
    signInForPhoto: 'Please sign in again before changing your profile photo.',
    biometricSoon: 'Biometric verification is coming soon.',
    biometricLoginSoon: 'Biometric login is coming soon.',
    passwordMismatch: 'New password and confirmation do not match.',
    oldPasswordIncorrect: 'Old password is not correct.',
    passwordUpdated: 'Password updated successfully.',
    passwordUpdateFailed: 'Failed to update password.',
    unlinkPrompt: 'You will be signed out on this device. Continue?',
    diagnosticsScan: 'Diagnostics Scan',
    generalRepair: 'General Repair',
    majorMaintenance: 'Major Maintenance',
    prePurchase150: 'Pre-Purchase 150-Point',
  },
  sw: {
    preferences: 'Mapendeleo',
    settings: 'Mipangilio',
    profile: 'Wasifu',
    changePhoto: 'Badili Picha',
    remove: 'Ondoa',
    fullName: 'Jina Kamili',
    phoneNumber: 'Namba ya Simu',
    saveSettings: 'Hifadhi Mipangilio',
    appearance: 'Muonekano',
    darkMode: 'Hali ya Giza',
    useDeviceMode: 'Tumia Hali ya Kifaa',
    language: 'Lugha',
    deviceModeHint: 'Kifaa kinatumia hali ya {{mode}}.',
    security: 'Usalama',
    biometricVerification: 'Uthibitisho wa Biometriki',
    biometricLogin: 'Kuingia kwa Biometriki',
    updatePin: 'Badili Nenosiri',
    deviceSession: 'Kifaa & Kipindi',
    myDevice: 'Kifaa Changu',
    logout: 'Toka',
    changePin: 'Badili Nenosiri',
    oldPin: 'Nenosiri la Zamani',
    newPin: 'Nenosiri Jipya',
    confirmPin: 'Thibitisha Nenosiri',
    pinHint: 'Nenosiri lazima liwe na herufi na namba.',
    oldPasswordPlaceholder: 'Weka nenosiri la zamani',
    newPasswordPlaceholder: 'Herufi na namba',
    confirmPasswordPlaceholder: 'Thibitisha nenosiri',
    proceed: 'Endelea',
    secureFooter: 'Imelindwa & Salama | Inaendeshwa na PBZ BANK',
    deviceSettings: 'Mipangilio',
    os: 'OS',
    name: 'jina',
    systemName: 'jina la mfumo',
    systemVersion: 'toleo la mfumo',
    model: 'modeli',
    isPhysicalDevice: 'ni kifaa halisi',
    unlinkHint: 'Ukiondoa kifaa hiki utahitaji kuingia tena.',
    unlinkDevice: 'Ondoa Kifaa',
    light: 'Mwanga',
    dark: 'Giza',
    appTagline: 'HUDUMA JANJA YA MAGARI',
    welcomeBack: 'Karibu Tena',
    createAccount: 'Fungua Akaunti',
    emailAddress: 'Barua Pepe',
    password: 'Nenosiri',
    signIn: 'Ingia',
    signUp: 'Jisajili',
    orContinueWith: 'au endelea kwa',
    noAccount: 'Huna akaunti? ',
    haveAccount: 'Tayari una akaunti? ',
    registerRequired: 'Tafadhali jaza nafasi zote.',
    registerSuccess: 'Usajili umekamilika. Sasa ingia.',
    loginRequired: 'Tafadhali jaza barua pepe na nenosiri.',
    profileRequired: 'Nafasi hizi haziwezi kuwa wazi.',
    profileSaved: 'Mabadiliko yamehifadhiwa.',
    authNetworkError: 'Imeshindwa kuunganishwa na Supabase Auth. Hakikisha Supabase URL/API key ni sahihi na simu ina internet.',
    prePurchaseCheck: 'Ukaguzi Kabla ya Kununua',
    emergencySos: 'SOS ya Dharura 24/7',
    welcomeDesc1: 'Ukaguzi wa vipengele 150 kabla ya kununua gari lako.',
    welcomeDesc2: 'Msaada wa kuvuta gari na dharura barabarani wakati wowote.',
    next: 'Endelea',
    getStarted: 'Anza',
    emergencyRescue: 'Msaada wa Dharura',
    yourName: 'Jina Lako',
    emergencyIssue: 'Tatizo la Dharura',
    gpsCoordinates: 'Viashiria vya GPS',
    gpsPlaceholder: 'Bonyeza ikoni kupata GPS',
    sosRequired: 'Jaza fomu yote na ubonyeze kitufe cha GPS kwanza.',
    gpsPermission: 'Ruhusu GPS kwenye simu yako kwanza.',
    gpsFailed: 'Imeshindwa kusoma GPS.',
    sosSent: 'SOS imetumwa. Timu ya uokoaji inakuja.',
    sosFailed: 'Imeshindwa kutuma SOS. Jaribu tena.',
    bookLiveService: 'Weka Booking ya Huduma',
    selectVehicle: 'Chagua Gari',
    noVehicleBook: 'Huna gari bado. Bonyeza hapa ukasajili gari kwanza.',
    selectServiceType: 'Chagua Aina ya Huduma',
    preferredSchedule: 'Muda Unaopendelea',
    date: 'Tarehe',
    time: 'Muda',
    faultNotes: 'Maelezo ya Tatizo',
    faultNotesPlaceholder: 'Elezea tatizo la gari kwa undani...',
    confirmBooking: 'Thibitisha Booking',
    bookingRequired: 'Tafadhali chagua gari na aina ya huduma.',
    bookingSent: 'Booking imetumwa kikamilifu.',
    home: 'Nyumbani',
    garage: 'Garage',
    bookings: 'Booking',
    recentAlerts: 'Taarifa za Karibuni',
    hello: 'Habari',
    customer: 'Mteja',
    myGarage: 'Garage Yangu',
    bookingHistory: 'Historia ya Booking',
    profileControl: 'Wasifu',
    expertMechanic: 'Unahitaji fundi mtaalamu?',
    bookInstantly: 'Weka booking ya huduma moja kwa moja kwenye app.',
    bookNow: 'Book Sasa',
    expertServices: 'Huduma Zetu',
    diagnostics: 'Uchunguzi',
    repair: 'Matengenezo',
    prePurchase: 'Kabla ya Kununua',
    spareParts: 'Vipuri',
    showroom: 'Showroom',
    academy: 'Academy',
    closeForm: 'Funga Fomu',
    registerVehicle: 'Sajili Gari Jipya',
    carModel: 'Aina ya Gari',
    plateNumber: 'Namba ya Gari',
    saveVehicle: 'Hifadhi Gari',
    registeredVehicles: 'Magari Yangu Yaliyosajiliwa',
    noVehicles: 'Huna gari lolote lililosajiliwa.',
    vehiclePlate: 'Namba',
    liveServiceRequests: 'Maombi ya Huduma',
    noBookings: 'Huna historia ya booking bado.',
    vehicle: 'Gari',
    schedule: 'Ratiba',
    premiumSubscriptions: 'Vifurushi Maalum',
    oneCarPlan: 'Ufuatiliaji wa gari 1 kwa mwezi mzima.',
    threeCarPlan: 'Ufuatiliaji wa magari hadi 3 kwa mwezi.',
    accountSettings: 'Mipangilio ya Akaunti',
    signOut: 'Toka',
    confirmSubscriptionTitle: 'Thibitisha Kifurushi',
    confirmSubscriptionMessage: 'Unataka kujiunga na {{plan}} kwa TZS {{price}}/mwezi?',
    cancel: 'Ghairi',
    yesPay: 'Ndio, Lipia',
    subscriptionSuccess: 'Umejiunga kikamilifu na {{plan}}.',
    subscriptionChanged: 'Kifurushi Kipya',
    subscriptionChangedSub: 'Sasa upo kwenye {{plan}}',
    subscriptionFailed: 'Imeshindikana kubadilisha kifurushi.',
    vehicleProfileRequired: 'Tafadhali ingia tena kabla ya kusajili gari.',
    vehicleRequired: 'Jaza aina na namba ya gari.',
    vehicleAdded: 'Gari limesajiliwa kwenye garage yako.',
    vehicleAddedTitle: 'Gari Limesajiliwa',
    vehicleAddedSub: '{{model}} imeongezwa.',
    oemSpareParts: 'Vipuri Halisi vya OEM',
    shopLoading: 'Duka linapakia mzigo hivi punde...',
    recommendedForYou: 'Vinavyopendekezwa Kwako',
    allSpareParts: 'Vipuri Vyote',
    orderPart: 'Agiza Kipuri',
    showroomTitle: 'Showroom ya MoTECH-i',
    noShowroomCars: 'Hakuna magari mapya yaliyowekwa kwa sasa.',
    scheduleViewing: 'Panga Kuona Gari',
    aiAssistant: 'Msaidizi wa AI',
    carManuals: 'Manual za Magari',
    videoTutorials: 'Mafunzo ya Video',
    aiAssistantTitle: 'Msaidizi wa AI wa MoTECH-i',
    aiAssistantDesc: 'Uliza maswali ya kiufundi upate majibu ya papo hapo.',
    videoTutorialsDesc: 'Jifunze kurekebisha matatizo madogo ya gari lako.',
    carManualsTitle: 'Taarifa & Manual za Gari',
    carManualsDesc: 'Pata mwongozo kamili wa matunzo ya gari lako.',
    aiInitialMessage: 'Habari! Mimi ni MoTECH-i AI. Niulize swali lolote la kiufundi kuhusu gari lako, au chagua Manual kwenye orodha.',
    aiPlaceholder: 'Uliza AI swali la kiufundi hapa...',
    aiBackendFallback: 'Samahani, backend haipatikani.',
    aiConnectionFailed: 'Imeshindwa kuunganishwa na backend',
    manualPrompt: 'Nipe mwongozo mfupi wa matunzo na mambo ya kuzingatia kwa gari aina ya {{car}}.',
    searchCarManual: 'Tafuta Manual ya Gari',
    searchManual: 'Tafuta Manual',
    popularModels: 'Modeli Maarufu',
    noVideos: 'Hakuna mafunzo mapya yaliyowekwa.',
    welcomeNotificationTitle: 'Karibu MoTECH-i',
    welcomeNotificationSub: 'Akaunti yako ipo tayari.',
    appleComingSoon: 'Apple Authentication inakuja hivi punde.',
    googleComingSoon: 'Google Authentication inakuja hivi punde.',
    continueWithApple: 'Endelea na Apple',
    continueWithGoogle: 'Endelea na Google',
    socialLoginFailed: 'Kuingia kwa akaunti ya mtandao kumeshindikana. Jaribu tena.',
    googleLoginFailed: 'Kuingia kwa Google kumeshindikana. Jaribu tena.',
    appleLoginFailed: 'Kuingia kwa Apple kumeshindikana. Jaribu tena.',
    photoUploadSoon: 'Kupakia picha ya wasifu kunakuja hivi punde.',
    photoRemoveSoon: 'Kuondoa picha ya wasifu kunakuja hivi punde.',
    photoPermissionRequired: 'Ruhusu app kufikia picha ili ubadili picha ya wasifu.',
    photoUploadSuccess: 'Picha ya wasifu imebadilishwa.',
    photoUploadFailed: 'Imeshindikana kupakia picha ya wasifu.',
    photoRemoveSuccess: 'Picha ya wasifu imeondolewa.',
    photoRemoveFailed: 'Imeshindikana kuondoa picha ya wasifu.',
    signInForPhoto: 'Tafadhali ingia tena kabla ya kubadili picha ya wasifu.',
    biometricSoon: 'Biometriki inakuja hivi punde.',
    biometricLoginSoon: 'Kuingia kwa biometriki kunakuja hivi punde.',
    passwordMismatch: 'Manenosiri mapya hayafanani.',
    oldPasswordIncorrect: 'Nenosiri la zamani si sahihi.',
    passwordUpdated: 'Nenosiri limebadilishwa kikamilifu.',
    passwordUpdateFailed: 'Imeshindikana kubadili nenosiri.',
    unlinkPrompt: 'Utaondolewa kwenye akaunti hii kwenye kifaa hiki. Endelea?',
    diagnosticsScan: 'Ukaguzi wa Gari',
    generalRepair: 'Matengenezo ya Kawaida',
    majorMaintenance: 'Matengenezo Makubwa',
    prePurchase150: 'Ukaguzi wa Vipengele 150',
  },
};

const THEME_COLORS = {
  dark: {
    bg: '#070b12',
    card: '#111a2a',
    primary: '#dc2626',
    secondary: '#1e293b',
    border: '#1e293b',
    accent: '#facc15',
    text: '#ffffff',
    textMuted: '#94a3b8',
    placeholder: '#64748b',
    inputBg: '#111a2a',
    success: '#10b981',
    banner: ['#1e293b', '#0f172a'] as const,
    statusBar: 'light-content' as const,
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    primary: '#dc2626',
    secondary: '#e2e8f0',
    border: '#e2e8f0',
    accent: '#b45309',
    text: '#0f172a',
    textMuted: '#64748b',
    placeholder: '#94a3b8',
    inputBg: '#ffffff',
    success: '#059669',
    banner: ['#ffffff', '#e2e8f0'] as const,
    statusBar: 'dark-content' as const,
  },
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
  const systemColorScheme = useColorScheme();
  const [currentScreen, setCurrentScreen] = useState('splash'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [welcomeStep, setWelcomeStep] = useState(0); 
  const [selectedService, setSelectedService] = useState('');
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSettingsMode, setIsSettingsMode] = useState(false); 
  const [settingsScreen, setSettingsScreen] = useState<SettingsScreen>('settings');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [profilePhotoLoading, setProfilePhotoLoading] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });

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

  const activeTheme = themePreference === 'system' ? (systemColorScheme === 'light' ? 'light' : 'dark') : themePreference;
  const colors = THEME_COLORS[activeTheme];
  const isDarkTheme = activeTheme === 'dark';
  const themedScreen = { backgroundColor: colors.bg };
  const themedCard = { backgroundColor: colors.card, borderColor: colors.border };
  const themedInput = { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text };
  const deviceName = Constants.deviceName || `${Platform.OS === 'ios' ? 'iPhone' : 'Android'} device`;
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const t = SETTINGS_TEXT[languagePreference];
  const localizedDeviceMode = isDarkTheme ? t.dark : t.light;
  const pinStorageKey = `motech_user_security_password_${userSession?.user?.id || 'guest'}`;
  const deviceInfo = [
    { label: t.os, value: Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS },
    { label: t.name, value: deviceName },
    { label: t.systemName, value: Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS },
    { label: t.systemVersion, value: String(Platform.Version) },
    { label: t.model, value: Constants.deviceName || Constants.expoConfig?.name || 'MoTECH-i device' },
    { label: t.isPhysicalDevice, value: String(Constants.isDevice) },
  ];

  const pulseAnim = useRef(new Animated.Value(1)).current; 

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREF_KEY).then(savedTheme => {
      if (savedTheme === 'system' || savedTheme === 'light' || savedTheme === 'dark') {
        setThemePreference(savedTheme);
      }
    });
    AsyncStorage.getItem(LANGUAGE_PREF_KEY).then(savedLanguage => {
      if (savedLanguage === 'en' || savedLanguage === 'sw') {
        setLanguagePreference(savedLanguage);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) {
        setFullName(session.user.user_metadata?.full_name || '');
        setPhone(session.user.user_metadata?.phone_number || '');
        setProfilePhotoUrl(session.user.user_metadata?.avatar_url || '');
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
        setProfilePhotoUrl(session.user.user_metadata?.avatar_url || '');
        fetchUserData(session.user.id);
        setCurrentScreen('main');
      } else {
        setMyVehicles([]);
        setMyBookings([]);
        setProfilePhotoUrl('');
      }
    });
    fetchPublicData();
    return () => subscription.unsubscribe();
  }, []);

  const handleThemePreferenceChange = async (nextTheme: ThemePreference) => {
    setThemePreference(nextTheme);
    await AsyncStorage.setItem(THEME_PREF_KEY, nextTheme);
  };

  const handleLanguagePreferenceChange = async (nextLanguage: LanguagePreference) => {
    setLanguagePreference(nextLanguage);
    setShowLanguageMenu(false);
    await AsyncStorage.setItem(LANGUAGE_PREF_KEY, nextLanguage);
  };

  const toggleManualTheme = () => {
    handleThemePreferenceChange(isDarkTheme ? 'light' : 'dark');
  };

  useEffect(() => {
    if (currentScreen === 'sos' || currentScreen === 'splash') {
      Animated.loop(Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])).start();
    } else { pulseAnim.stopAnimation(); }
  }, [currentScreen]);

  useEffect(() => {
    setAiMessages(messages => messages.length === 1 && messages[0].id === 1
      ? [{ id: 1, role: 'ai', text: t.aiInitialMessage }]
      : messages
    );
    setNotifications(items => items.length === 1 && items[0].id === 1
      ? [{ id: 1, title: t.welcomeNotificationTitle, sub: t.welcomeNotificationSub, type: 'success' }]
      : items
    );
  }, [languagePreference, t.aiInitialMessage, t.welcomeNotificationSub, t.welcomeNotificationTitle]);

  const fetchUserData = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone_number, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone_number || '');
      setProfilePhotoUrl(profile.avatar_url || '');
    }
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
    if (!email || !password || !fullName || !phone) { alert(t.registerRequired); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName, phone_number: phone, plan: 'Free' } } });
      if (error) throw error;
      alert(t.registerSuccess);
      setIsLoginMode(true);
    } catch (error: any) {
      const message = error?.message === 'Network request failed'
        ? t.authNetworkError
        : error.message;
      alert(message);
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!email || !password) { alert(t.loginRequired); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.session?.user?.id) await fetchUserData(data.session.user.id);
      setCurrentScreen('main');
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const completeSocialLogin = async (session: any, socialFullName?: string | null) => {
    if (!session?.user?.id) throw new Error(t.socialLoginFailed);

    const user = session.user;
    const profileName =
      socialFullName ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      fullName ||
      null;

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profileName,
        phone_number: user.user_metadata?.phone_number || phone || null,
        plan: user.user_metadata?.plan || 'Free',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      });

    if (profileError) throw profileError;

    setUserSession(session);
    setFullName(profileName || '');
    setPhone(user.user_metadata?.phone_number || '');
    setProfilePhotoUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
    await fetchUserData(user.id);
    setCurrentScreen('main');
  };

  const handleGoogleLogin = async () => {
    if (loading || socialLoading) return;
    setSocialLoading('google');
    try {
      const { session, canceled } = await signInWithGoogleOAuth();
      if (canceled) return;
      await completeSocialLogin(session);
    } catch (error: any) {
      alert(error?.message || t.googleLoginFailed);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    if (loading || socialLoading) return;
    setSocialLoading('apple');
    try {
      const { session, fullName: appleFullName } = await signInWithAppleIdToken();
      await completeSocialLogin(session, appleFullName);
    } catch (error: any) {
      if (error?.code !== 'ERR_REQUEST_CANCELED') {
        alert(error?.message || t.appleLoginFailed);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName || !phone) { alert(t.profileRequired); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone_number: phone } });
      if (error) throw error;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phone })
        .eq('id', userSession?.user?.id);
      if (profileError) throw profileError;
      alert(t.profileSaved);
      setIsSettingsMode(false);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const saveProfilePhotoUrl = async (userId: string, avatarUrl: string | null) => {
    const { error: authError } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
    if (profileError) throw profileError;
  };

  const handleChangeProfilePhoto = async () => {
    const userId = userSession?.user?.id;
    if (!userId) { alert(t.signInForPhoto); return; }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert(t.photoPermissionRequired);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setProfilePhotoLoading(true);
    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const path = getProfilePhotoPath(userId);
      const contentType = asset.mimeType || 'image/jpeg';

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_PHOTO_BUCKET)
        .upload(path, blob, { contentType, upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      await saveProfilePhotoUrl(userId, publicUrl);
      setProfilePhotoUrl(publicUrl);
      alert(t.photoUploadSuccess);
    } catch (error: any) {
      alert(error.message || t.photoUploadFailed);
    } finally {
      setProfilePhotoLoading(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    const userId = userSession?.user?.id;
    if (!userId) { alert(t.signInForPhoto); return; }

    setProfilePhotoLoading(true);
    try {
      await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([getProfilePhotoPath(userId)]);
      await saveProfilePhotoUrl(userId, null);
      setProfilePhotoUrl('');
      alert(t.photoRemoveSuccess);
    } catch (error: any) {
      alert(error.message || t.photoRemoveFailed);
    } finally {
      setProfilePhotoLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(pinForm.newPin) || !passwordRegex.test(pinForm.confirmPin)) {
      alert(t.pinHint);
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      alert(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const savedPin = await AsyncStorage.getItem(pinStorageKey);
      if (savedPin && pinForm.oldPin !== savedPin) {
        alert(t.oldPasswordIncorrect);
        return;
      }
      await AsyncStorage.setItem(pinStorageKey, pinForm.newPin);
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
      alert(t.passwordUpdated);
      setSettingsScreen('settings');
    } catch (error: any) {
      alert(error.message || t.passwordUpdateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkDevice = async () => {
    Alert.alert(
      t.unlinkDevice,
      t.unlinkPrompt,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.unlinkDevice, style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleChangeSubscription = async (planName: string, price: string) => {
    Alert.alert(t.confirmSubscriptionTitle, t.confirmSubscriptionMessage.replace('{{plan}}', planName).replace('{{price}}', price), [
      { text: t.cancel },
      { text: t.yesPay, onPress: async () => {
          setLoading(true);
          const { error } = await supabase.auth.updateUser({ data: { plan: planName } });
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: planName })
            .eq('id', userSession?.user?.id);
          if (!error && !profileError) {
            alert(t.subscriptionSuccess.replace('{{plan}}', planName));
            setNotifications([{ id: Date.now(), title: t.subscriptionChanged, sub: t.subscriptionChangedSub.replace('{{plan}}', planName), type: 'success' }, ...notifications]);
          } else {
            alert(error?.message || profileError?.message || t.subscriptionFailed);
          }
          setLoading(false);
        }}
    ]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setCurrentScreen('login'); setIsSettingsMode(false); setSettingsScreen('settings'); setWelcomeStep(0); };

  const toggleAddCarForm = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowAddCarForm(!showAddCarForm); };

  const ensureUserProfile = async () => {
    const user = userSession?.user;
    if (!user?.id) throw new Error(t.vehicleProfileRequired);

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
    if (!carModel || !carPlate) { alert(t.vehicleRequired); return; }
    setLoading(true);
    try {
      const userId = await ensureUserProfile();
      const { error } = await supabase.from('vehicles').insert([{ user_id: userId, model: carModel, plate_number: carPlate }]);
      if (error) throw error;
      alert(t.vehicleAdded);
      setCarModel(''); setCarPlate(''); toggleAddCarForm(); fetchUserData(userSession.user.id);
      setNotifications([{ id: Date.now(), title: t.vehicleAddedTitle, sub: t.vehicleAddedSub.replace('{{model}}', carModel), type: 'success' }, ...notifications]);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleCreateBooking = async () => {
    if (!selectedVehicleId || !selectedService) { alert(t.bookingRequired); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert([{ user_id: userSession?.user?.id, vehicle_id: selectedVehicleId, service_type: selectedService, booking_date: bookingDate.toISOString().split('T')[0], booking_time: bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), notes: bookingNotes }]);
      if (error) throw error;
      alert(t.bookingSent);
      setSelectedService(''); setBookingNotes(''); fetchUserData(userSession.user.id); setCurrentScreen('main'); setActiveTab('history'); 
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  };

  const handleGetLocation = async () => {
    setFetchingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert(t.gpsPermission); setFetchingLocation(false); return; }
      let location = await Location.getCurrentPositionAsync({});
      setSosForm({ ...sosForm, location: `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}` });
    } catch (error) { alert(t.gpsFailed); } finally { setFetchingLocation(false); }
  };

  const handleSendSOS = async () => {
    if (!sosForm.location || !sosForm.name || !sosForm.issue) { alert(t.sosRequired); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('sos_requests').insert([{ user_id: userSession?.user?.id || null, customer_name: sosForm.name, issue: sosForm.issue, coordinates: sosForm.location, status: 'Pending' }]);
      if (error) throw error;
      alert(t.sosSent); setCurrentScreen('main');
    } catch (error: any) { alert(error.message || t.sosFailed); } finally { setLoading(false); }
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
      setAiMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply || t.aiBackendFallback }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: `⚠ ${t.aiConnectionFailed} (${BACKEND_URL}).` }]);
    } finally { setAiLoading(false); }
  };

  const handleFetchManual = (carName: string) => { setAcademyView('ai'); handleSendAiMessage(t.manualPrompt.replace('{{car}}', carName)); };

  const onChangeDate = (event: any, selectedDate: any) => { setShowDatePicker(false); if (selectedDate) setBookingDate(selectedDate); };
  const onChangeTime = (event: any, selectedTime: any) => { setShowTimePicker(false); if (selectedTime) setBookingTime(selectedTime); };

  // ==========================================
  // RENDER SCREENS
  // ==========================================
  const renderSplash = () => (
    <View style={[styles.fullScreenBg, themedScreen, { justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
        <View style={styles.premiumLogoContainer}><Image source={APP_CONFIG.localLogo} style={styles.roundLogo} /></View>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 25 }}>Mo<Text style={{ color: colors.primary }}>TECH</Text>-i</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '800', letterSpacing: 3 }}>{t.appTagline}</Text>
      </Animated.View>
      <ActivityIndicator size="large" color={colors.primary} style={{ position: 'absolute', bottom: 80 }} />
    </View>
  );

  const renderWelcome = () => (
    <View style={[styles.fullScreenBg, themedScreen]}>
      <View style={{ height: height * 0.55, width: '100%' }}><Image source={{ uri: welcomeStep === 0 ? APP_CONFIG.intro1Bg : APP_CONFIG.intro2Bg }} style={StyleSheet.absoluteFillObject} /><LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={StyleSheet.absoluteFillObject} /></View>
      <View style={[styles.welcomeBottomContainer, themedScreen]}>
        <View style={styles.welcomeContent}>
          <View style={styles.iconCircle}><Feather name={welcomeStep === 0 ? 'shield' : 'alert-triangle'} size={35} color="#fff" /></View>
          <Text style={[styles.welcomeTagline, { color: colors.text }]}>{welcomeStep === 0 ? t.prePurchaseCheck : t.emergencySos}</Text>
          <Text style={[styles.welcomeDesc, { color: colors.textMuted }]}>{welcomeStep === 0 ? t.welcomeDesc1 : t.welcomeDesc2}</Text>
        </View>
        <View style={styles.onboardingFooter}>
          <View style={styles.paginationDots}><View style={[styles.dot, welcomeStep === 0 ? styles.activeDot : {}]} /><View style={[styles.dot, welcomeStep === 1 ? styles.activeDot : {}]} /></View>
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => { if(welcomeStep === 0) setWelcomeStep(1); else setCurrentScreen('login'); }}><Text style={styles.btnTextLarge}>{welcomeStep === 1 ? t.getStarted : t.next}</Text><Feather name="arrow-right" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderThemeToggle = () => (
    <TouchableOpacity
      style={[styles.authThemeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={toggleManualTheme}
      activeOpacity={0.85}
    >
      <Feather name={isDarkTheme ? 'moon' : 'sun'} size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderSwitch = (enabled: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.settingsSwitch,
        { backgroundColor: enabled ? colors.primary : colors.secondary },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.settingsSwitchThumb, enabled && styles.settingsSwitchThumbOn]} />
    </TouchableOpacity>
  );

  const renderSettingsRow = (
    label: string,
    right: React.ReactNode,
    onPress?: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.settingsRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <Text style={[styles.settingsRowLabel, { color: colors.text }]}>{label}</Text>
      {right}
    </TouchableOpacity>
  );

  const renderSettingsSubHeader = (eyebrow: string, title: string) => (
    <View style={styles.settingsHeader}>
      <TouchableOpacity onPress={() => setSettingsScreen('settings')} style={styles.settingsBackBtn}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={[styles.settingsEyebrow, { color: colors.textMuted }]}>{eyebrow}</Text>
        <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
      </View>
    </View>
  );

  const renderChangePinScreen = () => (
    <View>
      {renderSettingsSubHeader(t.security, t.changePin)}

      <View style={[styles.settingsHeroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.settingsHeroIcon}>
          <Feather name="unlock" size={28} color="#fff" />
        </View>
        <Text style={styles.settingsHeroTitle}>{t.changePin}</Text>
      </View>

      <View style={[styles.pinFormCard, { backgroundColor: isDarkTheme ? '#171629' : colors.card, borderColor: colors.border }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.pinLabel, { color: colors.primary }]}>{t.oldPin}</Text>
          <TextInput
            value={pinForm.oldPin}
            onChangeText={oldPin => setPinForm(prev => ({ ...prev, oldPin }))}
            placeholder={t.oldPasswordPlaceholder}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.pinInput, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.secondary }]}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.pinLabel, { color: colors.primary }]}>{t.newPin}</Text>
          <TextInput
            value={pinForm.newPin}
            onChangeText={newPin => setPinForm(prev => ({ ...prev, newPin }))}
            placeholder={t.newPasswordPlaceholder}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.pinInput, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.secondary }]}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.pinLabel, { color: colors.primary }]}>{t.confirmPin}</Text>
          <TextInput
            value={pinForm.confirmPin}
            onChangeText={confirmPin => setPinForm(prev => ({ ...prev, confirmPin }))}
            placeholder={t.confirmPasswordPlaceholder}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.pinInput, { color: colors.text, borderColor: colors.primary, backgroundColor: colors.secondary }]}
          />
        </View>
        <Text style={[styles.pinHint, { color: colors.textMuted }]}>{t.pinHint}</Text>
      </View>

      <TouchableOpacity style={[styles.settingsWideButton, { backgroundColor: colors.primary }]} onPress={handleUpdatePin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.settingsWideButtonText}>{t.proceed}</Text>}
      </TouchableOpacity>
      <View style={styles.secureFooter}>
        <Feather name="lock" size={14} color={colors.textMuted} />
        <Text style={[styles.secureFooterText, { color: colors.textMuted }]}>{t.secureFooter}</Text>
      </View>
    </View>
  );

  const renderMyDeviceScreen = () => (
    <View>
      {renderSettingsSubHeader(t.deviceSettings, t.myDevice)}

      <View style={[styles.settingsHeroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.settingsHeroIcon}>
          <Feather name="monitor" size={28} color="#fff" />
        </View>
        <Text style={styles.settingsHeroTitle}>{deviceName}</Text>
      </View>

      <View style={[styles.deviceDetailsCard, themedCard]}>
        {deviceInfo.map((item, index) => (
          <View key={item.label} style={[styles.deviceDetailRow, index < deviceInfo.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.deviceDetailLabel, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.deviceDetailValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.deviceHintCard, themedCard]}>
        <Feather name="info" size={20} color={colors.primary} />
        <Text style={[styles.deviceHintText, { color: colors.textMuted }]}>{t.unlinkHint}</Text>
      </View>

      <TouchableOpacity style={[styles.settingsWideButton, { backgroundColor: colors.primary }]} onPress={handleUnlinkDevice}>
        <Text style={styles.settingsWideButtonText}>{t.unlinkDevice}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAccountSettings = () => (
    <View>
      {settingsScreen === 'pin' && renderChangePinScreen()}
      {settingsScreen === 'device' && renderMyDeviceScreen()}
      {settingsScreen === 'settings' && (
      <>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={() => setIsSettingsMode(false)} style={styles.settingsBackBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.settingsEyebrow, { color: colors.textMuted }]}>{t.preferences}</Text>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{t.settings}</Text>
        </View>
      </View>

      <View style={[styles.settingsCard, themedCard]}>
        <Text style={[styles.settingsCardTitle, { color: colors.primary }]}>{t.profile}</Text>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View style={[styles.settingsAvatar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.settingsAvatarImage} />
            ) : (
              <Feather name="user" size={38} color={colors.text} />
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              {profilePhotoLoading ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="camera" size={13} color="#fff" />}
            </View>
          </View>
        </View>
        <View style={styles.settingsButtonRow}>
          <TouchableOpacity style={[styles.settingsPrimaryButton, { backgroundColor: colors.primary }]} onPress={handleChangeProfilePhoto} disabled={profilePhotoLoading}>
            {profilePhotoLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.settingsPrimaryButtonText}>{t.changePhoto}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsGhostButton, { borderColor: colors.border, opacity: profilePhotoUrl ? 1 : 0.45 }]} onPress={handleRemoveProfilePhoto} disabled={profilePhotoLoading || !profilePhotoUrl}>
            <Text style={[styles.settingsGhostButtonText, { color: colors.primary }]}>{t.remove}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.fullName}</Text><TextInput style={[styles.input, themedInput]} value={fullName} onChangeText={setFullName} /></View>
        <View style={[styles.inputGroup, { marginBottom: 0 }]}><Text style={[styles.label, { color: colors.textMuted }]}>{t.phoneNumber}</Text><TextInput style={[styles.input, themedInput]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
        <TouchableOpacity style={[styles.settingsSaveButton, { backgroundColor: colors.primary }]} onPress={handleUpdateProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.settingsPrimaryButtonText}>{t.saveSettings}</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.settingsCard, themedCard]}>
        <Text style={[styles.settingsCardTitle, { color: colors.primary }]}>{t.appearance}</Text>
        {renderSettingsRow(t.darkMode, renderSwitch(isDarkTheme, toggleManualTheme))}
        {renderSettingsRow(t.useDeviceMode, renderSwitch(themePreference === 'system', () => handleThemePreferenceChange(themePreference === 'system' ? activeTheme : 'system')))}
        <View style={{ position: 'relative' }}>
          {renderSettingsRow(
            t.language,
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValueText, { color: colors.text }]}>{languagePreference}</Text>
              <Feather name="chevron-down" size={18} color={colors.textMuted} />
            </View>,
            () => setShowLanguageMenu(!showLanguageMenu)
          )}
          {showLanguageMenu && (
            <View style={[styles.languageMenu, { backgroundColor: colors.secondary }]}>
              {(['en', 'sw'] as LanguagePreference[]).map(language => (
                <TouchableOpacity
                  key={language}
                  style={[styles.languageOption, languagePreference === language && { backgroundColor: colors.placeholder }]}
                  onPress={() => handleLanguagePreferenceChange(language)}
                >
                  <Text style={[styles.languageOptionText, { color: colors.text }]}>{language}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <Text style={[styles.deviceModeHint, { color: colors.textMuted }]}>
          {t.deviceModeHint.replace('{{mode}}', localizedDeviceMode)}
        </Text>
      </View>

      <View style={[styles.settingsCard, themedCard]}>
        <Text style={[styles.settingsCardTitle, { color: colors.primary }]}>{t.security}</Text>
        {renderSettingsRow(t.biometricVerification, renderSwitch(false, () => alert(t.biometricSoon)))}
        {renderSettingsRow(t.biometricLogin, renderSwitch(false, () => alert(t.biometricLoginSoon)))}
        {renderSettingsRow(t.updatePin, <Feather name="chevron-right" size={24} color={colors.textMuted} />, () => setSettingsScreen('pin'))}
      </View>

      <View style={[styles.settingsCard, themedCard]}>
        <Text style={[styles.settingsCardTitle, { color: colors.primary }]}>{t.deviceSession}</Text>
        {renderSettingsRow(
          t.myDevice,
          <View style={styles.settingsValueRow}>
            <Text style={[styles.settingsValueText, { color: colors.textMuted }]} numberOfLines={1}>{deviceName}</Text>
            <Feather name="chevron-right" size={24} color={colors.textMuted} />
          </View>
          ,
          () => setSettingsScreen('device')
        )}
        <TouchableOpacity style={[styles.settingsLogoutButton, { backgroundColor: colors.accent }]} onPress={handleLogout}>
          <Text style={styles.settingsLogoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.versionText, { color: colors.textMuted }]}>v{appVersion}</Text>
      </>
      )}
    </View>
  );

  const renderLogin = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.fullScreenBg, themedScreen]}>
      <ScrollView contentContainerStyle={styles.loginPadding}>
        <View style={styles.loginTopRow}>
          <Text style={[styles.loginTitle, { color: colors.text }]}>{isLoginMode ? t.welcomeBack : t.createAccount}</Text>
          {renderThemeToggle()}
        </View>
        {!isLoginMode && (
          <><View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.fullName}</Text><View style={[styles.inputWithIcon, themedCard]}><Feather name="user" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><TextInput placeholder="e.g John Doe" placeholderTextColor={colors.placeholder} style={{ flex: 1, color: colors.text }} value={fullName} onChangeText={setFullName} /></View></View>
            <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.phoneNumber}</Text><View style={[styles.inputWithIcon, themedCard]}><Feather name="phone" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><TextInput placeholder="e.g 0712345678" keyboardType="phone-pad" placeholderTextColor={colors.placeholder} style={{ flex: 1, color: colors.text }} value={phone} onChangeText={setPhone} /></View></View></>
        )}
        <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.emailAddress}</Text><View style={[styles.inputWithIcon, themedCard]}><Feather name="mail" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><TextInput placeholder="mail@domain.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.placeholder} style={{ flex: 1, color: colors.text }} value={email} onChangeText={setEmail} /></View></View>
        <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.password}</Text><View style={[styles.inputWithIcon, themedCard]}><Feather name="lock" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><TextInput placeholder={t.password} placeholderTextColor={colors.placeholder} secureTextEntry={!showPassword} style={{ flex: 1, color: colors.text }} value={password} onChangeText={setPassword} /><TouchableOpacity style={styles.passwordEyeBtn} onPress={() => setShowPassword(!showPassword)}><Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} /></TouchableOpacity></View></View>
        <TouchableOpacity style={styles.mainLoginBtn} onPress={isLoginMode ? handleLogin : handleRegister} disabled={loading || Boolean(socialLoading)}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>{isLoginMode ? t.signIn : t.signUp}</Text>}</TouchableOpacity>
        <View style={styles.dividerRow}><View style={[styles.dividerLine, { backgroundColor: colors.border }]} /><Text style={[styles.dividerText, { color: colors.textMuted }]}>{t.orContinueWith}</Text><View style={[styles.dividerLine, { backgroundColor: colors.border }]} /></View>
        <View style={styles.socialButtonsRow}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleBtn} onPress={handleAppleLogin} disabled={loading || Boolean(socialLoading)}>
              {socialLoading === 'apple' ? <ActivityIndicator color="#000" /> : <><Ionicons name="logo-apple" size={22} color="#000" /><Text style={styles.appleBtnText}>{t.continueWithApple}</Text></>}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.googleBtn, themedCard]} onPress={handleGoogleLogin} disabled={loading || Boolean(socialLoading)}>
            {socialLoading === 'google' ? <ActivityIndicator color={colors.text} /> : <><Ionicons name="logo-google" size={22} color={colors.text} /><Text style={[styles.googleBtnText, { color: colors.text }]}>{t.continueWithGoogle}</Text></>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signupRow} onPress={() => setIsLoginMode(!isLoginMode)}><Text style={{ color: colors.textMuted }}>{isLoginMode ? t.noAccount : t.haveAccount}</Text><Text style={{ color: colors.primary, fontWeight: 'bold' }}>{isLoginMode ? t.signUp : t.signIn}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderSOS = () => (
    <View style={[styles.fullScreenBg, { backgroundColor: '#140505' }]}>
      <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="x" size={28} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>{t.emergencyRescue}</Text><View style={{ width: 28 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <View style={styles.inputGroup}><Text style={styles.label}>{t.yourName}</Text><TextInput value={sosForm.name} style={[styles.input, { backgroundColor: '#2a1111', borderColor: '#dc2626' }]} onChangeText={name => setSosForm({...sosForm, name})} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>{t.emergencyIssue}</Text><TextInput placeholder="e.g Puncture, Engine Smoking" placeholderTextColor="#6b2121" value={sosForm.issue} style={[styles.input, { backgroundColor: '#2a1111', borderColor: '#dc2626' }]} onChangeText={issue => setSosForm({...sosForm, issue})} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>{t.gpsCoordinates}</Text><View style={{ flexDirection: 'row', gap: 10 }}><TextInput value={sosForm.location} placeholder={t.gpsPlaceholder} placeholderTextColor="#6b2121" style={[styles.input, { flex: 1, backgroundColor: '#2a1111', borderColor: '#dc2626', color: '#fff' }]} editable={false} /><TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation}>{fetchingLocation ? <ActivityIndicator color="#fff" /> : <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />}</TouchableOpacity></View></View>
        <View style={{ alignItems: 'center', marginTop: 40 }}><Animated.View style={[styles.sosPulseCircle, { transform: [{ scale: pulseAnim }] }]}><TouchableOpacity style={styles.sosHugeBtn} onPress={handleSendSOS} disabled={loading}>{loading ? <ActivityIndicator color="#fff" size="large" /> : <Text style={styles.sosHugeText}>SOS</Text>}</TouchableOpacity></Animated.View></View>
      </ScrollView>
    </View>
  );

  const renderBookService = () => (
    <View style={[styles.fullScreenBg, themedScreen]}>
      <View style={[styles.innerHeader, { borderBottomColor: colors.border }]}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color={colors.text} /></TouchableOpacity><Text style={[styles.innerHeaderTitle, { color: colors.text }]}>{t.bookLiveService}</Text><View style={{ width: 24 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
        <Text style={[styles.formTitle, { color: colors.textMuted }]}>{t.selectVehicle}</Text>
        {myVehicles.length === 0 ? (
          <TouchableOpacity style={[styles.vehicleSelectCard, themedCard]} onPress={() => { setCurrentScreen('main'); setActiveTab('garage'); }}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>⚠ {t.noVehicleBook}</Text></TouchableOpacity>
        ) : (
          <View style={styles.chipContainer}>{myVehicles.map(car => (<TouchableOpacity key={car.id} onPress={() => setSelectedVehicleId(car.id)} style={[styles.chip, selectedVehicleId === car.id && styles.chipActive]}><Text style={[styles.chipText, selectedVehicleId === car.id && styles.chipTextActive]}>{car.model} ({car.plate_number})</Text></TouchableOpacity>))}</View>
        )}
        <Text style={[styles.formTitle, { marginTop: 25, color: colors.textMuted }]}>{t.selectServiceType}</Text>
        <View style={styles.chipContainer}>{[t.diagnosticsScan, t.generalRepair, t.majorMaintenance, t.prePurchase150].map(item => (<TouchableOpacity key={item} onPress={() => setSelectedService(item)} style={[styles.chip, selectedService === item && styles.chipActive]}><Text style={[styles.chipText, selectedService === item && styles.chipTextActive]}>{item}</Text></TouchableOpacity>))}</View>
        <Text style={[styles.formTitle, { marginTop: 25, color: colors.textMuted }]}>{t.preferredSchedule}</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}><Text style={[styles.label, { color: colors.textMuted }]}>{t.date}</Text><TouchableOpacity style={[styles.inputWithIcon, themedCard]} onPress={() => setShowDatePicker(true)}><Feather name="calendar" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><Text style={{ color: colors.text, marginTop: 2 }}>{bookingDate.toISOString().split('T')[0]}</Text></TouchableOpacity>{showDatePicker && (<DateTimePicker value={bookingDate} mode="date" display="default" onChange={onChangeDate} />)}</View>
          <View style={{ flex: 1 }}><Text style={[styles.label, { color: colors.textMuted }]}>{t.time}</Text><TouchableOpacity style={[styles.inputWithIcon, themedCard]} onPress={() => setShowTimePicker(true)}><Feather name="clock" size={20} color={colors.textMuted} style={{ marginRight: 10 }} /><Text style={{ color: colors.text, marginTop: 2 }}>{bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></TouchableOpacity>{showTimePicker && (<DateTimePicker value={bookingTime} mode="time" display="default" onChange={onChangeTime} />)}</View>
        </View>
        <Text style={[styles.formTitle, { marginTop: 25 }]}>{t.faultNotes}</Text>
        <TextInput placeholder={t.faultNotesPlaceholder} placeholderTextColor={colors.textMuted} multiline style={styles.textArea} value={bookingNotes} onChangeText={setBookingNotes} />
        <TouchableOpacity style={[styles.mainLoginBtn, { marginTop: 30 }]} onPress={handleCreateBooking} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>{t.confirmBooking}</Text>}</TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderSpareParts = () => {
    const recommendedParts = spareParts.slice(0, 2);

    return (
      <View style={styles.fullScreenBg}>
        <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>{t.oemSpareParts}</Text><View style={{ width: 24 }} /></View>
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
          {spareParts.length === 0 ? (
             <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>{t.shopLoading}</Text>
          ) : (
            <>
              {recommendedParts.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.accent, marginBottom: 15 }]}>🔥 {t.recommendedForYou}</Text>
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

              <Text style={styles.sectionTitle}>{t.allSpareParts}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {spareParts.map(part => (
                  <View key={part.id} style={{ width: '48%', backgroundColor: '#111a2a', borderRadius: 20, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' }}>
                    <Image source={{ uri: part.image_url }} style={{ width: '100%', height: 130, backgroundColor: '#fff' }} resizeMode="cover" />
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }} numberOfLines={2}>{part.name}</Text>
                      <Text style={{ color: '#f97316', fontWeight: '900', marginTop: 5, fontSize: 15 }}>{part.price}</Text>
                      <TouchableOpacity style={{ backgroundColor: '#f97316', marginTop: 10, paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>{t.orderPart}</Text>
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
      <View style={styles.innerHeader}><TouchableOpacity onPress={() => setCurrentScreen('main')} style={styles.backBtnInner}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity><Text style={styles.innerHeaderTitle}>{t.showroomTitle}</Text><View style={{ width: 24 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
         {showroomCars.length === 0 ? (
           <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>{t.noShowroomCars}</Text>
         ) : (
           showroomCars.map(car => (
             <View key={car.id} style={{ marginBottom: 25, backgroundColor: '#111a2a', borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' }}>
               <Image source={{ uri: car.image_url }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
               <View style={{ padding: 20 }}>
                 <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{car.title}</Text>
                 <Text style={{ color: '#3b82f6', fontSize: 18, fontWeight: '900', marginTop: 5 }}>{car.price}</Text>
                 <TouchableOpacity style={{ backgroundColor: '#3b82f6', marginTop: 15, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>{t.scheduleViewing}</Text></TouchableOpacity>
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
        <Text style={styles.innerHeaderTitle}>{academyView === 'menu' ? 'MoTECH-i Academy' : academyView === 'ai' ? t.aiAssistant : academyView === 'manuals' ? t.carManuals : t.videoTutorials}</Text>
        <View style={{ width: 24 }} />
      </View>

      {academyView === 'menu' && (
        <ScrollView contentContainerStyle={{ padding: 25 }}>
           <Image source={{ uri: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80' }} style={{ width: '100%', height: 180, borderRadius: 20, marginBottom: 25 }} />
           
           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('ai')}>
             <LinearGradient colors={['rgba(220,38,38,0.2)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="robot-outline" size={30} color={colors.primary} /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>{t.aiAssistantTitle}</Text><Text style={styles.academyDesc}>{t.aiAssistantDesc}</Text></View>
             <Feather name="chevron-right" size={24} color={colors.textMuted} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('videos')}>
             <LinearGradient colors={['rgba(59,130,246,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="play-circle-outline" size={30} color="#3b82f6" /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>{t.videoTutorials}</Text><Text style={styles.academyDesc}>{t.videoTutorialsDesc}</Text></View>
             <Feather name="chevron-right" size={24} color={colors.textMuted} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.academyMenuCard} onPress={() => setAcademyView('manuals')}>
             <LinearGradient colors={['rgba(16,185,129,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.academyIconBox}><MaterialCommunityIcons name="book-open-page-variant" size={30} color="#10b981" /></View>
             <View style={{ flex: 1 }}><Text style={styles.academyTitle}>{t.carManualsTitle}</Text><Text style={styles.academyDesc}>{t.carManualsDesc}</Text></View>
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
            <TextInput placeholder={t.aiPlaceholder} placeholderTextColor={colors.textMuted} style={styles.chatInput} value={aiInput} onChangeText={setAiInput} multiline />
            <TouchableOpacity style={styles.chatSendBtn} onPress={() => handleSendAiMessage()} disabled={aiLoading}><Feather name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ==========================================
          CAR MANUALS YENYE ICONS KWA MAGARI MENGI
          ========================================== */}
      {academyView === 'manuals' && (
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
           <Text style={styles.formTitle}>{t.searchCarManual}</Text>
           <View style={styles.inputGroup}><View style={styles.inputWithIcon}><Feather name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} /><TextInput placeholder="e.g Toyota Vanguard 2012" placeholderTextColor="#475569" style={{ flex: 1, color: '#fff' }} value={manualCarInfo} onChangeText={setManualCarInfo} /></View></View>
           <TouchableOpacity style={styles.mainLoginBtn} onPress={() => handleFetchManual(manualCarInfo)}><Text style={styles.mainLoginBtnText}>{t.searchManual}</Text></TouchableOpacity>

           <Text style={[styles.sectionTitle, { marginTop: 40 }]}>{t.popularModels}</Text>
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
             <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>{t.noVideos}</Text>
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
    <View style={[styles.fullScreenBg, themedScreen]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View><Text style={[styles.headerGreeting, { color: colors.textMuted }]}>{activeTab === 'home' ? `${t.hello}, ${fullName?.split(' ')[0] || userSession?.user?.email?.split('@')[0] || t.customer}` : activeTab === 'garage' ? t.myGarage : activeTab === 'history' ? t.bookingHistory : t.profileControl}</Text><View style={styles.brandRow}><Text style={[styles.brandText, { color: colors.text }]}>Mo</Text><Text style={[styles.brandText, { color: colors.primary }]}>TECH</Text><Text style={[styles.brandText, { color: colors.text }]}>-i</Text></View></View>
        <TouchableOpacity style={[styles.notifBtn, themedCard]} onPress={() => setShowNotif(!showNotif)}><Feather name="bell" size={22} color={colors.text} />{notifications.length > 0 && <View style={styles.notifBadge} />}</TouchableOpacity>
      </View>

      {showNotif && (
        <View style={[styles.notifDropdown, themedCard]}>
          <Text style={[styles.notifTitle, { color: colors.text, borderBottomColor: colors.border }]}>{t.recentAlerts}</Text>
          {notifications.map(notif => (<View key={notif.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}><View style={[styles.notifDot, { backgroundColor: notif.type === 'success' ? colors.success : colors.primary }]} /><View><Text style={[styles.notifText, { color: colors.text }]}>{notif.title}</Text><Text style={[styles.notifSub, { color: colors.textMuted }]}>{notif.sub}</Text></View></View>))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {activeTab === 'home' && (
          <View><View style={styles.sectionPadding}>
              <LinearGradient colors={colors.banner} style={styles.welcomeBanner}>
                <View style={styles.bannerContent}><Text style={[styles.bannerTitle, { color: colors.text }]}>{t.expertMechanic}</Text><Text style={[styles.bannerDesc, { color: colors.textMuted }]}>{t.bookInstantly}</Text>
                  <View style={styles.bannerButtons}><TouchableOpacity style={styles.bookBtn} onPress={() => setCurrentScreen('book_service')}><Text style={styles.bookBtnText}>{t.bookNow}</Text></TouchableOpacity><TouchableOpacity style={styles.sosBtnSmall} onPress={() => { setSosForm({...sosForm, name: fullName}); setCurrentScreen('sos'); }}><MaterialCommunityIcons name="alert-decagram" size={16} color="#dc2626" /><Text style={styles.sosBtnText}>SOS</Text></TouchableOpacity></View></View>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80' }} style={styles.bannerImage} />
              </LinearGradient></View>
            <View style={styles.sectionPadding}><Text style={[styles.sectionTitle, { color: colors.text }]}>{t.expertServices}</Text>
              <View style={styles.servicesGrid}>
                {[{ title: t.diagnostics, i: 'engine-outline', c: colors.accent, a: 'book_service' }, { title: t.repair, i: 'wrench', c: colors.primary, a: 'book_service' }, { title: t.prePurchase, i: 'clipboard-check-outline', c: '#10b981', a: 'book_service' }, { title: t.spareParts, i: 'cogs', c: '#f97316', a: 'spare_parts' }, { title: t.showroom, i: 'car', c: '#3b82f6', a: 'showroom' }, { title: t.academy, i: 'school-outline', c: '#a855f7', a: 'academy' }].map((item, idx) => (<TouchableOpacity key={idx} style={[styles.serviceCard, themedCard]} onPress={() => setCurrentScreen(item.a)}><View style={[styles.serviceIconBox, { backgroundColor: item.c + '20' }]}><MaterialCommunityIcons name={item.i as any} size={26} color={item.c} /></View><Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text></TouchableOpacity>))}</View></View>
          </View>
        )}

        {activeTab === 'garage' && (
          <View style={styles.sectionPadding}>
            <TouchableOpacity style={styles.mainLoginBtn} onPress={toggleAddCarForm}><Text style={styles.mainLoginBtnText}>{showAddCarForm ? t.closeForm : `+ ${t.registerVehicle}`}</Text></TouchableOpacity>
            {showAddCarForm && (<View style={[styles.addCarCard, themedCard]}><View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.carModel}</Text><TextInput placeholder="e.g Toyota Land Cruiser" placeholderTextColor={colors.placeholder} style={[styles.input, themedInput]} value={carModel} onChangeText={setCarModel} /></View><View style={styles.inputGroup}><Text style={[styles.label, { color: colors.textMuted }]}>{t.plateNumber}</Text><TextInput placeholder="e.g T 123 ABC" placeholderTextColor={colors.placeholder} style={[styles.input, themedInput]} value={carPlate} onChangeText={setCarPlate} /></View><TouchableOpacity style={[styles.mainLoginBtn, { backgroundColor: colors.success }]} onPress={handleAddVehicle} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>{t.saveVehicle}</Text>}</TouchableOpacity></View>)}
            <Text style={[styles.sectionTitle, { marginTop: 25, color: colors.text }]}>{t.registeredVehicles}</Text>
            {myVehicles.length === 0 ? (<Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>{t.noVehicles}</Text>) : (myVehicles.map(car => (<View key={car.id} style={[styles.carDisplayCard, themedCard]}><MaterialCommunityIcons name="car-sports" size={35} color={colors.primary} /><View style={{ marginLeft: 15 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{car.model}</Text><Text style={{ color: colors.textMuted }}>{t.vehiclePlate}: {car.plate_number}</Text></View></View>)))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.sectionPadding}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.liveServiceRequests}</Text>
            {myBookings.length === 0 ? (<Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>{t.noBookings}</Text>) : (myBookings.map(b => (<View key={b.id} style={[styles.bookingCard, themedCard]}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>{b.service_type}</Text><View style={[styles.statusBadge, { backgroundColor: b.status === 'Pending' ? '#b45309' : '#047857' }]}><Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{b.status}</Text></View></View><Text style={{ color: colors.text, marginTop: 8, fontSize: 14 }}>{t.vehicle}: {b.vehicles?.model} [{b.vehicles?.plate_number}]</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 5 }}>{t.schedule}: {b.booking_date} • {b.booking_time}</Text></View>)))}
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.sectionPadding}>
            {isSettingsMode ? (
              renderAccountSettings()
            ) : (
              <><View style={{ alignItems: 'center' }}><View style={[styles.avatarContainer, { backgroundColor: colors.secondary }]}>{profilePhotoUrl ? <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} /> : <Feather name="user" size={40} color={colors.text} />}</View><Text style={[styles.profileName, { color: colors.text }]}>{fullName || userSession?.user?.email?.split('@')[0] || t.customer}</Text><View style={styles.planBadge}><Text style={styles.planText}>{userSession?.user?.user_metadata?.plan || 'Free'}</Text></View></View>
                <Text style={[styles.sectionTitle, { marginTop: 30, color: colors.text }]}>{t.premiumSubscriptions}</Text>
                <View style={styles.subGrid}><TouchableOpacity style={[styles.subCard, themedCard]} onPress={() => handleChangeSubscription('Standard', '5,000')}><Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Standard</Text><Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 20, marginTop: 5 }}>5,000/=</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 5 }}>{t.oneCarPlan}</Text></TouchableOpacity><TouchableOpacity style={[styles.subCard, themedCard]} onPress={() => handleChangeSubscription('Premium', '10,000')}><Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Premium</Text><Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 20, marginTop: 5 }}>10,000/=</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 5 }}>{t.threeCarPlan}</Text></TouchableOpacity></View>
                <View style={{ marginTop: 30 }}><TouchableOpacity style={[styles.profileOption, { borderBottomColor: colors.border }]} onPress={() => { setSettingsScreen('settings'); setIsSettingsMode(true); }}><Feather name="settings" size={20} color={colors.text} /><Text style={[styles.profileOptionText, { color: colors.text }]}>{t.accountSettings}</Text></TouchableOpacity><TouchableOpacity style={[styles.profileOption, { borderBottomWidth: 0 }]} onPress={handleLogout}><Feather name="log-out" size={20} color={colors.primary} /><Text style={[styles.profileOptionText, { color: colors.primary }]}>{t.signOut}</Text></TouchableOpacity></View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navItem}><Feather name="home" size={24} color={activeTab === 'home' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'home' ? colors.primary : colors.textMuted }]}>{t.home}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem}><MaterialCommunityIcons name="garage" size={24} color={activeTab === 'garage' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'garage' ? colors.primary : colors.textMuted }]}>{t.garage}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.navItem}><Feather name="clock" size={24} color={activeTab === 'history' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'history' ? colors.primary : colors.textMuted }]}>{t.bookings}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navItem}><Feather name="user" size={24} color={activeTab === 'profile' ? colors.primary : colors.textMuted} /><Text style={[styles.navText, { color: activeTab === 'profile' ? colors.primary : colors.textMuted }]}>{t.profile}</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, themedScreen]}>
      <StatusBar barStyle={colors.statusBar} translucent backgroundColor="transparent" />
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
  loginTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 },
  loginTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 10 },
  loginSubtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 40 },
  authThemeToggle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#cbd5e1', marginBottom: 10, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  input: { backgroundColor: '#111a2a', height: 60, borderRadius: 15, paddingHorizontal: 20, color: '#fff', borderWidth: 1, borderColor: '#1e293b' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111a2a', height: 60, borderRadius: 15, paddingHorizontal: 20, borderWidth: 1, borderColor: '#1e293b' },
  passwordEyeBtn: { width: 42, height: 42, justifyContent: 'center', alignItems: 'flex-end' },
  mainLoginBtn: { backgroundColor: '#dc2626', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainLoginBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  dividerText: { color: '#475569', paddingHorizontal: 15, fontWeight: 'bold' },
  socialButtonsRow: { gap: 12, marginBottom: 20 },
  appleBtn: { width: '100%', backgroundColor: '#fff', height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  appleBtnText: { color: '#000', fontWeight: 'bold', marginLeft: 8 },
  googleBtn: { width: '100%', backgroundColor: '#1e293b', height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
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
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  profileName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  planBadge: { backgroundColor: 'rgba(250, 204, 21, 0.1)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginTop: 5, borderWidth: 1, borderColor: '#facc15' },
  planText: { color: '#facc15', fontSize: 12, fontWeight: 'bold' },
  profileOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  profileOptionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 26, gap: 16 },
  settingsBackBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  settingsEyebrow: { fontSize: 11, fontWeight: '700' },
  settingsTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  settingsCard: { backgroundColor: '#111a2a', borderRadius: 18, padding: 20, marginBottom: 22, borderWidth: 1, borderColor: '#1e293b' },
  settingsCardTitle: { fontSize: 14, fontWeight: '900', marginBottom: 18 },
  settingsAvatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  settingsAvatarImage: { width: '100%', height: '100%', borderRadius: 48 },
  cameraBadge: { position: 'absolute', right: 2, bottom: 4, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#111a2a' },
  settingsButtonRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  settingsPrimaryButton: { flex: 1, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingsPrimaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  settingsGhostButton: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  settingsGhostButtonText: { fontSize: 13, fontWeight: '900' },
  settingsSaveButton: { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  settingsRow: { minHeight: 58, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  settingsRowLabel: { fontSize: 16, fontWeight: '700', flexShrink: 0 },
  settingsValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  settingsValueText: { fontSize: 16, fontWeight: '700', maxWidth: 145 },
  settingsSwitch: { width: 66, height: 36, borderRadius: 18, padding: 4, justifyContent: 'center' },
  settingsSwitchThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff' },
  settingsSwitchThumbOn: { alignSelf: 'flex-end' },
  deviceModeHint: { fontSize: 12, lineHeight: 18, marginTop: 14 },
  settingsLogoutButton: { height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  settingsLogoutText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  versionText: { textAlign: 'center', fontSize: 18, fontWeight: '900', marginTop: 10, marginBottom: 110 },
  languageMenu: { position: 'absolute', right: 0, top: 48, width: 96, borderRadius: 2, overflow: 'hidden', zIndex: 50, elevation: 8 },
  languageOption: { height: 58, justifyContent: 'center', paddingHorizontal: 18 },
  languageOptionText: { fontSize: 24, fontWeight: '800' },
  settingsHeroCard: { minHeight: 82, borderRadius: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 22 },
  settingsHeroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  settingsHeroTitle: { color: '#fff', fontSize: 17, fontWeight: '900', flex: 1 },
  pinFormCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 24 },
  pinLabel: { marginBottom: 10, fontSize: 14, fontWeight: '900' },
  pinInput: { height: 64, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 18, fontWeight: '800' },
  pinHint: { fontSize: 12, fontWeight: '700', marginTop: -8 },
  settingsWideButton: { height: 66, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  settingsWideButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  secureFooter: { minHeight: 130, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingBottom: 8 },
  secureFooterText: { fontSize: 12, fontWeight: '800' },
  deviceDetailsCard: { borderRadius: 18, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, marginBottom: 22 },
  deviceDetailRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  deviceDetailLabel: { fontSize: 12, fontWeight: '900', flex: 1 },
  deviceDetailValue: { fontSize: 18, fontWeight: '700', flex: 1.25 },
  deviceHintCard: { minHeight: 58, borderRadius: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, marginBottom: 28 },
  deviceHintText: { flex: 1, fontSize: 12, fontWeight: '700' },
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
  vehicleSelectCard: { backgroundColor: '#111a2a', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#1e293b' },
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
