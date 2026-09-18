-- seed: part 5 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Norges Bank Investment Management', 'LP', 'Sovereign wealth fund', 'Europe', 'Active Allocator', 'Norway', 'Oslo', 'Oslo, Norway', 'https://www.nbim.no', 'nbim.no', 1800000000000, 100, '$100M - $2B', 'Core, Index, Real Assets', 'Global', 'Manages Norway Government Pension Fund Global — a predominantly listed-equity portfolio with growing unlisted real estate and renewable infrastructure.', '[{"label":"Equities","value":71},{"label":"Fixed Income","value":26},{"label":"Real Assets","value":3}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Norges Bank Investment Management'));

-- ---- GPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Brookfield Asset Management', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.brookfield.com', 'brookfield.com', 1000000000000, '$100M - $5B', 'Buyout, Infrastructure, Real Assets', 'Global', 'Leading real-assets and alternatives manager across infrastructure, renewable power, real estate, private equity and credit.', '[{"label":"Infrastructure","value":32},{"label":"Real Estate","value":23},{"label":"Renewable Power & Transition","value":18},{"label":"Credit","value":14},{"label":"Private Equity","value":13}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Brookfield Asset Management'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'TPG', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Fort Worth', 'Fort Worth, TX', 'https://www.tpg.com', 'tpg.com', 250000000000, '$50M - $2B', 'Buyout, Growth, Impact', 'Global', 'Diversified alternatives platform spanning buyout (TPG Capital), growth, impact (Rise), real estate and market solutions / credit (Angelo Gordon).', '[{"label":"Capital (Buyout)","value":38},{"label":"Growth","value":22},{"label":"Market Solutions / Credit","value":18},{"label":"Impact","value":12},{"label":"Real Estate","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('TPG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Vista Equity Partners', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Austin', 'Austin, TX', 'https://www.vistaequitypartners.com', 'vistaequitypartners.com', 100000000000, '$50M - $1.5B', 'Buyout, Growth', 'North America, Europe', 'Enterprise-software specialist using operational value creation across flagship buyout, mid-market and credit strategies.', '[{"label":"Flagship Buyout","value":55},{"label":"Foundation (Mid)","value":25},{"label":"Endeavor (Growth)","value":12},{"label":"Credit","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Vista Equity Partners'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Thoma Bravo', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Chicago', 'Chicago, IL', 'https://www.thomabravo.com', 'thomabravo.com', 160000000000, '$50M - $2B', 'Buyout, Growth', 'North America, Europe', 'Software-focused buyout firm scaling flagship, mid-market (Discover) and lower-mid (Explore) funds plus a credit platform.', '[{"label":"Flagship Buyout","value":60},{"label":"Discover (Mid)","value":22},{"label":"Explore (Lower-Mid)","value":10},{"label":"Credit","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Thoma Bravo'));

-- ---- SPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'EY', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.ey.com', 'ey.com', '395,000+', 'Big Four assurance, tax, strategy and transactions firm serving asset managers, GPs and institutional investors.'
where not exists (select 1 from public.companies where lower(name)=lower('EY'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Goldman Sachs', 'SP', 'Bank', 'North America', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.goldmansachs.com', 'goldmansachs.com', '46,000+', 'Global investment bank providing financial sponsors coverage, financing, M&A advisory and prime services to private markets.'
where not exists (select 1 from public.companies where lower(name)=lower('Goldman Sachs'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'SS&C Technologies', 'SP', 'Fund administrator', 'North America', 'Vendor', 'United States', 'Windsor', 'Windsor, CT', 'https://www.ssctech.com', 'ssctech.com', '27,000+', 'Financial technology and fund administration provider for alternatives, delivering accounting, transfer agency and operations software.'
where not exists (select 1 from public.companies where lower(name)=lower('SS&C Technologies'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Latham & Watkins', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'Los Angeles', 'Los Angeles, CA', 'https://www.lw.com', 'lw.com', '7,000+', 'Global law firm with leading fund formation, private equity, finance and capital-markets practices.'
where not exists (select 1 from public.companies where lower(name)=lower('Latham & Watkins'));
-- ===========================================================================
-- LPGP Connect CRM -- company expansion wave 3 (12 more major firms)
-- Run AFTER schema.sql. Idempotent (de-dupes on name). Approximate public-domain
-- AUM / allocation figures (annual reports, regulatory disclosures).
-- ===========================================================================

-- ---- LPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Temasek', 'LP', 'Sovereign wealth fund', 'Asia Pacific', 'Active Allocator', 'Singapore', 'Singapore', 'Singapore', 'https://www.temasek.com.sg', 'temasek.com.sg', 285000000000, 180, '$50M - $1B', 'Growth, Buyout, Direct', 'Global', 'Singapore state investor running a concentrated, conviction-led direct portfolio across technology, financial services, consumer and sustainability.', '[{"label":"Singapore","value":27},{"label":"Asia (ex-SG/China)","value":23},{"label":"Americas","value":22},{"label":"China","value":19},{"label":"EMEA","value":9}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Temasek'));
