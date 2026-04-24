import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MealApiMeal, MealApiPreview } from '../types';
import { buscarMealCompletoPorId, converterMealParaReceita } from '../services/mealApi';
import { inserirReceita } from '../database/recipeRepository';
import { Colors } from '../constants/colors';

interface Props {
  preview: MealApiPreview | null;
  onFechar: () => void;
  onImportado: (idMeal: string) => void;
  jaImportado: boolean;
  /** Se fornecido, usa os dados diretamente sem fazer nova chamada à API */
  mealCompleto?: MealApiMeal;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ApiRecipeModal({ preview, onFechar, onImportado, jaImportado, mealCompleto }: Props) {
  const [meal, setMeal] = useState<MealApiMeal | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!preview) return;
    setErro(false);
    if (mealCompleto) {
      // Dados já disponíveis — usa direto, sem chamada à API
      setMeal(mealCompleto);
      setCarregando(false);
    } else {
      setMeal(null);
      buscar();
    }
  }, [preview?.idMeal]);

  async function buscar() {
    if (!preview) return;
    setCarregando(true);
    try {
      const dados = await buscarMealCompletoPorId(preview.idMeal);
      if (!dados) throw new Error();
      setMeal(dados);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  async function handleImportar() {
    if (!meal || importando || jaImportado) return;
    setImportando(true);
    try {
      const receita = converterMealParaReceita(meal);
      inserirReceita(receita);
      onImportado(meal.idMeal);
    } finally {
      setImportando(false);
    }
  }

  const ingredientes = meal
    ? Array.from({ length: 20 }, (_, i) => {
        const ing = meal[`strIngredient${i + 1}` as keyof MealApiMeal] as string;
        const med = meal[`strMeasure${i + 1}` as keyof MealApiMeal] as string;
        if (!ing?.trim()) return null;
        return [med?.trim(), ing.trim()].filter(Boolean).join(' ');
      }).filter((x): x is string => x !== null)
    : [];

  const passos = meal
    ? (meal.strInstructions ?? '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <Modal
      visible={!!preview}
      animationType="slide"
      transparent
      onRequestClose={onFechar}
    >
      <View style={styles.overlay}>
        {/* Toque fora para fechar */}
        <TouchableOpacity style={styles.backdrop} onPress={onFechar} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Botão fechar */}
          <TouchableOpacity style={styles.fecharBtn} onPress={onFechar}>
            <Text style={styles.fecharTexto}>✕</Text>
          </TouchableOpacity>

          {carregando ? (
            <View style={styles.centro}>
              <ActivityIndicator size="large" color={Colors.black} />
              <Text style={styles.carregandoTexto}>Carregando receita...</Text>
            </View>
          ) : erro ? (
            <View style={styles.centro}>
              <Text style={styles.erroIcone}>⚠️</Text>
              <Text style={styles.erroTexto}>Não foi possível carregar.</Text>
              <TouchableOpacity style={styles.tentarBtn} onPress={buscar}>
                <Text style={styles.tentarTexto}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : meal ? (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Imagem */}
                <Image
                  source={{ uri: meal.strMealThumb }}
                  style={styles.imagem}
                  resizeMode="cover"
                />

                {/* Nome */}
                <View style={styles.cabecalho}>
                  <Text style={styles.nome}>{meal.strMeal}</Text>
                  <View style={styles.tagsRow}>
                    {meal.strCategory ? (
                      <View style={styles.tag}>
                        <Text style={styles.tagTexto}>{meal.strCategory}</Text>
                      </View>
                    ) : null}
                    {meal.strArea ? (
                      <View style={[styles.tag, styles.tagCinza]}>
                        <Text style={styles.tagTextoCinza}>{meal.strArea}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Ingredientes */}
                <Secao titulo="Ingredientes" icone="🧂">
                  {ingredientes.map((ing, i) => (
                    <View key={i} style={styles.ingredienteItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.ingredienteTexto}>{ing}</Text>
                    </View>
                  ))}
                </Secao>

                {/* Modo de preparo */}
                <Secao titulo="Modo de Preparo" icone="👨‍🍳">
                  {passos.length > 1 ? (
                    passos.map((passo, i) => (
                      <View key={i} style={styles.passoItem}>
                        <Text style={styles.passoNumero}>{i + 1}</Text>
                        <Text style={styles.passoTexto}>{passo}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.textoLongo}>{meal.strInstructions}</Text>
                  )}
                </Secao>

                {/* Espaço para o botão fixo */}
                <View style={{ height: 80 }} />
              </ScrollView>

              {/* Botão importar fixo no rodapé */}
              <View style={styles.rodape}>
                <TouchableOpacity
                  style={[
                    styles.importarBtn,
                    (jaImportado || importando) && styles.importarBtnDesabilitado,
                  ]}
                  onPress={handleImportar}
                  disabled={jaImportado || importando}
                >
                  {importando ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.importarBtnTexto}>
                      {jaImportado ? '✓  Receita já salva' : '↓  Salvar nas minhas receitas'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Secao({
  titulo,
  icone,
  children,
}: {
  titulo: string;
  icone: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.secao}>
      <View style={styles.secaoHeader}>
        <Text style={styles.secaoIcone}>{icone}</Text>
        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>
      <View style={styles.secaoDivisor} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.92,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  fecharBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fecharTexto: { fontSize: 14, color: Colors.gray700, fontWeight: '700' },

  centro: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, minHeight: 200 },
  carregandoTexto: { fontSize: 14, color: Colors.textSecondary },
  erroIcone: { fontSize: 36 },
  erroTexto: { fontSize: 14, color: Colors.textSecondary },
  tentarBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tentarTexto: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  scroll: { paddingBottom: 16 },
  imagem: { width: '100%', height: 220 },
  cabecalho: { padding: 16, paddingBottom: 8 },
  nome: { fontSize: 20, fontWeight: '800', color: Colors.black, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.black,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTexto: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  tagCinza: { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.border },
  tagTextoCinza: { color: Colors.textSecondary, fontSize: 12 },

  secao: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 8 },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secaoIcone: { fontSize: 16 },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: Colors.black },
  secaoDivisor: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },

  ingredienteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.black, marginTop: 7, marginRight: 10 },
  ingredienteTexto: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },

  passoItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  passoNumero: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.black,
    color: Colors.white, textAlign: 'center', lineHeight: 24, fontSize: 12,
    fontWeight: '700', marginRight: 10, marginTop: 1, flexShrink: 0,
  },
  passoTexto: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  textoLongo: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },

  rodape: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  importarBtn: {
    backgroundColor: Colors.black,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  importarBtnDesabilitado: { backgroundColor: Colors.gray300 },
  importarBtnTexto: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
