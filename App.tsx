import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/colors';

// Sessão expira após 8 horas — força novo login no dia seguinte
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const SPLASH_MIN_MS = 2000;

export const SESSION_KEY = 'usuarioLogado';

async function verificarSessao(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    const valida = Date.now() - (session.loginTime ?? 0) < SESSION_DURATION_MS;
    if (!valida) await AsyncStorage.removeItem(SESSION_KEY);
    return valida;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return false;
  }
}

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [appPronto, setAppPronto] = useState(false);
  const [splashVisivel, setSplashVisivel] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 45, friction: 7, useNativeDriver: true }),
    ]).start();

    const inicioMs = Date.now();

    async function inicializar() {
      try {
        initDatabase();
        const sessaoAtiva = await verificarSessao();
        setAutenticado(sessaoAtiva);
      } finally {
        const decorrido = Date.now() - inicioMs;
        const restante = Math.max(0, SPLASH_MIN_MS - decorrido);
        setTimeout(() => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true })
            .start(() => {
              setAppPronto(true);
              setSplashVisivel(false);
            });
        }, restante);
      }
    }

    inicializar();
  }, []);

  if (splashVisivel) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="dark" />
        <Animated.View style={[styles.splashConteudo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={require('./assets/Sabor_note.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
          <Animated.Text style={[styles.splashSlogan, { opacity: fadeAnim }]}>
            Suas receitas, sempre à mão
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  if (!appPronto) return null;

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator
        autenticado={autenticado}
        onLogin={() => setAutenticado(true)}
        onLogout={() => setAutenticado(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashConteudo: { alignItems: 'center', gap: 12 },
  splashLogo: { width: 280, height: 130 },
  splashSlogan: { fontSize: 14, color: Colors.textSecondary, letterSpacing: 0.3 },
});
