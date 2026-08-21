# 📱 AdorehApp — Frontend PWA

Interface web moderna, segura e responsiva desenvolvida em **React 18+**, **Vite** e **TailwindCSS**, projetada para funcionar como Progressive Web App (PWA) em dispositivos móveis (Android, iOS) e desktops (Windows, macOS).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** React 18+ com TypeScript
- **Build Tool:** Vite 5/6
- **Roteamento:** React Router DOM (v6)
- **Estilização:** TailwindCSS (Tema escuro slate-950 / cyan / amber)
- **Ícones:** Lucide React & Material Symbols Sharp
- **Exportação de Relatórios:** `jspdf`, `jspdf-autotable`, `xlsx`
- **Gerenciamento de Estado:** Context API (`AuthContext`, `ToastContext`, `CongregationContext`)

---

## 🚀 Funcionalidades Principais

1. **Multi-Congregações (Sede e Filiais)**:
   - Seletor global no topo da aplicação para o Pastor Presidente (`SUPER_ADMIN`) alternar entre **Visão Global (Sede + Filiais)** ou uma filial específica.
   - Gestão institucional de filiais na rota `/congregacoes` com tabela utilitária de igrejas.
2. **Visão Pastoral & Dashboards Executivos**:
   - Métricas financeiras e de membresia atualizadas em tempo real.
   - Gráficos visuais de **Histórico Financeiro (6 meses)**, **Composição de Gastos (Fixos vs Variáveis)** e tabela comparativa entre filiais.
3. **Módulo Financeiro & Tesouraria**:
   - Lançamentos de Entradas e Saídas com Formas de Pagamento (**Pix, Dinheiro, Débito, Crédito, Transferência, Outro**).
   - Histórico transparente de edições com identificação do operador (`Edição #1 - Pr. Admin • Data/Hora`).
   - Gerador de Relatórios Customizados em **PDF** e **Excel** com agrupamento por tipo, período e totalizadores no cabeçalho/rodapé.
4. **Gestão de Visitantes e Acolhimento**:
   - Ficha de cadastro de visitantes, acompanhamento de status e **Conversão em Membro** com geração automática de credenciais criptografadas.
5. **Membros, GCs e Ministérios**:
   - Cadastro de Grupos de Conexão (Células), cargos e lançamento de frequência nos cultos da igreja.

---

## 💻 Como Rodar o Frontend Localmente

### Pré-requisitos
- Node.js (v20+) instalado
- API Backend (`AdoreApp-Api`) em execução na porta `3333`

### 1. Instalar Dependências
```bash
cd AdoreApp-frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `AdoreApp-frontend`:
```env
VITE_API_URL=http://localhost:3333/api
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no navegador.

---

## 📐 Estrutura de Pastas

```
AdoreApp-frontend/
├── src/
│   ├── components/         # Layout principal (AppLayout) e rotas protegidas (ProtectedRoute)
│   ├── context/            # AuthContext, ToastContext, CongregationContext
│   ├── pages/              # Telas (Dashboard, PastorDashboard, CongregationManagement, FinanceDashboard, etc.)
│   ├── services/           # Instância do Axios (api.ts)
│   ├── types/              # Definições TypeScript (User, Congregation, Transaction, etc.)
│   └── utils/              # Exportação de relatórios PDF/Excel (reportUtils.ts)
├── public/                 # Ícones estáticos e manifest PWA
└── index.html              # Template HTML principal
```

---

## 📦 Build de Produção

```bash
npm run build
```
Os arquivos estáticos otimizados serão gerados na pasta `dist/`.

---

## 📄 Licença
Este projeto é proprietário e de uso exclusivo da instituição. Todos os direitos reservados.