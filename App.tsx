import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/colors';

const SPLASH_MIN_MS = 2000;

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [appPronto, setAppPronto] = useState(false);
  const [splashVisivel, setSplashVisivel] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 45,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const inicioMs = Date.now();

    async function inicializar() {
      try {
        initDatabase();
        const usuario = await AsyncStorage.getItem('usuarioLogado');
        setAutenticado(!!usuario);
      } finally {
        // Garante que o splash fica visível por pelo menos SPLASH_MIN_MS
        const decorrido = Date.now() - inicioMs;
        const restante = Math.max(0, SPLASH_MIN_MS - decorrido);

        setTimeout(() => {
          // Fade out suave antes de esconder
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
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
        <Animated.View
          style={[
            styles.splashConteudo,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
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
  splashConteudo: {
    alignItems: 'center',
    gap: 12,
  },
  splashLogo: {
    width: 280,
    height: 130,
  },
  splashSlogan: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});
