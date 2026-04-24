import axios from 'axios';
import { MealApiMeal, Receita } from '../types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export async function buscarReceitasNaApi(termo: string): Promise<MealApiMeal[]> {
  const response = await api.get('/search.php', { params: { s: termo } });
  return response.data.meals ?? [];
}

export async function buscarPorCategoria(categoria: string): Promise<MealApiMeal[]> {
  // filter.php retorna apenas idMeal, strMeal, strMealThumb
  const response = await api.get('/filter.php', { params: { c: categoria } });
  const resumos: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> =
    response.data.meals ?? [];

  // Busca detalhes completos dos primeiros 10 resultados para não sobrecarregar
  const detalhes = await Promise.all(
    resumos.slice(0, 10).map((m) =>
      api
        .get('/lookup.php', { params: { i: m.idMeal } })
        .then((r) => (r.data.meals?.[0] as MealApiMeal) ?? null)
        .catch(() => null),
    ),
  );

  return detalhes.filter((m): m is MealApiMeal => m !== null);
}

export function converterMealParaReceita(meal: MealApiMeal): Omit<Receita, 'id'> {
  const ingredientes: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingrediente = (meal[`strIngredient${i}` as keyof MealApiMeal] as string) ?? '';
    const medida = (meal[`strMeasure${i}` as keyof MealApiMeal] as string) ?? '';
    // a API retorna espaços em branco " " para campos vazios — ignorar
    if (ingrediente.trim()) {
      const linha = [medida.trim(), ingrediente.trim()].filter(Boolean).join(' ');
      ingredientes.push(linha);
    }
  }

  const agora = new Date().toISOString();
  return {
    nome: meal.strMeal,
    ingredientes: ingredientes.join('\n'),
    modoPreparo: (meal.strInstructions ?? '').replace(/\r\n/g, '\n').trim(),
    categoria: meal.strCategory ?? '',
    tempoPreparo: '',
    favorita: false,
    anotacoes: '',
    imagemUri: meal.strMealThumb ?? '',
    origem: `API - ${meal.strArea ?? 'Internacional'}`,
    createdAt: agora,
    updatedAt: agora,
  };
}

export const CATEGORIAS_API: Array<{ label: string; valor: string }> = [
  { label: 'Frango', valor: 'Chicken' },
  { label: 'Boi', valor: 'Beef' },
  { label: 'Massas', valor: 'Pasta' },
  { label: 'Sobremesa', valor: 'Dessert' },
  { label: 'Frutos do Mar', valor: 'Seafood' },
  { label: 'Vegetariano', valor: 'Vegetarian' },
  { label: 'Café da Manhã', valor: 'Breakfast' },
  { label: 'Porco', valor: 'Pork' },
  { label: 'Entrada', valor: 'Starter' },
  { label: 'Vegano', valor: 'Vegan' },
];
