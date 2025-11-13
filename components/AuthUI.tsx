import React from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './Auth'; 

export default function AuthHeaderButton() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Pressable onPress={() => router.push('/sign-in')} style={{ paddingHorizontal: 12 }}>
        <Text style={{ fontWeight: '600' }}>Sign in</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={signOutUser} style={{ paddingHorizontal: 12 }}>
      <Text style={{ fontWeight: '600' }}>Sign out</Text>
    </Pressable>
  );
}
