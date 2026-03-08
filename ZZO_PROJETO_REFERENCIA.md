# ZZO CREATIVE — Sistema de Gestão + Roadmap SaaS
> Documento de referência do projeto. Atualizado: 07/03/2026

---

## 1. ESTADO ATUAL DO SISTEMA

### Stack
- **Frontend:** React (CRA), Zustand, Axios, Tailwind CSS, Lucide React — porta `3000`
- **Backend:** Node.js, Express, MySQL2, bcryptjs, jsonwebtoken — porta `3001`
- **Banco:** MySQL via MAMP (porta `8889`), banco `ZZO`

### Como iniciar
```bash
# Backend (terminal 1)
kill -9 $(lsof -t -i :3001) 2>/dev/null
cd /Applications/MAMP/htdocs/agencia-web/backend && node server.js

# Frontend (terminal 2)
cd /Applications/MAMP/htdocs/agencia-web/frontend && npm start
```

### Credenciais
- Login: `admin@zzo.com` / Senha: `admin123`
- DB: root/root, porta 8889
- phpMyAdmin: `localhost:8888`

---

## 2. ESTRUTURA DE ARQUIVOS

```
/Applications/MAMP/htdocs/agencia-web/
├── backend/
│   ├── server.js          ← API principal
│   ├── .env               ← DB_PORT=8889
│   ├── database.js
│   ├── auth.js
│   ├── clientes.js
│   ├── campanhas.js (dentro do server)
│   ├── jobs.js
│   ├── pagamentos.js
│   └── tarefas.js
└── frontend/src/
    ├── theme.js            ← ESTILOS CENTRALIZADOS
    ├── App.jsx
    ├── store.js
    ├── api.js              ← baseURL: http://localhost:3001/api
    └── pages/
        ├── Dashboard.jsx
        ├── Login.jsx
        ├── Clientes.jsx / ClienteDetalhes.jsx
        ├── Campanhas.jsx / CampanhaDetalhes.jsx
        ├── Jobs.jsx / JobDetalhes.jsx
        ├── Pagamentos.jsx / PagamentoDetalhes.jsx
        └── Tarefas.jsx
```

---

## 3. BANCO DE DADOS — SCHEMA ATUAL

### Hierarquia dos dados
```
Administradores → Clientes → Campanhas → Jobs → Pagamentos
                                              ↘ Tarefas
```

### Tabelas e colunas relevantes
```sql
Administradores  (ID, Nome, Email, Senha)
Clientes         (ID, Empresa, Email, Telefone, Endereco, Status, FK_Admin)
Campanhas        (ID, Nome, Status, DataInicio, FK_Cliente)
Jobs             (ID, Descricao, Status, FK_Campanha, FK_Cliente)
Pagamentos       (ID, Descricao, Valor, Status, Data, FK_Job, FK_Cliente)
Tarefas          (ID, Tarefa, Prioridade, Status, FK_Admin, FK_Job, FK_Cliente)
```

### Migrações já executadas
```sql
ALTER TABLE Clientes ADD COLUMN FK_Admin INT;
ALTER TABLE Tarefas CHANGE FK_Usuario FK_Admin INT;
ALTER TABLE Tarefas ADD COLUMN FK_Job INT NULL;
ALTER TABLE Tarefas ADD COLUMN FK_Cliente INT NULL;
ALTER TABLE jobs CHANGE FK_Cliente FK_Campanha INT;
ALTER TABLE pagamentos CHANGE FK_Cliente FK_Job INT;
```

---

## 4. NAVEGAÇÃO IMPLEMENTADA

Clique em qualquer item navega para o detalhe:
```
Dashboard (cards clicáveis)
  ↓
Clientes → ClienteDetalhes → CampanhaDetalhes → JobDetalhes → PagamentoDetalhes
Campanhas → CampanhaDetalhes → JobDetalhes → PagamentoDetalhes
Jobs → JobDetalhes → PagamentoDetalhes
Pagamentos → PagamentoDetalhes
Tarefas
```

---

## 5. SISTEMA DE TEMA (theme.js)

