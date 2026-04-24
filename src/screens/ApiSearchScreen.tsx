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
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MealApiMeal, MealApiPreview } from '../types';
import {
  buscarReceitasNaApi,
  buscarPorCategoria,
  converterMealParaReceita,
  CATEGORIAS_API,
} from '../services/mealApi';
import { inserirReceita } from '../database/recipeRepository';
import { ApiRecipeModal } from '../components/ApiRecipeModal';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ApiSearch'>;
};

type ModoFiltro = 'nome' | 'categoria';

export function ApiSearchScreen({ navigation }: Props) {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [resultados, setResultados] = useState<MealApiMeal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);
  const [importados, setImportados] = useState<Set<string>>(new Set());
  const [modoFiltro, setModoFiltro] = useState<ModoFiltro>('nome');
  const [erro, setErro] = useState('');
  const [mealSelecionado, setMealSelecionado] = useState<MealApiMeal | null>(null);

  async function executarBusca(termo: string) {
    if (!termo.trim()) {
      Alert.alert('Atenção', 'Digite um termo para buscar.');
      return;
    }
    Keyboard.dismiss();
    setCarregando(true);
    setBuscou(true);
    setErro('');
    setResultados([]);
    try {
      const meals = await buscarReceitasNaApi(termo.trim());
      setResultados(meals);
      if (meals.length === 0) setErro(`Nenhuma receita encontrada para "${termo}".`);
    } catch (e: any) {
      setErro('Falha na conexão. Verifique a internet e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  async function buscarCategoria(cat: string) {
    Keyboard.dismiss();
    setCategoriaAtiva(cat);
    setBusca('');
    setCarregando(true);
    setBuscou(true);
    setErro('');
    setResultados([]);
    try {
      const meals = await buscarPorCategoria(cat);
      setResultados(meals);
      if (meals.length === 0) setErro(`Sem resultados para a categoria.`);
    } catch {
      setErro('Falha na conexão. Verifique a internet e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function limparBusca() {
    setBusca('');
    setCategoriaAtiva('');
    setResultados([]);
    setBuscou(false);
    setErro('');
  }

  function handleImportar(meal: MealApiMeal) {
    Alert.alert(
      'Importar Receita',
      `Salvar "${meal.strMeal}" nas suas receitas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: () => {
            const receita = converterMealParaReceita(meal);
            inserirReceita(receita);
            setImportados((prev) => new Set([...prev, meal.idMeal]));
            Alert.alert('Salvo!', `"${meal.strMeal}" adicionada às suas receitas.`);
          },
        },
      ],
    );
  }

  function renderCard({ item }: { item: MealApiMeal }) {
    const jaImportado = importados.has(item.idMeal);

    const primeirosIngredientes: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const ing = item[`strIngredient${i}` as keyof MealApiMeal] as string;
      if (ing?.trim()) primeirosIngredientes.push(ing.trim());
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setMealSelecionado(item)}
        activeOpacity={0.85}
      >
        {item.strMealThumb ? (
          <Image source={{ uri: item.strMealThumb }} style={styles.cardImagem} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagemPlaceholder}>
            <Text style={styles.cardImagemPlaceholderIcon}>🍽</Text>
          </View>
        )}

        <View style={styles.cardCorpo}>
          <Text style={styles.cardNome} numberOfLines={2}>
            {item.strMeal}
          </Text>

          <View style={styles.tagsRow}>
            {item.strCategory ? (
              <View style={styles.tag}>
                <Text style={styles.tagTexto}>{item.strCategory}</Text>
              </View>
            ) : null}
            {item.strArea ? (
              <View style={[styles.tag, styles.tagCinza]}>
                <Text style={styles.tagTextoCinza}>{item.strArea}</Text>
              </View>
            ) : null}
          </View>

          {primeirosIngredientes.length > 0 && (
            <Text style={styles.ingredientesPreview} numberOfLines={1}>
              {primeirosIngredientes.join(' · ')}{'...'}
            </Text>
          )}

          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.detalhesBtn}
              onPress={() => setMealSelecionado(item)}
            >
              <Text style={styles.detalhesBtnTexto}>Ver receita</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.importarBtn, jaImportado && styles.importarBtnFeito]}
              onPress={(e) => { e.stopPropagation?.(); !jaImportado && handleImportar(item); }}
              disabled={jaImportado}
            >
              <Text style={[styles.importarBtnTexto, jaImportado && styles.importarBtnTextoFeito]}>
                {jaImportado ? '✓' : '↓'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Abas: busca por nome / por categoria */}
      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, modoFiltro === 'nome' && styles.abaAtiva]}
          onPress={() => { setModoFiltro('nome'); limparBusca(); }}
        >
          <Text style={[styles.abaTexto, modoFiltro === 'nome' && styles.abaTextoAtivo]}>
            Por Nome
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, modoFiltro === 'categoria' && styles.abaAtiva]}
          onPress={() => { setModoFiltro('categoria'); limparBusca(); }}
        >
          <Text style={[styles.abaTexto, modoFiltro === 'categoria' && styles.abaTextoAtivo]}>
            Por Categoria
          </Text>
        </TouchableOpacity>
      </View>

      {/* Busca por nome */}
      {modoFiltro === 'nome' && (
        <View style={styles.buscaRow}>
          <View style={styles.buscaInputContainer}>
            <Text style={styles.buscaIcone}>🔍</Text>
            <TextInput
              style={styles.buscaInput}
              value={busca}
              onChangeText={setBusca}
              placeholder="Ex: chicken, pasta, cake..."
              placeholderTextColor={Colors.gray500}
              returnKeyType="search"
              onSubmitEditing={() => executarBusca(busca)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={limparBusca} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.buscaLimpar}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.lupaBotao, carregando && styles.lupaBotaoDesabilitado]}
            onPress={() => executarBusca(busca)}
            disabled={carregando}
            activeOpacity={0.8}
          >
            <Text style={styles.lupaBotaoTexto}>🔍</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categorias */}
      {modoFiltro === 'categoria' && (
        <View style={styles.categoriasContainer}>
          <Text style={styles.categoriasTitulo}>Escolha uma categoria:</Text>
          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={false}
            style={styles.categoriasScroll}
          >
            <View style={styles.categoriasGrade}>
              {CATEGORIAS_API.map((cat) => (
                <TouchableOpacity
                  key={cat.valor}
                  style={[
                    styles.categoriaChip,
                    categoriaAtiva === cat.valor && styles.categoriaChipAtivo,
                  ]}
                  onPress={() => buscarCategoria(cat.valor)}
                  disabled={carregando}
                >
                  <Text
                    style={[
                      styles.categoriaChipTexto,
                      categoriaAtiva === cat.valor && styles.categoriaChipTextoAtivo,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Contador de resultados */}
      {buscou && !carregando && resultados.length > 0 && (
        <View style={styles.contadorRow}>
          <Text style={styles.contadorTexto}>
            {resultados.length} receita{resultados.length !== 1 ? 's' : ''} encontrada
            {resultados.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={limparBusca}>
            <Text style={styles.limparTexto}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conteúdo principal */}
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={Colors.black} size="large" />
          <Text style={styles.carregandoTexto}>Buscando receitas...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.erroIcone}>⚠️</Text>
          <Text style={styles.erroTexto}>{erro}</Text>
          <TouchableOpacity style={styles.tentarNovamenteBtn} onPress={limparBusca}>
            <Text style={styles.tentarNovamenteTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderCard}
          contentContainerStyle={
            resultados.length === 0 ? styles.listaVazia : { paddingBottom: 24 }
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !buscou ? (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcone}>🌐</Text>
                <Text style={styles.placeholderTitulo}>Busque receitas do mundo todo</Text>
                <Text style={styles.placeholderSub}>
                  A API é em inglês — use termos como{'\n'}
                  <Text style={styles.placeholderDestaque}>chicken, pasta, beef, cake...</Text>
                </Text>
              </View>
            ) : null
          }
        />
      )}
      {/* Modal de detalhes */}
      <ApiRecipeModal
        preview={mealSelecionado
          ? { idMeal: mealSelecionado.idMeal, strMeal: mealSelecionado.strMeal, strMealThumb: mealSelecionado.strMealThumb }
          : null}
        mealCompleto={mealSelecionado ?? undefined}
        onFechar={() => setMealSelecionado(null)}
        onImportado={(id) => {
          setImportados((prev) => new Set([...prev, id]));
          setMealSelecionado(null);
        }}
        jaImportado={mealSelecionado ? importados.has(mealSelecionado.idMeal) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  abas: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  abaAtiva: { borderBottomColor: Colors.black },
  abaTexto: { fontSize: 14, fontWeight: '600', color: Colors.gray500 },
  abaTextoAtivo: { color: Colors.black },

  buscaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  buscaInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 46,
  },
  buscaIcone: { fontSize: 15, marginRight: 8 },
  buscaInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  buscaLimpar: { fontSize: 13, color: Colors.gray500, paddingLeft: 8 },

  lupaBotao: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lupaBotaoDesabilitado: { backgroundColor: Colors.gray500 },
  lupaBotaoTexto: { fontSize: 18 },

  categoriasContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  categoriasTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 8,
  },
  categoriasScroll: { maxHeight: 140 },
  categoriasGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoriaChipAtivo: { backgroundColor: Colors.black, borderColor: Colors.black },
  categoriaChipTexto: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  categoriaChipTextoAtivo: { color: Colors.white },

  contadorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contadorTexto: { fontSize: 12, color: Colors.gray500, fontWeight: '600' },
  limparTexto: { fontSize: 12, color: Colors.black, fontWeight: '700' },

  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  carregandoTexto: { fontSize: 14, color: Colors.textSecondary },
  erroIcone: { fontSize: 36 },
  erroTexto: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tentarNovamenteBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tentarNovamenteTexto: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  listaVazia: { flexGrow: 1, justifyContent: 'center' },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  placeholderIcone: { fontSize: 52, marginBottom: 16 },
  placeholderTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholderDestaque: { fontWeight: '700', color: Colors.black },

  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  cardImagem: { width: 100, height: 100 },
  cardImagemPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagemPlaceholderIcon: { fontSize: 30 },
  cardCorpo: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardNome: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: {
    backgroundColor: Colors.black,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagTexto: { color: Colors.white, fontSize: 10, fontWeight: '600' },
  tagCinza: { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.border },
  tagTextoCinza: { color: Colors.textSecondary, fontSize: 10 },
  ingredientesPreview: { fontSize: 11, color: Colors.gray500, marginBottom: 6 },
  botoesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detalhesBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  detalhesBtnTexto: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  importarBtn: {
    backgroundColor: Colors.black,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  importarBtnFeito: { backgroundColor: Colors.gray200 },
  importarBtnTexto: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  importarBtnTextoFeito: { color: Colors.gray500 },
});
