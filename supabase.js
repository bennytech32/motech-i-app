import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const defaultSupabaseUrl = 'https://wftocprdfgaxpnsklesu.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdG9jcHJkZmdheHBuc2tsZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NzExOTQsImV4cCI6MjA5NjU0NzE5NH0.nDCKQgIKVWyFRkSWSGhUQ8I4Bv3tWDiKDCBRUbLokX8';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  defaultSupabaseUrl;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  defaultSupabaseAnonKey;

// ==========================================
// MFUMO SALAMA WA STORAGE JAVASCRIPT (KUZUIA "window is not defined")
// ==========================================
const safeStorage = {
  getItem: (key) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null; // Inazuia crash
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      return null;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      return null;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage, // Hapa imekaa safi bila 'as any'
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
