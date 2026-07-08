import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '../supabase';

WebBrowser.maybeCompleteAuthSession();

export const APP_SCHEME = 'motechi';
export const OAUTH_CALLBACK_PATH = 'auth/callback';

// Add this exact URL in Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs.
// Also use it for Google OAuth redirect testing. Google/Apple client secrets belong in Supabase Dashboard only.
export const OAUTH_REDIRECT_URL = AuthSession.makeRedirectUri({
  native: `${APP_SCHEME}://${OAUTH_CALLBACK_PATH}`,
});

const getRedirectParam = (url: string, key: string) => {
  const parsedUrl = new URL(url);
  const queryValue = parsedUrl.searchParams.get(key);
  if (queryValue) return queryValue;

  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
  return hashParams.get(key);
};

const formatAppleFullName = (fullName: AppleAuthentication.AppleAuthenticationFullName | null) => {
  if (!fullName) return null;
  return [fullName.givenName, fullName.middleName, fullName.familyName].filter(Boolean).join(' ') || null;
};

export async function signInWithGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: OAUTH_REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in URL was not returned.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, OAUTH_REDIRECT_URL);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { session: null, canceled: true };
  }

  if (result.type !== 'success') {
    throw new Error('Google sign-in did not complete.');
  }

  const redirectError = getRedirectParam(result.url, 'error_description') || getRedirectParam(result.url, 'error');
  if (redirectError) throw new Error(decodeURIComponent(redirectError));

  const code = getRedirectParam(result.url, 'code');
  if (!code) throw new Error('Google sign-in did not return an authorization code.');

  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;

  return { session: sessionData.session, canceled: false };
}

export async function signInWithAppleIdToken() {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is available on iOS only.');
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple Sign-In is not available on this device.');
  }

  // Apple only returns email/fullName the first time the user authorizes the app.
  // Enable the Apple provider in Supabase and configure the app in Apple Developer account.
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;

  const fullName = formatAppleFullName(credential.fullName);
  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return { session: data.session, fullName, email: credential.email };
}
