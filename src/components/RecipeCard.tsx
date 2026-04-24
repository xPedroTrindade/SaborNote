import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Receita } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  receita: Receita;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export function RecipeCard({ receita, onPress, onFavoritePress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {receita.imagemUri ? (
        <Image source={{ uri: receita.imagemUri }} style={styles.imagem} />
      ) : (
        <View style={styles.imagemPlaceholder}>
          <Text style={styles.imagemPlaceholderText}>🍽</Text>
        </View>
      )}

      <View style={styles.conteudo}>
        <Text style={styles.nome} numberOfLines={1}>
          {receita.nome}
        </Text>

        <View style={styles.metaRow}>
          {receita.categoria ? (
            <View style={styles.tag}>
              <Text style={styles.tagTexto}>{receita.categoria}</Text>
            </View>
          ) : null}
          {receita.tempoPreparo ? (
            <Text style={styles.tempo}>⏱ {receita.tempoPreparo}</Text>
          ) : null}
        </View>

        {receita.origem !== 'manual' ? (
          <Text style={styles.origem} numberOfLines={1}>
            {receita.origem}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.favBtn}
        onPress={onFavoritePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.favIcon}>{receita.favorita ? '★' : '☆'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imagem: {
    width: 80,
    height: 80,
  },
  imagemPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemPlaceholderText: {
    fontSize: 28,
  },
  conteudo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nome: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.black,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagTexto: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  tempo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  origem: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 3,
  },
  favBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  favIcon: {
    fontSize: 22,
    color: Colors.star,
  },
});
