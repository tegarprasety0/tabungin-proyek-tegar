-- Jalankan di Supabase SQL Editor setelah menetapkan app_metadata.role = 'admin'.
-- Kebijakan admin ditambahkan tanpa menghapus kebijakan RLS yang sudah ada.

drop policy if exists "Admins can manage categories" on public.categories;
drop policy if exists "Admins can view all savings goals" on public.savings_goals;
drop policy if exists "Admins can view all transactions" on public.transactions;

create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all savings goals"
on public.savings_goals
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all transactions"
on public.transactions
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
