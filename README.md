# SaborNote 🍴

> Aplicativo mobile de receitas desenvolvido em **React Native + Expo** como projeto acadêmico.  
> Persistência local com **SQLite**, integração com **API externa** de receitas e interface totalmente em português.

---

## Funcionalidades

### CRUD Local (SQLite)
- Cadastrar receita manualmente com formulário completo
- Listar, visualizar detalhes, editar e excluir receitas
- Pesquisar receitas por **nome** ou por **ingrediente**
- Filtrar por **favoritas**
- Marcar/desmarcar receita como favorita
- Adicionar e editar **anotações** diretamente na tela de detalhes

### Foto da Receita
- Tirar foto na hora com a **câmera do celular**
- Escolher imagem da **galeria de fotos**
- Inserir via **URL** externa
- Solicita permissões de câmera e galeria em tempo de execução

### Explorar (API Online)
- Aba **Explorar** carrega automaticamente receitas do mundo todo ao fazer login
- Organizada por categorias: Frango, Massas, Sobremesas, Frutos do Mar, Vegetariano
- Toque no card para ver **detalhes completos** (ingredientes + modo de preparo) em modal
- Botão `+` para importação rápida sem abrir o modal
- Receitas importadas são salvas no SQLite local

### Busca Online Avançada
- Buscar receitas por nome na base global (TheMealDB)
- Filtrar por categoria com chips selecionáveis
- Importar qualquer resultado para as receitas locais

### Autenticação
- Tela de **login** e **cadastro** com persistência local (SQLite)
- Sessão com **expiração de 8 horas** — novo login é exigido após esse período
- Sessões inválidas ou corrompidas são limpas automaticamente

### Splash Screen
- Exibe a logo do app com animação de fade + scale a cada abertura

### Central de Ajuda
- 10 perguntas frequentes em acordeão
- Explica todas as funcionalidades do app ao usuário

---

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo SDK | 54 | Plataforma e ferramentas |
| TypeScript | 5.9 | Tipagem estática |
| expo-sqlite | 16 | Banco de dados local |
| React Navigation | v7 | Navegação entre telas |
| expo-image-picker | 17 | Câmera e galeria de fotos |
| AsyncStorage | 2.2 | Persistência de sessão |
| Axios | 1.15 | Requisições HTTP |
| react-native-safe-area-context | 5.6 | Insets de tela segura |

---

## Entidade Principal: Receita

O CRUD do projeto é centrado em **uma única entidade**: `Receita`.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK | Identificador único |
| `nome` | TEXT | Nome da receita |
| `ingredientes` | TEXT | Lista de ingredientes (um por linha) |
| `modoPreparo` | TEXT | Passo a passo do preparo |
| `categoria` | TEXT | Café da Manhã, Almoço, Jantar, etc. |
| `tempoPreparo` | TEXT | Duração estimada |
| `favorita` | INTEGER | 0 = não / 1 = sim |
| `anotacoes` | TEXT | Notas pessoais do usuário |
| `imagemUri` | TEXT | URI local (`file://`) ou URL remota |
| `origem` | TEXT | `manual`, `API - Italiana`, etc. |
| `createdAt` | TEXT | ISO 8601 |
| `updatedAt` | TEXT | ISO 8601 |

---

## Telas

| Tela | Descrição |
|---|---|
| **Login** | Autenticação com e-mail e senha, logo animada |
| **Cadastro** | Criação de conta local |
| **Home — Minhas Receitas** | Lista com busca, filtros e FAB para nova receita |
| **Home — Explorar** | Grid de receitas da API organizado por categoria |
| **Nova / Editar Receita** | Formulário completo com câmera, galeria ou URL para foto |
| **Detalhes da Receita** | Ingredientes, preparo, favorito, anotações editáveis |
| **Busca Online** | Pesquisa por nome ou categoria na TheMealDB |
| **Central de Ajuda** | FAQ em acordeão com todas as funcionalidades explicadas |

---

## Como Executar

### Pré-requisitos

- **Node.js** 18 ou superior
- App **Expo Go** instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/xPedroTrindade/SaborNote.git
cd SaborNote

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor Metro (limpa o cache)
npx expo start --clear
```

Escaneie o **QR Code** exibido no terminal com o app Expo Go.

> **Dica:** Se as atualizações não aparecerem no celular, pressione **`r`** no terminal do Metro para forçar o reload do bundle.

---

## Estrutura de Pastas

```
SaborNote/
├── App.tsx                        # Ponto de entrada, splash, sessão e SafeAreaProvider
├── app.json                       # Configuração Expo (permissões, ícone, plugins)
├── src/
│   ├── types/index.ts             # Interfaces: Receita, Usuario, MealApiMeal, rotas
│   ├── constants/colors.ts        # Paleta preto e branco — única fonte de cores
│   ├── database/
│   │   ├── database.ts            # Singleton SQLite, initDatabase()
│   │   ├── recipeRepository.ts    # CRUD completo de Receita
│   │   └── userRepository.ts      # Login e cadastro local
│   ├── services/
│   │   └── mealApi.ts             # TheMealDB: busca, categorias, conversão para Receita
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Stack navigator, fluxo auth vs. main
│   ├── components/
│   │   ├── RecipeCard.tsx         # Card de receita na listagem
│   │   ├── SearchBar.tsx          # Barra de busca reutilizável
│   │   ├── ExploreTab.tsx         # Aba Explorar com seções por categoria
│   │   └── ApiRecipeModal.tsx     # Modal de detalhes de receita da API
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       ├── HomeScreen.tsx         # Abas: Minhas Receitas + Explorar
│       ├── RecipeFormScreen.tsx   # Criar/editar com image picker
│       ├── RecipeDetailScreen.tsx
│       ├── ApiSearchScreen.tsx
│       └── HelpScreen.tsx
└── assets/
    └── Sabor_note.png             # Logo usada no ícone e splash
```

---

## API Externa

Utiliza a [**TheMealDB**](https://www.themealdb.com/) — gratuita, sem necessidade de chave de API.

| Endpoint | Uso |
|---|---|
| `/search.php?s={termo}` | Busca por nome (retorna dados completos) |
| `/filter.php?c={categoria}` | Lista prévia por categoria (id, nome, thumb) |
| `/lookup.php?i={id}` | Detalhes completos de uma receita |

> A API está em inglês. Use termos como `chicken`, `pasta`, `beef`, `cake` para melhores resultados.

---

## Permissões (Android e iOS)

| Permissão | Finalidade |
|---|---|
| `CAMERA` | Tirar foto da receita diretamente no app |
| `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` | Selecionar foto da galeria |

As permissões são solicitadas em tempo de execução, apenas no momento em que o usuário tenta usar câmera ou galeria.

---

## Decisões de Arquitetura

- **Sessão local:** AsyncStorage com expiração de 8h. Sem backend — tudo fica no dispositivo.
- **SQLite síncrono:** A API `openDatabaseSync` do expo-sqlite v16 evita callbacks aninhados e simplifica o código.
- **Lazy mount do ExploreTab:** O componente monta apenas na primeira visita à aba e usa `display: none` para esconder sem desmontar, evitando re-chamadas à API ao trocar de aba.
- **Uma entidade CRUD:** Toda a lógica de persistência gira em torno de `Receita`. Usuários e sessão são apenas suporte à autenticação.

---

Desenvolvido por **xPedroTrindade** · Trabalho Acadêmico — React Native com Expo
