-- seed: part 1 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

-- ===========================================================================
-- LPGP Connect CRM -- starter seed (real firms + Lusha-sourced contacts)
-- Run in Supabase -> SQL Editor AFTER schema.sql. Safe to re-run (idempotent:
-- companies de-dupe on name, contacts on Lusha id).
--
-- Notes:
--  * AUM / allocation figures are approximate, public-domain (annual reports,
--    Form ADV, public disclosures). Treat as starting points and refine.
--  * Contact work emails were sourced via the Lusha connector (emails only).
--  * Solution Providers (SPs) are service firms, so they carry no AUM/allocation.
-- ===========================================================================

-- ----------------------------------------------------------------------------
-- LPs -- institutional investors
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CalPERS', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'United States', 'Sacramento', 'Sacramento, CA', 'https://www.calpers.ca.gov', 'calpers.ca.gov', 502400000000, 300, '$50M - $500M', 'Buyout, Growth, Core', 'Global', 'Largest US public pension. Builds a diversified total-fund portfolio with a growing private markets program across private equity, private debt and real assets.', '[{"label":"Public Equity","value":42},{"label":"Fixed Income","value":28},{"label":"Private Equity","value":17},{"label":"Real Assets","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('CalPERS'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CPP Investments', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.cppinvestments.com', 'cppinvestments.com', 480000000000, 150, '$100M - $1B', 'Buyout, Growth, Core', 'Global', 'Manages the Canada Pension Plan fund with a global, active strategy spanning private equity, credit, real assets and external managers.', '[{"label":"Public Equities","value":24},{"label":"Private Equity","value":24},{"label":"Real Assets","value":21},{"label":"Government Bonds","value":18},{"label":"Credit","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('CPP Investments'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Harvard Management Company', 'LP', 'Endowment', 'North America', 'Active Allocator', 'United States', 'Boston', 'Boston, MA', 'https://www.hmc.harvard.edu', 'hmc.harvard.edu', 53200000000, 120, '$25M - $200M', 'Venture, Growth, Buyout', 'Global', 'Manages Harvard University endowment with a heavy alternatives tilt toward private equity and hedge funds.', '[{"label":"Private Equity","value":39},{"label":"Hedge Funds","value":31},{"label":"Public Equity","value":14},{"label":"Bonds / TIPS","value":11},{"label":"Real Estate","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Harvard Management Company'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Yale Investments Office', 'LP', 'Endowment', 'North America', 'Active Allocator', 'United States', 'New Haven', 'New Haven, CT', 'https://investments.yale.edu', 'investments.yale.edu', 40700000000, 100, '$20M - $150M', 'Venture, Buyout, Absolute Return', 'Global', 'Pioneer of the endowment model; allocates heavily to venture capital, leveraged buyouts and absolute return via long-term manager relationships.', '[{"label":"Venture Capital","value":25},{"label":"Absolute Return","value":20},{"label":"Leveraged Buyouts","value":17},{"label":"Foreign Equity","value":12},{"label":"Real Estate","value":9},{"label":"Bonds / Cash","value":8},{"label":"Other","value":9}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Yale Investments Office'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Wellcome Trust', 'LP', 'Foundation', 'Europe', 'Active Allocator', 'United Kingdom', 'London', 'London, UK', 'https://wellcome.org', 'wellcome.org', 47000000000, 90, '£25M - £200M', 'Growth, Buyout, Venture', 'Global', 'Charitable foundation funding health research; runs a long-horizon endowment with a strong public and private equity allocation.', '[{"label":"Public Equity","value":50},{"label":"Private Equity","value":30},{"label":"Property","value":8},{"label":"Cash / Other","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Wellcome Trust'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ford Foundation', 'LP', 'Foundation', 'North America', 'Active Allocator', 'United States', 'New York', 'New York, NY', 'https://www.fordfoundation.org', 'fordfoundation.org', 16000000000, 70, '$10M - $75M', 'Growth, Buyout', 'Global', 'Social-justice philanthropy investing its endowment across public and private markets with a mission-aligned lens.', '[{"label":"Public Equity","value":40},{"label":"Private Equity","value":25},{"label":"Hedge Funds","value":20},{"label":"Fixed Income","value":10},{"label":"Real Assets","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Ford Foundation'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'AustralianSuper', 'LP', 'Superannuation scheme', 'Asia Pacific', 'Active Allocator', 'Australia', 'Melbourne', 'Melbourne, Australia', 'https://www.australiansuper.com', 'australiansuper.com', 230000000000, 110, 'A$50M - A$1B', 'Core, Growth, Buyout', 'Global', 'Australia largest superannuation fund; scaling international private markets and infrastructure as assets grow.', '[{"label":"Equities","value":55},{"label":"Fixed Income","value":15},{"label":"Infrastructure","value":13},{"label":"Property","value":7},{"label":"Private Equity","value":6},{"label":"Cash","value":4}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('AustralianSuper'));
