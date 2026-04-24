# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SaborNote** — academic React Native recipe app (Expo SDK 54, React 19, TypeScript).  
All git commits must use author `xPedroTrindade <pedrohtrindade2@gmail.com>` (already configured locally). Never add Co-Authored-By lines.

## Commands

```bash
npx expo start --clear   # start Metro with cache cleared (always use after code changes)
npm run android          # open on Android emulator
# In running Metro terminal: press r to force reload on connected device
```

## Architecture

### Auth & Session (`App.tsx`)
- `SESSION_KEY = 'usuarioLogado'` stored in AsyncStorage as `{ id, nome, email, loginTime }`.
- Session expires after 8 hours. `verificarSessao()` validates on cold start and clears stale sessions.
- `SESSION_KEY` is exported from `App.tsx` — import it from there in any screen that reads/clears the session.
- `SafeAreaProvider` from `react-native-safe-area-context` wraps the whole app here. Screens with `headerShown: false` must use `useSafeAreaInsets()` for manual top padding.

### Navigation (`src/navigation/AppNavigator.tsx`)
- Single `NativeStackNavigator` with conditional rendering: auth stack (Login, Register) vs. main stack (Home, RecipeForm, RecipeDetail, ApiSearch, Help).
- Auth state is lifted to `App.tsx` via `onLogin`/`onLogout` props.

### Database (`src/database/`)
- **expo-sqlite v16**, synchronous API: `openDatabaseSync`, `execSync`, `runSync`, `getAllSync`, `getFirstSync`. No async/await in DB calls.
- Singleton in `database.ts` — always use `getDatabase()`.
- `recipeRepository.ts` handles all `Receita` CRUD. SQLite stores `favorita` as INTEGER 0/1; `mapRow()` converts to boolean.
- Passwords stored as plain text in `usuarios` table (academic project).

### Main Entity: `Receita` (`src/types/index.ts`)
`id, nome, ingredientes, modoPreparo, categoria, tempoPreparo, favorita (boolean), anotacoes, imagemUri, origem, createdAt, updatedAt`

### External API (`src/services/mealApi.ts`)
- **TheMealDB** free API — no key needed. Base: `https://www.themealdb.com/api/json/v1/1`
- `buscarPreviewsPorCategoria` → `/filter.php?c=` returns `MealApiPreview[]` (id, name, thumb only).
- `buscarMealCompletoPorId` → `/lookup.php?i=` returns full `MealApiMeal`.
- `converterMealParaReceita` maps strIngredient1–20 / strMeasure1–20, skipping whitespace-only values.
- `CATEGORIAS_API` maps Portuguese labels to English API values.

### HomeScreen tabs
- **"Minhas Receitas"** — local SQLite list with search (name/ingredient) and favorites filter.
- **"Explorar"** — `ExploreTab` component, lazy-mounted on first access via `exploradorMontado` flag + `display: 'none'` style to prevent re-fetching on tab switch.
- `ExploreTab` opens `ApiRecipeModal` on card tap (full details + import); `+` button is quick import.

### Colors
`src/constants/colors.ts` — black and white palette only. Always use `Colors.*` constants, never raw hex strings.
