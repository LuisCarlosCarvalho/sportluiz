# SportLuiz // Performance Sports SaaS

Plataforma de alta performance para monitoramento analítico, rastreamento tático e gerenciamento esportivo em tempo real sob uma interface ultra-minimalista.

## 🛠️ Configuração do Ambiente Local

### 1. Requisitos Obrigatórios
* Node.js v20 ou superior
* Banco de dados PostgreSQL configurado

### 2. Variáveis de Ambiente (.env)
Crie um arquivo contendo as definições estruturais na raiz ou nas subpastas (`.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sportluiz?schema=public"
JWT_SECRET="SEU_TOKEN_JWT_ULTRA_SEGURO_2026"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLIENT_URL="http://localhost:5173"
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
```

### 3. Inicialização do Banco de Dados & Backend
```bash
# Executar na raiz do projeto
npm install
npm run install:all
npx prisma db push --schema=database/schema.prisma
npm run dev --prefix server
```

### 4. Inicialização do Client Frontend
```bash
npm run dev --prefix client
```

---

## 💻 Recursos e Fluxos Implementados

### 🎯 Garantia de Latência Zero (Optimistic UI)
No painel principal (`Dashboard.jsx`), a interface do usuário sofre mutação antes da conclusão da requisição HTTP ao banco de dados PostgreSQL. Caso ocorra alguma falha na requisição, o estado reativo reverte a alteração de forma transparente para evitar dessincronização.

### ⚽ Telemetria Tática Interativa (Field2D)
O componente `Field2D.jsx` renderiza a marcação tática oficial de um campo de futebol em uma visualização responsiva. Além de permitir a marcação das coordenadas `(X, Y)` exatas de passes, finalizações, faltas e gols, o componente plota os eventos anteriores em tempo real com marcadores coloridos e tooltips interativos.

### 🔒 Segurança de Acesso
O middleware corporativo `authHook.js` intercepta requisições protegidas verificando a validade de tokens JSON Web Tokens (JWT) com barreira CORS habilitada.

### 💳 Ciclo de Vida de Pagamentos (Stripe)
Suporte nativo para assinaturas SaaS orquestrado pelo Stripe Checkout e monitorado via Webhooks autenticados com verificação de assinaturas digitais. 

- **Plano FREE**: Permite um máximo de 15 eventos de telemetria por partida.
- **Plano PRO**: Permite telemetria ilimitada e relatórios adicionais.
- **Plano ENTERPRISE**: Permite suporte a múltiplos clubes (Multi-club tenant workspace).
