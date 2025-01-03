import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import supabase from '../lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { login } = useAuthStore();
  const router = useRouter();

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Fazer login automaticamente após o cadastro
      const loginSuccess = await login(email, password);
      
      if (!loginSuccess) {
        throw new Error("Não foi possível fazer login automático após o cadastro");
      }
      
    } catch (error) {
      let errorMessage = "Erro ao criar conta";
      
      if (error instanceof Error) {
        switch (error.message) {
          case "User already registered":
            errorMessage = "Este email já está cadastrado";
            break;
          case "Invalid email":
            errorMessage = "Email inválido";
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container]}>
      <Text variant="headlineMedium" style={styles.title}>
        Criar Conta
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

      <TextInput
        label="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
        onPress={handleSignUp}
        loading={loading}
        style={styles.button}
        disabled={loading || !email || !password || !confirmPassword}
      >
        Criar Conta
      </Button>

      <View style={styles.linkContainer}>
        <Text>Já tem uma conta? </Text>
        <Button 
          mode="text" 
          compact 
          disabled={loading}
          onPress={() => router.back()}
        >
          Entrar
        </Button>
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
