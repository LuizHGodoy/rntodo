import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { Link } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { login } = useAuthStore();

  async function signInWithEmail() {
    setLoading(true);
    setError(null);
    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('Email ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro de login:', error);
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container]}>
      <Text variant="headlineMedium" style={styles.title}>
        Bem-vindo de volta
      </Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        textContentType="emailAddress"
        keyboardType="email-address"
        style={styles.input}
        error={!!error}
      />
      
      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        error={!!error}
      />

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={signInWithEmail}
        loading={loading}
        style={styles.button}
        disabled={loading || !email || !password}
      >
        Entrar
      </Button>

      <View style={styles.linkContainer}>
        <Text>Não tem uma conta? </Text>
        <Link href="/(auth)/signup" asChild>
          <Button mode="text" compact disabled={loading}>
            Criar Conta
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  error: {
    textAlign: 'center',
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
