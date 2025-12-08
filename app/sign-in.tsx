import React, { useMemo, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../components/Auth'; // adjust if your Auth file moved

// ✅ Option 2: assign require() to a constant
const logo = require('../assets/images/logo.png');

export default function SignInScreen() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const disabled = useMemo(() => {
    if (!email || !pass) return true;
    if (mode === 'signup') {
      if (!name.trim()) return true;
      if (pass !== confirm) return true;
    }
    return false;
  }, [email, pass, confirm, mode, name]);

  const onSubmit = async () => {
    try {
      if (!email || !pass) return;
      if (mode === 'signup' && pass !== confirm) {
        Alert.alert('Passwords do not match'); return;
      }
      setSubmitting(true);
      if (mode === 'signin') {
        await signIn(email.trim(), pass);
      } else {
        await signUp(email.trim(), pass);
      }
      await updateProfile(auth.currentUser!, { displayName: name.trim() });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      Alert.alert('Authentication error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.wrap}
    >
      <View style={styles.card}>
        {/* Logo at the top */}
        <Image source={logo} style={styles.logo} />

        <Text style={styles.h1}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </Text>

        {mode === 'signup' && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex]}
            secureTextEntry={!showPass}
            placeholder="••••••••"
            value={pass}
            onChangeText={setPass}
          />
          <Pressable style={styles.eye} onPress={() => setShowPass(v => !v)}>
            <Text style={styles.eyeTxt}>{showPass ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>

        {mode === 'signup' && (
          <>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={!showPass}
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
            />
          </>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={submitting || disabled}
          style={[styles.btn, (submitting || disabled) && styles.btnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnTxt}>
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.switch}>
            {mode === 'signin'
              ? "Don't have an account? Create one"
              : 'Have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  card: { gap: 12 },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  h1: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 14, padding: 12, fontSize: 16,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  eye: { paddingHorizontal: 10, paddingVertical: 12 },
  eyeTxt: { fontWeight: '600' },
  btn: {
    backgroundColor: 'rgba(15, 30, 145, 1)', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switch: { textAlign: 'center', marginTop: 10, textDecorationLine: 'underline' },
});