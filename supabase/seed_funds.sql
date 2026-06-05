-- ===========================================================================
-- LPGP Connect CRM — flagship funds (fund-level data per GP)
-- Run AFTER schema.sql (or 0004_funds.sql) and the company seeds.
-- Idempotent (de-dupes on fund name). Figures are approximate, public-domain
-- (press releases, manager disclosures) — NOT pulled from Form ADV Schedule D,
-- which is blocked from this environment. Refine with the live filing.
-- ===========================================================================

insert into public.funds (company_id, name, vintage_year, fund_size_usd, target_size_usd, strategy, geography, status)
select c.id, v.name, v.vintage, v.size, v.target, v.strategy, v.geography, v.status
from (values
  -- Blackstone
  ('Blackstone', 'Blackstone Real Estate Partners X', 2023, 30400000000::numeric, null::numeric, 'Real Estate', 'Global', 'Investing'),
  ('Blackstone', 'Blackstone Capital Partners VIII', 2019, 26000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Blackstone', 'BREP Europe VII', 2023, 11400000000, null, 'Real Estate', 'Europe', 'Investing'),
  -- KKR
  ('KKR', 'KKR North America Fund XIII', 2021, 19000000000, null, 'Private Equity', 'North America', 'Investing'),
  ('KKR', 'KKR Global Infrastructure Investors IV', 2021, 17000000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('KKR', 'KKR Asian Fund IV', 2021, 15000000000, null, 'Private Equity', 'Asia', 'Investing'),
  -- Apollo
  ('Apollo Global Management', 'Apollo Investment Fund X', 2023, 20000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Apollo Global Management', 'Apollo Hybrid Value Fund III', 2023, 5000000000, null, 'Hybrid Value', 'Global', 'Investing'),
  -- Ares
  ('Ares Management', 'Ares Corporate Opportunities Fund VI', 2021, 8000000000, null, 'Private Equity', 'Global', 'Investing'),
  ('Ares Management', 'Ares Capital Europe VI', 2023, 12000000000, null, 'Private Credit', 'Europe', 'Investing'),
  -- Carlyle
  ('The Carlyle Group', 'Carlyle Partners VIII', 2023, 14800000000, null, 'Private Equity', 'Global', 'Investing'),
  ('The Carlyle Group', 'Carlyle Realty Partners IX', 2021, 8000000000, null, 'Real Estate', 'North America', 'Investing'),
  -- EQT
  ('EQT', 'EQT X', 2023, 23800000000, null, 'Private Equity', 'Europe / North America', 'Investing'),
  ('EQT', 'EQT Infrastructure VI', 2023, 23500000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('EQT', 'EQT IX', 2021, 16900000000, null, 'Private Equity', 'Europe', 'Closed'),
  -- TPG
  ('TPG', 'TPG Partners VIII', 2022, 13400000000, null, 'Private Equity', 'Global', 'Investing'),
  ('TPG', 'TPG Rise Climate', 2021, 7300000000, null, 'Impact / Climate', 'Global', 'Investing'),
  -- Vista
  ('Vista Equity Partners', 'Vista Equity Partners Fund VIII', 2022, 20000000000, null, 'Software Buyout', 'North America', 'Investing'),
  ('Vista Equity Partners', 'Vista Foundation Fund IV', 2020, 4000000000, null, 'Software (Mid-Market)', 'North America', 'Closed'),
  -- Thoma Bravo
  ('Thoma Bravo', 'Thoma Bravo Fund XV', 2022, 24300000000, null, 'Software Buyout', 'North America', 'Investing'),
  ('Thoma Bravo', 'Thoma Bravo Fund XIV', 2020, 17800000000, null, 'Software Buyout', 'North America', 'Closed'),
  ('Thoma Bravo', 'Thoma Bravo Discover Fund IV', 2022, 6200000000, null, 'Software (Mid-Market)', 'North America', 'Investing'),
  -- CVC
  ('CVC Capital Partners', 'CVC Capital Partners Fund IX', 2023, 28100000000, null, 'Private Equity', 'Europe / Americas', 'Investing'),
  ('CVC Capital Partners', 'CVC Capital Partners Fund VIII', 2020, 23000000000, null, 'Private Equity', 'Europe / Americas', 'Closed'),
  -- Bain Capital
  ('Bain Capital', 'Bain Capital Fund XII', 2017, 9400000000, null, 'Private Equity', 'Global', 'Closed'),
  ('Bain Capital', 'Bain Capital Asia Fund V', 2022, 7100000000, null, 'Private Equity', 'Asia', 'Investing'),
  -- Warburg Pincus
  ('Warburg Pincus', 'Warburg Pincus Global Growth 14', 2021, 16000000000, null, 'Growth Equity', 'Global', 'Investing'),
  -- General Atlantic
  ('General Atlantic', 'General Atlantic Investment Partners 2021', 2021, 7800000000, null, 'Growth Equity', 'Global', 'Investing'),
  -- Brookfield
  ('Brookfield Asset Management', 'Brookfield Infrastructure Fund V', 2023, 30000000000, null, 'Infrastructure', 'Global', 'Investing'),
  ('Brookfield Asset Management', 'Brookfield Global Transition Fund II', 2024, 10000000000, null, 'Energy Transition', 'Global', 'Investing'),
  ('Brookfield Asset Management', 'Brookfield Capital Partners VI', 2024, null, 12000000000, 'Private Equity', 'Global', 'Fundraising')
) as v(company, name, vintage, size, target, strategy, geography, status)
join public.companies c on lower(c.name) = lower(v.company)
where not exists (select 1 from public.funds f where f.name = v.name);
