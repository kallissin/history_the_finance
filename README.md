# Obra em Dia — Controle financeiro da reforma

Aplicação web para registrar despesas de uma reforma residencial, acompanhar parcelas e pagamentos e visualizar o fluxo de desembolso.

## Funcionalidades

- Cadastro e exclusão de despesas com categoria, fornecedor, valor, data, forma de pagamento e observações.
- Geração automática de parcelas mensais a partir do vencimento da primeira parcela.
- Baixa individual de parcelas, com recálculo de valores pagos e pendentes.
- Cadastro de cartões, contas e outras fontes usando somente apelidos.
- Dashboard com custo total, total pago, compromissos em aberto, desembolso mensal, categorias e fontes de pagamento.
- Filtros por mês e por cartão/conta.
- Login e cadastro por e-mail e senha.

## Stack

- Next.js 15 + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Tailwind CSS
- Recharts
- Vercel

## Configuração local

1. Instale as dependências com `npm install`.
2. Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

3. No Supabase, em **Authentication → URL Configuration**, configure a URL principal do app e inclua as URLs de callback usadas nos ambientes local e de produção, por exemplo:
   - `http://localhost:3000/auth/callback`
   - `https://history-the-finance.vercel.app/auth/callback`
   - `https://history-the-finance-kelvinalissoncantarinos-projects.vercel.app/auth/callback`

4. Execute `npm run dev` e abra `http://localhost:3000`.

## Banco de dados e segurança

As migrations estão em `supabase/migrations`. As tabelas `expenses`, `expense_installments` e `payment_sources` usam RLS para isolar os registros por usuário autenticado. O acesso anônimo às tabelas está revogado.

A criação de uma despesa e de suas parcelas é transacional por meio da função `create_expense_with_installments`. Valores de cartões e contas são apenas apelidos: nunca informe número do cartão, CVV, validade, senha ou credenciais bancárias.

## Deploy

O projeto está conectado ao Vercel e usa as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nos ambientes de produção, preview e desenvolvimento.
