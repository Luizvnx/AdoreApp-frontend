### Arquivo: `front-adorehApp/README.md` (Frontend)

```markdown
# 📱 AdorehApp — Frontend PWA

Interface moderna e responsiva desenvolvida em **React**, **Vite** e **TailwindCSS**, projetada para funcionar como Progressive Web App (PWA) em dispositivos móveis (Android, iOS) e desktops (Windows, macOS).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** React 18+ com TypeScript
- **Build Tool:** Vite
- **Roteamento:** React Router DOM (v6+)
- **Estilização:** TailwindCSS (Tema escuro / Paleta de identidade visual)
- **Ícones:** Lucide React

---

## 🚀 Como Rodar o Frontend Localmente

### Pré-requisitos
- Node.js (v20+) instalado
- Backend (`api-adorehApp`) em execução na porta `3333`

### 1. Clonar e Instalar Dependências
```bash
cd front-adorehApp
npm install

### 2. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz da pasta front-adorehApp e configure:

Copiar código
VITE_API_URL=http://localhost:3333/api
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no navegador. O Vite cuidará do hot-reload automático.

---

## 📐 Estrutura do Projeto
```
front-adorehApp/
├── src/
│   ├── pages/              # Telas da aplicação (Login, Dashboard, VisitorRegistration, etc.)
│   ├── components/         # Componentes reutilizáveis (modais, cards, formulários)
│   ├── config/             # Configurações globais (axios, JWT, variáveis)
│   ├── shared/             # Funções utilitárias (formatters, validators)
│   └── modules/            # Lógica organizada por módulos (auth, visitors, members)
│       ├── visitors/       # CRUD de visitantes
│       ├── members/        # CRUD de membros
│       └── auth/           # Login e gerenciamento de sessão
├── public/                 # Arquivos estáticos
├── index.html              # Template da aplicação PWA
└── vite.config.ts          # Configuração do Vite
```

---

## 🎨 Paleta de Cores e Identidade Visual
O projeto utiliza as seguintes cores principais:
- **Primária (Azul):** `#0f172a` (slate-950) - Background principal
- **Secundária (Turquesa):** `#06b6d4` (cyan-400/500) - Destaques, botões de ação, links
- **Textos:**
  - `slate-100` / `slate-200` - Textos principais
  - `slate-400` / `slate-500` - Textos secundários e labels

**Tema:** Dark mode nativo, otimizado para telas de celular e tablets.

---

## 🔄 PWA (Progressive Web App)
O frontend foi configurado como PWA para proporcionar experiência nativa:
- **Manifest:** `manifest.webmanifest` define nome, ícones e cores de tema
- **Offline Support:** O Service Worker (configurado via Vite) permite uso offline (em cache)
- **Installable:** Usuários podem instalar o app na tela inicial (Android/iOS/Desktop)

---

## 📡 Comunicação com o Backend
Toda comunicação com a API é feita via `VITE_API_URL`. Endpoints comuns incluem:

### Login
- **POST** `/api/users/login`

### Visitantes
- **GET** `/api/visitors` — Listar
- **POST** `/api/visitors` — Criar
- **GET** `/api/visitors/:id` — Buscar
- **PATCH** `/api/visitors/:id` — Atualizar
- **DELETE** `/api/visitors/:id` — Remover

### Membros
- **GET** `/api/members`
- **POST** `/api/members`
- **GET** `/api/members/:id`
- **PATCH** `/api/members/:id`
- **DELETE** `/api/members/:id`

---

## 🧪 Testes
Para garantir que o frontend está funcionando:
1. Verifique se o backend está rodando (`npm run dev` em `api-adorehApp`).
2. Inicie o frontend: `npm run dev`.
3. Acesse `http://localhost:5173`.
4. Tente fazer login com uma conta válida (se já existir) ou teste a tela de visitantes.

---

## 📦 Deploy

### Build de Produção
```bash
npm run build
```
Isso gerará os arquivos otimizados na pasta `dist/`.

### Netlify / Vercel / Firebase Hosting
1. Configure o build com:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `20.x` ou superior

### Docker
Para containerizar o frontend:
1. Crie um `Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```
2. Construa: `docker build . -t front-adorehapp`
3. Rode: `docker run -p 5173:5173 -e VITE_API_URL="http://localhost:3333/api" front-adorehapp`

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados. Consulte o arquivo `LICENSE` para mais informações.

---

## 🤝 Contribuindo

Este projeto é de uso exclusivo para a igreja. O acesso, cópia ou distribuição não autorizados são estritamente proibidos.

---

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato com a equipe de desenvolvimento.