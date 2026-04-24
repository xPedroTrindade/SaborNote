import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RecipeFormScreen } from '../screens/RecipeFormScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { ApiSearchScreen } from '../screens/ApiSearchScreen';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  autenticado: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AppNavigator({ autenticado, onLogin, onLogout }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.black,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {!autenticado ? (
          <>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Criar Conta', headerBackTitle: 'Voltar' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{ headerShown: false }}
            >
              {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="RecipeForm"
              component={RecipeFormScreen}
              options={{ title: 'Nova Receita', headerBackTitle: 'Voltar' }}
            />
            <Stack.Screen
              name="RecipeDetail"
              component={RecipeDetailScreen}
              options={{ title: 'Detalhes', headerBackTitle: 'Voltar' }}
            />
            <Stack.Screen
              name="ApiSearch"
              component={ApiSearchScreen}
              options={{ title: 'Busca Online', headerBackTitle: 'Voltar' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
