import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MealApiPreview, RootStackParamList } from '../types';
import {
  buscarPreviewsPorCategoria,
  buscarMealCompletoPorId,
  converterMealParaReceita,
} from '../services/mealApi';
import { inserirReceita } from '../database/recipeRepository';
import { ApiRecipeModal } from './ApiRecipeModal';
import { Colors } from '../constants/colors';

interface Secao {
  label: string;
  emoji: string;
  categoria: string;
}

const SECOES: Secao[] = [
  { label: 'Frango', emoji: '🍗', categoria: 'Chicken' },
  { label: 'Massas', emoji: '🍝', categoria: 'Pasta' },
  { label: 'Sobremesas', emoji: '🍰', categoria: 'Dessert' },
  { label: 'Frutos do Mar', emoji: '🦞', categoria: 'Seafood' },
  { label: 'Vegetariano', emoji: '🥗', categoria: 'Vegetarian' },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function ExploreTab({ navigation }: Props) {
  const [dados, setDados] = useState<Record<string, MealApiPreview[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState<Set<string>>(new Set());
  const [importados, setImportados] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState(false);

  // Modal de detalhes
  const [previewSelecionado, setPreviewSelecionado] = useState<MealApiPreview | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    setErro(false);
    try {
      const resultados = await Promise.all(
        SECOES.map((s) =>
          buscarPreviewsPorCategoria(s.categoria).catch(() => [] as MealApiPreview[]),
        ),
      );
      const mapa: Record<string, MealApiPreview[]> = {};
      SECOES.forEach((s, i) => {
        mapa[s.categoria] = resultados[i];
      });
      setDados(mapa);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  async function handleImportarRapido(preview: MealApiPreview) {
    if (importados.has(preview.idMeal) || importando.has(preview.idMeal)) return;
    setImportando((prev) => new Set([...prev, preview.idMeal]));
    try {
      const meal = await buscarMealCompletoPorId(preview.idMeal);
      if (!meal) throw new Error();
      inserirReceita(converterMealParaReceita(meal));
      setImportados((prev) => new Set([...prev, preview.idMeal]));
      Alert.alert('Salvo!', `"${preview.strMeal}" adicionada às suas receitas.`);
    } catch {
      Alert.alert('Erro', 'Não foi possível importar. Tente novamente.');
    } finally {
      setImportando((prev) => {
        const next = new Set(prev);
        next.delete(preview.idMeal);
        return next;
      });
    }
  }

  function handleImportadoNoModal(idMeal: string) {
    setImportados((prev) => new Set([...prev, idMeal]));
    Alert.alert('Salvo!', 'Receita adicionada às suas receitas.');
  }

  function renderCard({ item }: { item: MealApiPreview }) {
    const estaImportando = importando.has(item.idMeal);
    const jaImportado = importados.has(item.idMeal);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setPreviewSelecionado(item)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.strMealThumb }} style={styles.cardImagem} resizeMode="cover" />

        {/* Badge "importado" sobre a imagem */}
        {jaImportado && (
          <View style={styles.badgeImportado}>
            <Text style={styles.badgeTexto}>✓</Text>
          </View>
        )}

        <View style={styles.cardRodape}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.strMeal}
          </Text>
          <TouchableOpacity
            style={[
              styles.importarBtn,
              jaImportado && styles.importarBtnFeito,
              estaImportando && styles.importarBtnCarregando,
            ]}
            onPress={(e) => {
              e.stopPropagation?.();
              handleImportarRapido(item);
            }}
            disabled={jaImportado || estaImportando}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {estaImportando ? (
              <ActivityIndicator size={12} color={Colors.white} />
            ) : (
              <Text style={styles.importarBtnTexto}>{jaImportado ? '✓' : '+'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={Colors.black} />
        <Text style={styles.carregandoTexto}>Carregando receitas...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erroIcone}>📡</Text>
        <Text style={styles.erroTexto}>Sem conexão com a internet</Text>
        <TouchableOpacity style={styles.tentarNovamenteBtn} onPress={carregarTudo}>
          <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.topo}>
          <Text style={styles.topoBemVindo}>🌍 Descubra receitas do mundo</Text>
          <Text style={styles.topoSub}>
            <Text style={styles.topoDestaque}>Toque no card</Text> para ver detalhes ·{' '}
            <Text style={styles.topoDestaque}>+</Text> para salvar rápido
          </Text>
        </View>

        {SECOES.map((secao) => {
          const items = dados[secao.categoria] ?? [];
          if (items.length === 0) return null;
          return (
            <View key={secao.categoria} style={styles.secao}>
              <View style={styles.secaoHeader}>
                <Text style={styles.secaoTitulo}>
                  {secao.emoji} {secao.label}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('ApiSearch')}>
                  <Text style={styles.secaoVerMais}>Ver mais →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={items}
                keyExtractor={(item) => item.idMeal}
                renderItem={renderCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listaHorizontal}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Modal de detalhes */}
      <ApiRecipeModal
        preview={previewSelecionado}
        onFechar={() => setPreviewSelecionado(null)}
        onImportado={handleImportadoNoModal}
        jaImportado={previewSelecionado ? importados.has(previewSelecionado.idMeal) : false}
      />
    </>
  );
}

const CARD_WIDTH = 150;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12,
  },
  carregandoTexto: { fontSize: 14, color: Colors.textSecondary },
  erroIcone: { fontSize: 40 },
  erroTexto: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  tentarNovamenteBtn: {
    marginTop: 4, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10,
  },
  tentarNovamenteTexto: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  topo: { paddingHorizontal: 16, paddingVertical: 12 },
  topoBemVindo: { fontSize: 15, fontWeight: '700', color: Colors.black },
  topoSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  topoDestaque: { fontWeight: '800', color: Colors.black },

  secao: { marginBottom: 20 },
  secaoHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 10,
  },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: Colors.black },
  secaoVerMais: { fontSize: 12, color: Colors.gray500, fontWeight: '600' },
  listaHorizontal: { paddingHorizontal: 16, gap: 12 },

  card: {
    width: CARD_WIDTH, borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  cardImagem: { width: CARD_WIDTH, height: CARD_WIDTH },
  badgeImportado: {
    position: 'absolute', top: 6, left: 6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center',
  },
  badgeTexto: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  cardRodape: { padding: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  cardNome: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.textPrimary, lineHeight: 16 },
  importarBtn: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.black,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  importarBtnFeito: { backgroundColor: Colors.gray300 },
  importarBtnCarregando: { backgroundColor: Colors.gray700 },
  importarBtnTexto: { color: Colors.white, fontSize: 16, fontWeight: '700', lineHeight: 18 },
});
