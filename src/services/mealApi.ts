import axios from 'axios';
import { MealApiMeal, Receita } from '../types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function buscarReceitasNaApi(termo: string): Promise<MealApiMeal[]> {
  const response = await axios.get(`${BASE_URL}/search.php`, {
    params: { s: termo },
  });
  return response.data.meals ?? [];
}

export async function buscarReceitaPorId(id: string): Promise<MealApiMeal | null> {
  const response = await axios.get(`${BASE_URL}/lookup.php`, {
    params: { i: id },
  });
  const meals: MealApiMeal[] = response.data.meals ?? [];
  return meals[0] ?? null;
}

export function converterMealParaReceita(meal: MealApiMeal): Omit<Receita, 'id'> {
  const ingredientes: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingrediente = meal[`strIngredient${i}` as keyof MealApiMeal] as string;
    const medida = meal[`strMeasure${i}` as keyof MealApiMeal] as string;
    if (ingrediente && ingrediente.trim()) {
      ingredientes.push(`${medida?.trim() ?? ''} ${ingrediente.trim()}`.trim());
    }
  }

  const agora = new Date().toISOString();
  return {
    nome: meal.strMeal,
    ingredientes: ingredientes.join('\n'),
    modoPreparo: meal.strInstructions ?? '',
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
