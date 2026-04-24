import { getDatabase } from './database';
import { Usuario } from '../types';

export function criarUsuario(usuario: Omit<Usuario, 'id'>): void {
  const db = getDatabase();
  db.runSync(
    'INSERT INTO usuarios (nome, email, senha, createdAt) VALUES (?, ?, ?, ?)',
    [usuario.nome, usuario.email, usuario.senha, usuario.createdAt],
  );
}

export function buscarUsuarioPorEmail(email: string): Usuario | null {
  const db = getDatabase();
  return db.getFirstSync<Usuario>(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
  );
}

export function emailJaExiste(email: string): boolean {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM usuarios WHERE email = ?',
    [email],
  );
  return (row?.count ?? 0) > 0;
}
