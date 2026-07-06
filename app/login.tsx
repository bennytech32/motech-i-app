import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Animated, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animations za fomu
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUpAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();
  }, []);

  const handleLogin = () => {
    // Baada ya mteja ku-login, mpeleke kwenye Dashboard
    router.replace('/dashboard');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={28} color="#f8fafc" />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to access your garage and track your vehicle's status in real-time.</Text>

        {/* LOGIN FORM */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="e.g 0712345678 or mail@test.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#475569"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* OR DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* SOCIAL LOGINS (APPLE & GOOGLE) */}
        <View style={styles.socialContainer}>
          {/* Apple Login (Required by App Store) */}
          <TouchableOpacity style={[styles.socialBtn, styles.appleBtn]} activeOpacity={0.8} onPress={handleLogin}>
            <Ionicons name="logo-apple" size={22} color="#0f172a" />
            <Text style={styles.appleBtnText}>Apple</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]} activeOpacity={0.8} onPress={handleLogin}>
            <Ionicons name="logo-google" size={22} color="#f8fafc" />
            <Text style={styles.googleBtnText}>Google</Text>
          </TouchableOpacity>
        </View>
        
        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 10, padding: 5 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingTop: 60 },
  title: { fontSize: 36, fontWeight: '900', color: '#f8fafc', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22, marginBottom: 40 },
  formContainer: { marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#cbd5e1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', height: 60, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  eyeIcon: { padding: 10 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: '#dc2626', fontSize: 13, fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#dc2626', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#dc2626', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { color: '#64748b', paddingHorizontal: 15, fontSize: 13, fontWeight: '600' },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 40 },
  socialBtn: { flex: 1, height: 55, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  appleBtn: { backgroundColor: '#f8fafc', borderColor: '#f8fafc' },
  appleBtnText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  googleBtn: { backgroundColor: '#1e293b', borderColor: '#334155' },
  googleBtnText: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { color: '#94a3b8', fontSize: 14 },
  registerLink: { color: '#dc2626', fontSize: 14, fontWeight: 'bold' }
});