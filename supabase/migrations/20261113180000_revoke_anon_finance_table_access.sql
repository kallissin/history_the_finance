revoke all on table public.payment_sources from anon;
revoke all on table public.expenses from anon;
revoke all on table public.expense_installments from anon;

grant select, insert, update, delete on table public.payment_sources to authenticated;
grant select, insert, update, delete on table public.expenses to authenticated;
grant select, insert, update, delete on table public.expense_installments to authenticated;
