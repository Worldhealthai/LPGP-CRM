-- ===========================================================================
-- LPGP Connect CRM — sample LP commitments to funds (LP -> Fund -> GP)
-- Run AFTER 0005_commitments.sql, the company seeds and seed_funds.sql.
-- Idempotent (one row per LP+fund pair).
--
-- NOTE: amounts here are ILLUSTRATIVE / approximate. The relationships are
-- directionally real (these LPs are known investors in these managers), but
-- exact commitment sizes should be replaced with figures from each LP's public
-- private-markets disclosure (e.g. CalPERS/CalSTRS/TRS PE program reports).
-- ===========================================================================

insert into public.commitments (lp_company_id, fund_id, amount_usd, commitment_date)
select lp.id, fn.id, v.amount, v.cdate
from (values
  ('CalPERS', 'Blackstone Real Estate Partners X', 500000000::numeric, date '2023-06-01'),
  ('CalPERS', 'KKR North America Fund XIII', 400000000, date '2021-09-01'),
  ('CalSTRS', 'Blackstone Capital Partners VIII', 300000000, date '2020-03-01'),
  ('CalSTRS', 'Thoma Bravo Fund XV', 250000000, date '2022-10-01'),
  ('Teacher Retirement System of Texas', 'KKR Asian Fund IV', 200000000, date '2021-05-01'),
  ('Teacher Retirement System of Texas', 'EQT X', 300000000, date '2023-04-01'),
  ('CPP Investments', 'Carlyle Partners VIII', 350000000, date '2023-02-01'),
  ('Ontario Teachers'' Pension Plan', 'CVC Capital Partners Fund IX', 270000000, date '2023-07-01'),
  ('AustralianSuper', 'Brookfield Infrastructure Fund V', 250000000, date '2023-08-01'),
  ('GIC', 'Vista Equity Partners Fund VIII', 300000000, date '2022-06-01'),
  ('Future Fund', 'Apollo Investment Fund X', 200000000, date '2023-09-01'),
  ('OMERS', 'Ares Corporate Opportunities Fund VI', 150000000, date '2021-11-01')
) as v(lp_name, fund_name, amount, cdate)
join public.companies lp on lower(lp.name) = lower(v.lp_name)
join public.funds fn on fn.name = v.fund_name
where not exists (
  select 1 from public.commitments c where c.lp_company_id = lp.id and c.fund_id = fn.id
);
