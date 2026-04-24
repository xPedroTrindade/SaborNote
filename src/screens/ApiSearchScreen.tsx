import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MealApiMeal } from '../types';
import { buscarReceitasNaApi, converterMealParaReceita } from '../services/mealApi';
import { inserirReceita } from '../database/recipeRepository';
import { SearchBar } from '../components/SearchBar';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ApiSearch'>;
};

export function ApiSearchScreen({ navigation }: Props) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<MealApiMeal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [importados, setImportados] = useState<Set<string>>(new Set());

  async function handleBuscar() {
    if (!busca.trim()) {
      Alert.alert('Atenção', 'Digite um termo para buscar.');
      return;
    }

    setCarregando(true);
    setBuscou(true);
    try {
      const meals = await buscarReceitasNaApi(busca.trim());
      setResultados(meals);
      if (meals.length === 0) {
        Alert.alert('Sem resultados', 'Nenhuma receita encontrada para esse termo.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar receitas. Verifique sua conexão.');
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }

  function handleImportar(meal: MealApiMeal) {
    Alert.alert(
      'Importar Receita',
      `Deseja importar "${meal.strMeal}" para suas receitas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: () => {
            const receita = converterMealParaReceita(meal);
            inserirReceita(receita);
            setImportados((prev) => new Set([...prev, meal.idMeal]));
            Alert.alert('Sucesso', `"${meal.strMeal}" foi salva nas suas receitas!`);
          },
        },
      ],
    );
  }

  function renderItem({ item }: { item: MealApiMeal }) {
    const jaImportado = importados.has(item.idMeal);
    return (
      <View style={styles.card}>
        {item.strMealThumb ? (
          <Image source={{ uri: item.strMealThumb }} style={styles.cardImagem} />
        ) : (
          <View style={styles.cardImagemPlaceholder}>
            <Text style={{ fontSize: 28 }}>🍽</Text>
          </View>
        )}
        <View style={styles.cardConteudo}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.strMeal}
          </Text>
          <View style={styles.cardMetaRow}>
            {item.strCategory ? (
              <View style={styles.tag}>
                <Text style={styles.tagTexto}>{item.strCategory}</Text>
              </View>
            ) : null}
            {item.strArea ? (
              <Text style={styles.cardArea}>{item.strArea}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.importarBtn, jaImportado && styles.importarBtnJaFeito]}
            onPress={() => !jaImportado && handleImportar(item)}
            disabled={jaImportado}
          >
            <Text style={styles.importarBtnTexto}>
              {jaImportado ? '✓ Importado' : '↓ Importar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Buscar Receitas Online</Text>
        <Text style={styles.headerSub}>
          Pesquise em uma base global e importe para o seu app
        </Text>
      </View>

      <View style={styles.buscaRow}>
        <View style={styles.buscaInput}>
          <SearchBar
            value={busca}
            onChangeText={setBusca}
            placeholder="Ex: chicken, pasta, cake..."
            onClear={() => { setBusca(''); setResultados([]); setBuscou(false); }}
          />
        </View>
        <TouchableOpacity style={styles.buscaBtn} onPress={handleBuscar}>
          <Text style={styles.buscaBtnTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={Colors.black} size="large" />
          <Text style={styles.carregandoTexto}>Buscando receitas...</Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderItem}
          contentContainerStyle={resultados.length === 0 ? styles.listaVazia : { paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            buscou ? null : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcon}>🌐</Text>
                <Text style={styles.placeholderTexto}>
                  Busque receitas do mundo todo e salve no seu app
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.black,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  buscaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  buscaInput: { flex: 1 },
  buscaBtn: {
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 4,
  },
  buscaBtnTexto: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  carregandoTexto: { fontSize: 14, color: Colors.textSecondary },
  listaVazia: { flexGrow: 1, justifyContent: 'center' },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  placeholderIcon: { fontSize: 52, marginBottom: 16 },
  placeholderTexto: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  cardImagem: { width: 90, height: 90 },
  cardImagemPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardConteudo: { flex: 1, padding: 10, gap: 4 },
  cardNome: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tag: { backgroundColor: Colors.black, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagTexto: { color: Colors.white, fontSize: 10, fontWeight: '600' },
  cardArea: { fontSize: 11, color: Colors.textSecondary },
  importarBtn: {
    marginTop: 4,
    backgroundColor: Colors.black,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  importarBtnJaFeito: {
    backgroundColor: Colors.gray300,
  },
  importarBtnTexto: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
