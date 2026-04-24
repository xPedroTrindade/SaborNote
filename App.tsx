import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/colors';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function inicializar() {
      try {
        initDatabase();
        const usuario = await AsyncStorage.getItem('usuarioLogado');
        setAutenticado(!!usuario);
      } finally {
        setVerificando(false);
      }
    }
    inicializar();
  }, []);

  if (verificando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  }

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