Todos os componentes visuais usam `theme.*` centralizado em `src/theme.js`.
Mudar uma linha no theme reflete em todo o sistema.

```js
export const theme = {
  card, cardHover, cardInner,
  overlay, modal,
  input, select,
  btnCancel, btnCyan, btnIndigo, btnEmerald,
  headerBtnCyan, headerBtnIndigo, headerBtnEmerald,
  pageTitle, cardTitle, label, empty,
  badge: { ativo, inativo, pendente, andamento, concluido, pago },
  erro
}
```

---

## 6. ROADMAP — TRANSFORMAR EM SAAS

### Conceito central: Multitenancy
Cada agência cliente do SaaS é um "tenant". Os dados ficam no mesmo banco mas totalmente isolados.

**O que precisa mudar no banco:**
```sql
-- Adicionar em todas as tabelas principais:
ALTER TABLE Clientes   ADD COLUMN FK_Agencia INT NOT NULL;
ALTER TABLE Campanhas  ADD COLUMN FK_Agencia INT NOT NULL;
ALTER TABLE Jobs       ADD COLUMN FK_Agencia INT NOT NULL;
ALTER TABLE Pagamentos ADD COLUMN FK_Agencia INT NOT NULL;
ALTER TABLE Tarefas    ADD COLUMN FK_Agencia INT NOT NULL;

-- Nova tabela de agências:
CREATE TABLE Agencias (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Nome VARCHAR(100),
  Email VARCHAR(100),
  Plano ENUM('starter','pro','agency') DEFAULT 'starter',
  Status ENUM('ativo','suspenso','cancelado') DEFAULT 'ativo',
  DataExpiracao DATE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**No backend:** todo query passa a ter `WHERE FK_Agencia = req.user.agencia_id`

---

### Planos previstos
| Plano | Clientes | Usuários | Financeiro | Suporte |
|-------|----------|----------|------------|---------|
| Starter | Até 50 | 2 | Básico | Email |
| Pro | Ilimitado | 5 | Completo + relatórios | Prioritário |
| Agency | Ilimitado | Ilimitado | Tudo | VIP |

---

### Integração de Pagamentos (para cobrar as agências)
Opções no Brasil:
- **Stripe** — melhor para cartão internacional
- **Asaas** — melhor para boleto/PIX brasileiro
- **Pagar.me** — intermediário

Fluxo:
```
Agência escolhe plano → Gateway processa → Webhook avisa o sistema → Acesso liberado
```

---

### Os 3 Pilares do lançamento

| Pilar | O que fazer |
|-------|-------------|
| **Técnico** | Implementar multitenancy no backend (FK_Agencia em tudo) |
| **Landing Page** | Site vendendo: "Controle sua agência em um só lugar" |
| **Segurança** | Garantir isolamento total de dados entre agências |

---

### Diferenciais competitivos já prontos
- ✅ Visual moderno, escuro e elegante — parece caro
- ✅ Foco exclusivo em agências criativas
- ✅ Fluxo completo: Cliente → Campanha → Job → Pagamento → Tarefa
- ✅ Sistema de tema centralizado (fácil de customizar por tenant no futuro)

---

## 7. PRÓXIMOS PASSOS TÉCNICOS (ordenados)

1. **Criar tabela `Agencias`** no banco
2. **Adicionar `FK_Agencia`** em todas as tabelas
3. **Atualizar o JWT** para incluir `agencia_id` no token
4. **Filtrar todos os queries** do backend por `FK_Agencia`
5. **Tela de cadastro de agência** (onboarding)
6. **Tela de planos** dentro do sistema
7. **Integrar Asaas ou Stripe**
8. **Landing page** de venda

---

## 8. OBSERVAÇÕES GERAIS

- Usuário prefere não tomar decisões técnicas — delegar ao assistente
- Fazer backup deste documento ao final de cada sessão de trabalho
- MySQL acessível via phpMyAdmin em `localhost:8888`
- Frontend compila automaticamente com `npm start` (hot reload)
- Backend precisa reiniciar manualmente ao alterar server.js
