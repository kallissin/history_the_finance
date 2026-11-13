create or replace function public.create_expense_with_installments(
  p_description text,
  p_category text,
  p_supplier text,
  p_total_amount numeric,
  p_purchase_date date,
  p_payment_method text,
  p_payment_source_id uuid,
  p_installments_count integer,
  p_first_due_date date,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_expense_id uuid;
  v_installment_amount numeric(12,2);
  v_allocated numeric(12,2) := 0;
  v_i integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_total_amount is null or p_total_amount <= 0 then
    raise exception 'Total amount must be greater than zero';
  end if;
  if p_installments_count is null or p_installments_count < 1 or p_installments_count > 120 then
    raise exception 'Installment count must be between 1 and 120';
  end if;

  insert into public.expenses (
    user_id, description, category, supplier, total_amount, purchase_date,
    payment_method, payment_source_id, installments_count, first_due_date, notes
  ) values (
    v_user_id, trim(p_description), trim(p_category), nullif(trim(p_supplier), ''),
    p_total_amount, p_purchase_date, p_payment_method, p_payment_source_id,
    p_installments_count, p_first_due_date, nullif(trim(p_notes), '')
  ) returning id into v_expense_id;

  for v_i in 1..p_installments_count loop
    if v_i < p_installments_count then
      v_installment_amount := round(p_total_amount / p_installments_count, 2);
      v_allocated := v_allocated + v_installment_amount;
    else
      v_installment_amount := p_total_amount - v_allocated;
    end if;

    insert into public.expense_installments (
      expense_id, user_id, installment_number, amount, due_date
    ) values (
      v_expense_id, v_user_id, v_i, v_installment_amount,
      (p_first_due_date + ((v_i - 1) * interval '1 month'))::date
    );
  end loop;

  return v_expense_id;
end;
$$;

revoke all on function public.create_expense_with_installments(text,text,text,numeric,date,text,uuid,integer,date,text) from public, anon;
grant execute on function public.create_expense_with_installments(text,text,text,numeric,date,text,uuid,integer,date,text) to authenticated;
