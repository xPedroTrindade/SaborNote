import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, Receita } from '../types';
import {
  listarReceitas,
  buscarPorNome,
  buscarPorIngrediente,
  listarFavoritas,
  toggleFavorita,
} from '../database/recipeRepository';
import { RecipeCard } from '../components/RecipeCard';
import { SearchBar } from '../components/SearchBar';
import { ExploreTab } from '../components/ExploreTab';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
  onLogout: () => void;
};

type AbaAtiva = 'minhas' | 'explorar';
type FiltroAtivo = 'todos' | 'favoritos' | 'ingrediente';

export function HomeScreen({ navigation, onLogout }: Props) {
  const [aba, setAba] = useState<AbaAtiva>('minhas');
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroAtivo>('todos');
  const [carregando, setCarregando] = useState(false);

  function carregarReceitas() {
    setCarregando(true);
    try {
      let resultado: Receita[];
      if (filtro === 'favoritos') {
        resultado = listarFavoritas();
      } else if (filtro === 'ingrediente' && busca.trim()) {
        resultado = buscarPorIngrediente(busca.trim());
      } else if (busca.trim()) {
        resultado = buscarPorNome(busca.trim());
      } else {
        resultado = listarReceitas();
      }
      setReceitas(resultado);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (aba === 'minhas') carregarReceitas();
    }, [busca, filtro, aba]),
  );

  function handleFavoritar(receita: Receita) {
    if (!receita.id) return;
    toggleFavorita(receita.id, !receita.favorita);
    carregarReceitas();
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('usuarioLogado');
          onLogout();
        },
      },
    ]);
  }

  function renderEmpty() {
    if (carregando) return null;
    const semBusca = !busca.trim() && filtro === 'todos';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🍽</Text>
        <Text style={styles.emptyTitulo}>
          {semBusca ? 'Nenhuma receita ainda' : 'Nenhuma receita encontrada'}
        </Text>
        <Text style={styles.emptySubtitulo}>
          {semBusca
            ? 'Cadastre manualmente ou explore receitas do mundo todo'
            : 'Tente outro termo de busca'}
        </Text>
        {semBusca && (
          <TouchableOpacity
            style={styles.emptyBotao}
            onPress={() => setAba('explorar')}
          >
            <Text style={styles.emptyBotaoTexto}>🌍 Explorar receitas</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>SaborNote</Text>
        <View style={styles.headerAcoes}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('ApiSearch')}
          >
            <Text style={styles.headerBtnTexto}>🌐</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.headerBtnTexto}>❓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
            <Text style={styles.headerBtnTexto}>↩</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Abas */}
      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, aba === 'minhas' && styles.abaAtiva]}
          onPress={() => setAba('minhas')}
        >
          <Text style={[styles.abaTexto, aba === 'minhas' && styles.abaTextoAtivo]}>
            Minhas Receitas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, aba === 'explorar' && styles.abaAtiva]}
          onPress={() => setAba('explorar')}
        >
          <Text style={[styles.abaTexto, aba === 'explorar' && styles.abaTextoAtivo]}>
            🌍 Explorar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo: Minhas Receitas */}
      {aba === 'minhas' && (
        <>
          <SearchBar
            value={busca}
            onChangeText={setBusca}
            placeholder={filtro === 'ingrediente' ? 'Buscar por ingrediente...' : 'Buscar receita...'}
            onClear={() => setBusca('')}
          />

          <View style={styles.filtros}>
            {(['todos', 'favoritos', 'ingrediente'] as FiltroAtivo[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
                onPress={() => { setFiltro(f); setBusca(''); }}
              >
                <Text style={[styles.filtroTexto, filtro === f && styles.filtroTextoAtivo]}>
                  {f === 'todos' ? 'Todos' : f === 'favoritos' ? '★ Favoritos' : 'Por Ingrediente'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {carregando ? (
            <ActivityIndicator style={styles.loading} color={Colors.black} />
          ) : (
            <FlatList
              data={receitas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <RecipeCard
                  receita={item}
                  onPress={() => navigation.navigate('RecipeDetail', { receitaId: item.id! })}
                  onFavoritePress={() => handleFavoritar(item)}
                />
              )}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={receitas.length === 0 ? styles.listaVazia : { paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('RecipeForm', {})}
          >
            <Text style={styles.fabTexto}>+</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Conteúdo: Explorar */}
      {aba === 'explorar' && (
        <ExploreTab navigation={navigation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitulo: { fontSize: 20, fontWeight: '800', color: Colors.black },
  headerAcoes: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnTexto: { fontSize: 17 },

  abas: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aba: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  abaAtiva: { borderBottomColor: Colors.black },
  abaTexto: { fontSize: 13, fontWeight: '600', color: Colors.gray500 },
  abaTextoAtivo: { color: Colors.black },

  filtros: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  filtroBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filtroBtnAtivo: { backgroundColor: Colors.black, borderColor: Colors.black },
  filtroTexto: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  filtroTextoAtivo: { color: Colors.white },

  loading: { marginTop: 40 },

  listaVazia: { flexGrow: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitulo: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptySubtitulo: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBotao: {
    marginTop: 20,
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyBotaoTexto: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabTexto: { color: Colors.white, fontSize: 28, lineHeight: 30, fontWeight: '300' },
});
