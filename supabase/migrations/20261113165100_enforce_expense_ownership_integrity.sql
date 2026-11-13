create index expenses_payment_source_id_idx on public.expenses(payment_source_id);
alter table public.payment_sources
  add constraint payment_sources_id_user_id_key unique (id, user_id);
alter table public.expenses
  add constraint expenses_id_user_id_key unique (id, user_id),
  add constraint expenses_payment_source_owner_fkey
    foreign key (payment_source_id, user_id)
    references public.payment_sources(id, user_id)
    on delete set null (payment_source_id);
alter table public.expense_installments
  add constraint installments_expense_owner_fkey
    foreign key (expense_id, user_id)
    references public.expenses(id, user_id)
    on delete cascade;
