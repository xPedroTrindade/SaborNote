import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Receita } from '../types';
import { buscarPorId, inserirReceita, atualizarReceita } from '../database/recipeRepository';
import { Colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecipeForm'>;
  route: RouteProp<RootStackParamList, 'RecipeForm'>;
};

const CATEGORIAS = ['Café da Manhã', 'Almoço', 'Jantar', 'Sobremesa', 'Lanche', 'Bebida', 'Outro'];

export function RecipeFormScreen({ navigation, route }: Props) {
  const receitaId = route.params?.receitaId;
  const editando = !!receitaId;

  const [nome, setNome] = useState('');
  const [ingredientes, setIngredientes] = useState('');
  const [modoPreparo, setModoPreparo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tempoPreparo, setTempoPreparo] = useState('');
  const [favorita, setFavorita] = useState(false);
  const [anotacoes, setAnotacoes] = useState('');
  const [imagemUri, setImagemUri] = useState('');
  const [origem, setOrigem] = useState('manual');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (receitaId) {
      const receita = buscarPorId(receitaId);
      if (receita) {
        setNome(receita.nome);
        setIngredientes(receita.ingredientes);
        setModoPreparo(receita.modoPreparo);
        setCategoria(receita.categoria);
        setTempoPreparo(receita.tempoPreparo);
        setFavorita(receita.favorita);
        setAnotacoes(receita.anotacoes);
        setImagemUri(receita.imagemUri);
        setOrigem(receita.origem);
      }
    }
    navigation.setOptions({ title: editando ? 'Editar Receita' : 'Nova Receita' });
  }, [receitaId]);

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome da receita é obrigatório.');
      return;
    }
    if (!ingredientes.trim()) {
      Alert.alert('Atenção', 'Informe os ingredientes.');
      return;
    }
    if (!modoPreparo.trim()) {
      Alert.alert('Atenção', 'Informe o modo de preparo.');
      return;
    }

    setSalvando(true);
    try {
      const agora = new Date().toISOString();
      if (editando) {
        const receitaAtual = buscarPorId(receitaId!)!;
        atualizarReceita({
          ...receitaAtual,
          nome: nome.trim(),
          ingredientes: ingredientes.trim(),
          modoPreparo: modoPreparo.trim(),
          categoria: categoria.trim(),
          tempoPreparo: tempoPreparo.trim(),
          favorita,
          anotacoes: anotacoes.trim(),
          imagemUri: imagemUri.trim(),
          origem: origem.trim(),
          updatedAt: agora,
        });
      } else {
        inserirReceita({
          nome: nome.trim(),
          ingredientes: ingredientes.trim(),
          modoPreparo: modoPreparo.trim(),
          categoria: categoria.trim(),
          tempoPreparo: tempoPreparo.trim(),
          favorita,
          anotacoes: anotacoes.trim(),
          imagemUri: imagemUri.trim(),
          origem: origem.trim() || 'manual',
          createdAt: agora,
          updatedAt: agora,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a receita.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Campo label="Nome da Receita *" obrigatorio>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Bolo de cenoura"
            placeholderTextColor={Colors.gray500}
          />
        </Campo>

        <Campo label="Categoria">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriaScroll}>
            <View style={styles.categoriaRow}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, categoria === cat && styles.catBtnAtivo]}
                  onPress={() => setCategoria(categoria === cat ? '' : cat)}
                >
                  <Text style={[styles.catTexto, categoria === cat && styles.catTextoAtivo]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Campo>

        <Campo label="Tempo de Preparo">
          <TextInput
            style={styles.input}
            value={tempoPreparo}
            onChangeText={setTempoPreparo}
            placeholder="Ex: 45 minutos"
            placeholderTextColor={Colors.gray500}
          />
        </Campo>

        <Campo label="Ingredientes *" obrigatorio>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ingredientes}
            onChangeText={setIngredientes}
            placeholder="Liste um ingrediente por linha&#10;Ex: 2 ovos&#10;1 xícara de farinha"
            placeholderTextColor={Colors.gray500}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </Campo>

        <Campo label="Modo de Preparo *" obrigatorio>
          <TextInput
            style={[styles.input, styles.textAreaGrande]}
            value={modoPreparo}
            onChangeText={setModoPreparo}
            placeholder="Descreva o passo a passo..."
            placeholderTextColor={Colors.gray500}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
          />
        </Campo>

        <Campo label="URL da Imagem">
          <TextInput
            style={styles.input}
            value={imagemUri}
            onChangeText={setImagemUri}
            placeholder="https://exemplo.com/imagem.jpg"
            placeholderTextColor={Colors.gray500}
            keyboardType="url"
            autoCapitalize="none"
          />
        </Campo>

        <Campo label="Origem">
          <TextInput
            style={styles.input}
            value={origem}
            onChangeText={setOrigem}
            placeholder="Ex: Vovó, Livro Culinária..."
            placeholderTextColor={Colors.gray500}
          />
        </Campo>

        <Campo label="Anotações">
          <TextInput
            style={[styles.input, styles.textArea]}
            value={anotacoes}
            onChangeText={setAnotacoes}
            placeholder="Dicas, observações, variações..."
            placeholderTextColor={Colors.gray500}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Campo>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Marcar como Favorita ★</Text>
          <Switch
            value={favorita}
            onValueChange={setFavorita}
            trackColor={{ false: Colors.gray300, true: Colors.black }}
            thumbColor={Colors.white}
          />
        </View>

        <TouchableOpacity
          style={[styles.botao, salvando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text style={styles.botaoTexto}>
            {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Receita'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  label,
  obrigatorio = false,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>
        {label}
        {obrigatorio && <Text style={styles.obrigatorioMark}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  campo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 6,
  },
  obrigatorioMark: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  textAreaGrande: {
    minHeight: 140,
    paddingTop: 10,
  },
  categoriaScroll: {
    marginVertical: 2,
  },
  categoriaRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  catBtnAtivo: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  catTexto: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catTextoAtivo: {
    color: Colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  botao: {
    backgroundColor: Colors.black,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: {
    backgroundColor: Colors.gray500,
  },
  botaoTexto: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
