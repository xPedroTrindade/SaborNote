import { getDatabase } from './database';
import { Receita } from '../types';

function mapRow(row: any): Receita {
  return { ...row, favorita: row.favorita === 1 };
}

export function inserirReceita(receita: Omit<Receita, 'id'>): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO receitas
      (nome, ingredientes, modoPreparo, categoria, tempoPreparo, favorita, anotacoes, imagemUri, origem, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      receita.nome,
      receita.ingredientes,
      receita.modoPreparo,
      receita.categoria,
      receita.tempoPreparo,
      receita.favorita ? 1 : 0,
      receita.anotacoes,
      receita.imagemUri,
      receita.origem,
      receita.createdAt,
      receita.updatedAt,
    ],
  );
  return result.lastInsertRowId;
}

export function listarReceitas(): Receita[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>('SELECT * FROM receitas ORDER BY nome ASC');
  return rows.map(mapRow);
}

export function buscarPorNome(nome: string): Receita[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    'SELECT * FROM receitas WHERE nome LIKE ? ORDER BY nome ASC',
    [`%${nome}%`],
  );
  return rows.map(mapRow);
}

export function buscarPorIngrediente(ingrediente: string): Receita[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    'SELECT * FROM receitas WHERE ingredientes LIKE ? ORDER BY nome ASC',
    [`%${ingrediente}%`],
  );
  return rows.map(mapRow);
}

export function listarFavoritas(): Receita[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    'SELECT * FROM receitas WHERE favorita = 1 ORDER BY nome ASC',
  );
  return rows.map(mapRow);
}

export function buscarPorId(id: number): Receita | null {
  const db = getDatabase();
  const row = db.getFirstSync<any>('SELECT * FROM receitas WHERE id = ?', [id]);
  if (!row) return null;
  return mapRow(row);
}

export function atualizarReceita(receita: Receita): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE receitas SET
      nome=?, ingredientes=?, modoPreparo=?, categoria=?, tempoPreparo=?,
      favorita=?, anotacoes=?, imagemUri=?, origem=?, updatedAt=?
     WHERE id=?`,
    [
      receita.nome,
      receita.ingredientes,
      receita.modoPreparo,
      receita.categoria,
      receita.tempoPreparo,
      receita.favorita ? 1 : 0,
      receita.anotacoes,
      receita.imagemUri,
      receita.origem,
      receita.updatedAt,
      receita.id!,
    ],
  );
}

export function excluirReceita(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM receitas WHERE id = ?', [id]);
}

export function toggleFavorita(id: number, favorita: boolean): void {
  const db = getDatabase();
  db.runSync('UPDATE receitas SET favorita=?, updatedAt=? WHERE id=?', [
    favorita ? 1 : 0,
    new Date().toISOString(),
    id,
  ]);
}
