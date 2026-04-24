import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Receita } from '../types';
import {
  buscarPorId,
  toggleFavorita,
  atualizarReceita,
  excluirReceita,
} from '../database/recipeRepository';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;
  route: RouteProp<RootStackParamList, 'RecipeDetail'>;
};

export function RecipeDetailScreen({ navigation, route }: Props) {
  const { receitaId } = route.params;
  const [receita, setReceita] = useState<Receita | null>(null);
  const [editandoAnotacao, setEditandoAnotacao] = useState(false);
  const [anotacaoTemp, setAnotacaoTemp] = useState('');

  function carregar() {
    const r = buscarPorId(receitaId);
    setReceita(r);
    if (r) setAnotacaoTemp(r.anotacoes);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregar);
    return unsubscribe;
  }, [navigation]);

  function handleToggleFavorita() {
    if (!receita) return;
    toggleFavorita(receita.id!, !receita.favorita);
    carregar();
  }

  function handleSalvarAnotacao() {
    if (!receita) return;
    atualizarReceita({ ...receita, anotacoes: anotacaoTemp, updatedAt: new Date().toISOString() });
    setEditandoAnotacao(false);
    carregar();
  }

  function handleExcluir() {
    Alert.alert(
      'Excluir receita',
      `Deseja excluir "${receita?.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            excluirReceita(receitaId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  if (!receita) {
    return (
      <View style={styles.centro}>
        <Text style={styles.semReceita}>Receita não encontrada.</Text>
      </View>
    );
  }

  const ingredientesList = receita.ingredientes
    .split('\n')
    .map((i) => i.trim())
    .filter(Boolean);

  const modoPreparoList = receita.modoPreparo
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagem */}
        {receita.imagemUri ? (
          <Image source={{ uri: receita.imagemUri }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemPlaceholder}>
            <Text style={styles.imagemPlaceholderIcon}>🍽</Text>
          </View>
        )}

        <View style={styles.conteudo}>
          {/* Nome e favorito */}
          <View style={styles.nomeRow}>
            <Text style={styles.nome}>{receita.nome}</Text>
            <TouchableOpacity onPress={handleToggleFavorita} style={styles.favBtn}>
              <Text style={styles.favIcon}>{receita.favorita ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {receita.categoria ? (
              <View style={styles.tag}>
                <Text style={styles.tagTexto}>{receita.categoria}</Text>
              </View>
            ) : null}
            {receita.tempoPreparo ? (
              <View style={[styles.tag, styles.tagSecundario]}>
                <Text style={styles.tagTextoSecundario}>⏱ {receita.tempoPreparo}</Text>
              </View>
            ) : null}
            {receita.origem && receita.origem !== 'manual' ? (
              <View style={[styles.tag, styles.tagSecundario]}>
                <Text style={styles.tagTextoSecundario}>📌 {receita.origem}</Text>
              </View>
            ) : null}
          </View>

          {/* Ingredientes */}
          <Secao titulo="Ingredientes">
            {ingredientesList.length > 0 ? (
              ingredientesList.map((ing, i) => (
                <View key={i} style={styles.ingredienteItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredienteTexto}>{ing}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.textoVazio}>Nenhum ingrediente informado.</Text>
            )}
          </Secao>

          {/* Modo de Preparo */}
          <Secao titulo="Modo de Preparo">
            {modoPreparoList.length > 0 ? (
              modoPreparoList.map((passo, i) => (
                <View key={i} style={styles.passoItem}>
                  <Text style={styles.passoNumero}>{i + 1}</Text>
                  <Text style={styles.passoTexto}>{passo}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.textoCompleto}>{receita.modoPreparo || 'Não informado.'}</Text>
            )}
          </Secao>

          {/* Anotações */}
          <Secao titulo="Anotações">
            {editandoAnotacao ? (
              <View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={anotacaoTemp}
                  onChangeText={setAnotacaoTemp}
                  placeholder="Adicione suas anotações..."
                  placeholderTextColor={Colors.gray500}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.anotacaoBotoes}>
                  <TouchableOpacity style={styles.botaoSecundario} onPress={() => { setEditandoAnotacao(false); setAnotacaoTemp(receita.anotacoes); }}>
                    <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botaoPrimario} onPress={handleSalvarAnotacao}>
                    <Text style={styles.botaoPrimarioTexto}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditandoAnotacao(true)} style={styles.anotacaoArea}>
                <Text style={receita.anotacoes ? styles.anotacaoTexto : styles.textoVazio}>
                  {receita.anotacoes || 'Toque para adicionar anotações...'}
                </Text>
                <Text style={styles.editarAnotacaoHint}>✎ editar</Text>
              </TouchableOpacity>
            )}
          </Secao>

          {/* Datas */}
          <View style={styles.datas}>
            <Text style={styles.dataTexto}>
              Criado em: {new Date(receita.createdAt).toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.dataTexto}>
              Atualizado em: {new Date(receita.updatedAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          {/* Ações */}
          <View style={styles.acoesRow}>
            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={() => navigation.navigate('RecipeForm', { receitaId: receita.id })}
            >
              <Text style={styles.botaoEditarTexto}>✎ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluir}>
              <Text style={styles.botaoExcluirTexto}>🗑 Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      <View style={styles.secaoDivisor} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  semReceita: { fontSize: 16, color: Colors.textSecondary },
  imagem: { width: '100%', height: 220 },
  imagemPlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemPlaceholderIcon: { fontSize: 52 },
  conteudo: { padding: 20 },
  nomeRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  nome: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.black, marginRight: 8 },
  favBtn: { paddingTop: 2 },
  favIcon: { fontSize: 26, color: Colors.star },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: Colors.black, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagTexto: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  tagSecundario: { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.border },
  tagTextoSecundario: { color: Colors.textSecondary, fontSize: 12 },
  secao: { marginBottom: 24 },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  secaoDivisor: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  ingredienteItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.black, marginTop: 7, marginRight: 10 },
  ingredienteTexto: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  passoItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  passoNumero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.black,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 10,
    marginTop: 1,
  },
  passoTexto: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  textoCompleto: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  textoVazio: { fontSize: 14, color: Colors.gray500, fontStyle: 'italic' },
  anotacaoArea: { gap: 4 },
  anotacaoTexto: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  editarAnotacaoHint: { fontSize: 11, color: Colors.gray500, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: { minHeight: 80, paddingTop: 10 },
  anotacaoBotoes: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botaoSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoSecundarioTexto: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  botaoPrimario: {
    flex: 1,
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botaoPrimarioTexto: { fontSize: 14, color: Colors.white, fontWeight: '700' },
  datas: { marginBottom: 20, gap: 2 },
  dataTexto: { fontSize: 11, color: Colors.gray500 },
  acoesRow: { flexDirection: 'row', gap: 12 },
  botaoEditar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.black,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoEditarTexto: { fontSize: 14, color: Colors.black, fontWeight: '700' },
  botaoExcluir: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoExcluirTexto: { fontSize: 14, color: Colors.white, fontWeight: '700' },
});
