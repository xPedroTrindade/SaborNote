import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';

interface ItemAjuda {
  pergunta: string;
  resposta: string;
  emoji: string;
}

const ITENS: ItemAjuda[] = [
  {
    emoji: '👤',
    pergunta: 'Como criar uma conta?',
    resposta:
      'Na tela de login, toque em "Cadastre-se". Preencha seu nome, e-mail e uma senha com pelo menos 4 caracteres. Após o cadastro, faça login com seu e-mail e senha.',
  },
  {
    emoji: '➕',
    pergunta: 'Como cadastrar uma receita?',
    resposta:
      'Na tela inicial (Minhas Receitas), toque no botão "+" no canto inferior direito. Preencha o nome, ingredientes, modo de preparo e demais campos. Toque em "Cadastrar Receita" para salvar.',
  },
  {
    emoji: '🔍',
    pergunta: 'Como buscar minhas receitas?',
    resposta:
      'Use a barra de busca no topo da tela "Minhas Receitas". Por padrão, busca pelo nome. Selecione o filtro "Por Ingrediente" para buscar pelo que você tem em casa. O filtro "★ Favoritos" exibe apenas as marcadas.',
  },
  {
    emoji: '🌍',
    pergunta: 'O que é a aba Explorar?',
    resposta:
      'A aba "Explorar" carrega automaticamente receitas do mundo todo de uma base online. Cada seção mostra uma categoria diferente (Frango, Massas, Sobremesas etc.). Toque em "+" em qualquer receita para salvá-la nas suas receitas locais.',
  },
  {
    emoji: '★',
    pergunta: 'Como marcar uma receita como favorita?',
    resposta:
      'Toque na estrela (☆) no lado direito de qualquer receita na lista, ou acesse os detalhes da receita e toque no ícone ★ no canto superior direito. Receitas favoritas ficam com a estrela amarela preenchida.',
  },
  {
    emoji: '📝',
    pergunta: 'Como adicionar anotações?',
    resposta:
      'Abra os detalhes de uma receita e role até a seção "Anotações". Toque em "✎ editar" para digitar suas observações pessoais — dicas, variações, substituições de ingredientes etc. Toque em "Salvar" para confirmar.',
  },
  {
    emoji: '✏️',
    pergunta: 'Como editar ou excluir uma receita?',
    resposta:
      'Abra os detalhes da receita e role até o final. Toque em "✎ Editar" para alterar qualquer campo, ou "🗑 Excluir" para remover definitivamente. A exclusão pede confirmação antes de apagar.',
  },
  {
    emoji: '🌐',
    pergunta: 'O que é a Busca Online?',
    resposta:
      'Toque no ícone 🌐 no topo da tela inicial para acessar a busca avançada online. Pesquise receitas por nome (em inglês) ou navegue por categorias. Toque em "↓ Importar" nos resultados para salvar no seu app.',
  },
  {
    emoji: '💾',
    pergunta: 'Os dados ficam salvos sem internet?',
    resposta:
      'Sim! Todas as receitas cadastradas ou importadas ficam salvas localmente no seu dispositivo usando SQLite. Você pode acessar suas receitas mesmo sem conexão com a internet. A busca online e o Explorar precisam de internet.',
  },
  {
    emoji: '🔒',
    pergunta: 'Minha conta é segura?',
    resposta:
      'Sua conta e todos os dados ficam armazenados somente no seu dispositivo — nada vai para um servidor externo. Para trocar de dispositivo, você precisará recadastrar suas receitas.',
  },
];

export function HelpScreen() {
  const [aberto, setAberto] = useState<number | null>(null);

  function toggleItem(index: number) {
    setAberto((prev) => (prev === index ? null : index));
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <Text style={styles.cabecalhoIcone}>❓</Text>
        <Text style={styles.cabecalhoTitulo}>Central de Ajuda</Text>
        <Text style={styles.cabecalhoSub}>
          Toque em uma pergunta para ver a resposta
        </Text>
      </View>

      {/* Lista de FAQs */}
      <View style={styles.lista}>
        {ITENS.map((item, index) => {
          const estaAberto = aberto === index;
          return (
            <View key={index} style={styles.itemContainer}>
              <TouchableOpacity
                style={[styles.itemHeader, estaAberto && styles.itemHeaderAtivo]}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemPergunta}>{item.pergunta}</Text>
                <Text style={[styles.itemSeta, estaAberto && styles.itemSetaAberta]}>
                  ›
                </Text>
              </TouchableOpacity>

              {estaAberto && (
                <View style={styles.itemResposta}>
                  <Text style={styles.itemRespostaTexto}>{item.resposta}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>SaborNote • Trabalho Acadêmico</Text>
        <Text style={styles.rodapeVersao}>React Native + Expo SDK 54</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cabecalho: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cabecalhoIcone: { fontSize: 40, marginBottom: 8 },
  cabecalhoTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 4,
  },
  cabecalhoSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  lista: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.white,
    gap: 10,
  },
  itemHeaderAtivo: {
    backgroundColor: Colors.black,
  },
  itemEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  itemPergunta: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemSeta: {
    fontSize: 22,
    color: Colors.gray500,
    fontWeight: '300',
    transform: [{ rotate: '0deg' }],
  },
  itemSetaAberta: {
    color: Colors.white,
    transform: [{ rotate: '90deg' }],
  },
  itemResposta: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemRespostaTexto: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  rodape: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  rodapeTexto: { fontSize: 12, color: Colors.gray500, fontWeight: '600' },
  rodapeVersao: { fontSize: 11, color: Colors.gray300 },
});
