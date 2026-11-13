create table public.payment_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  kind text not null check (kind in ('CREDIT_CARD','BANK_ACCOUNT','CASH','OTHER')),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (char_length(trim(description)) between 1 and 200),
  category text not null,
  supplier text,
  total_amount numeric(12,2) not null check (total_amount > 0),
  purchase_date date not null,
  payment_method text not null check (payment_method in ('PIX','DEBIT','CREDIT_ONE_TIME','CREDIT_INSTALLMENTS','CASH','FUTURE_DEPOSIT')),
  payment_source_id uuid references public.payment_sources(id) on delete set null,
  installments_count integer not null default 1 check (installments_count between 1 and 120),
  first_due_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_installment_method_check check (
    (payment_method = 'CREDIT_INSTALLMENTS' and installments_count >= 2)
    or (payment_method <> 'CREDIT_INSTALLMENTS' and installments_count = 1)
  )
);

create table public.expense_installments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  installment_number integer not null check (installment_number >= 1),
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  status text not null default 'PENDING' check (status in ('PENDING','PAID')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (expense_id, installment_number),
  constraint installment_paid_at_check check (
    (status = 'PAID' and paid_at is not null)
    or (status = 'PENDING' and paid_at is null)
  )
);

create index payment_sources_user_id_idx on public.payment_sources(user_id);
create index expenses_user_date_idx on public.expenses(user_id, purchase_date desc);
create index expenses_user_source_idx on public.expenses(user_id, payment_source_id);
create index expense_installments_user_due_idx on public.expense_installments(user_id, due_date);
create index expense_installments_expense_idx on public.expense_installments(expense_id);

alter table public.payment_sources enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_installments enable row level security;

create policy "Users manage their own payment sources"
on public.payment_sources for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own expenses"
on public.expenses for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage their own installments"
on public.expense_installments for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.payment_sources to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.expense_installments to authenticated;
