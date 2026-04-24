# SaborNote 🍴

Aplicativo mobile de receitas desenvolvido em React Native com Expo para trabalho acadêmico.

## Funcionalidades

- **CRUD completo** de receitas (criar, listar, editar, excluir)
- **Pesquisa** por nome e por ingrediente
- **Favoritos** — marque e filtre receitas favoritas
- **Anotações** por receita
- **Busca online** via API TheMealDB com importação para o banco local
- **Persistência local** com SQLite
- **Autenticação** simples (login e cadastro local)

## Tecnologias

| Tecnologia | Versão |
|---|---|
| React Native | 0.81 |
| Expo SDK | 54 |
| TypeScript | 5.9 |
| expo-sqlite | SQLite local |
| React Navigation | v7 |
| Axios | HTTP / API |

## Entidade Principal: Receita

```
id           - identificador único
nome         - nome da receita
ingredientes - lista de ingredientes
modoPreparo  - passo a passo
categoria    - Almoço, Jantar, Sobremesa, etc.
tempoPreparo - duração estimada
favorita     - marcada como favorita
anotacoes    - notas pessoais
imagemUri    - URL da imagem
origem       - origem da receita
createdAt    - data de criação
updatedAt    - última atualização
```

## Telas

1. **Login** — acesso à conta local
2. **Cadastro** — criar nova conta
3. **Home** — listagem com busca e filtros
4. **Nova/Editar Receita** — formulário completo
5. **Detalhes** — visualização, favoritos e anotações
6. **Busca Online** — importar receitas da API

## Como Executar

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- App **Expo Go** no celular (Android ou iOS)

### Passos

```bash
# Clonar o repositório
git clone https://github.com/xPedroTrindade/SaborNote.git
cd SaborNote

# Instalar dependências
npm install

# Iniciar o projeto
npm start
```

Escaneie o QR Code com o app **Expo Go** no celular.

## Estrutura de Pastas

```
sabor_note/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── constants/        # Cores e constantes
│   ├── database/         # SQLite e repositórios
│   ├── navigation/       # Configuração de rotas
│   ├── screens/          # Telas do app
│   ├── services/         # Integração com API externa
│   └── types/            # Tipos TypeScript
├── App.tsx               # Ponto de entrada
└── app.json              # Configuração Expo
```

## API Externa

Utiliza a [TheMealDB](https://www.themealdb.com/) — gratuita, sem chave de API necessária.

---

Desenvolvido por **xPedroTrindade** — Trabalho Acadêmico React Native
