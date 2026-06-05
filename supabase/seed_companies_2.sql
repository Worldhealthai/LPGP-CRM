-- ===========================================================================
-- LPGP Connect CRM — company expansion (12 more major firms)
-- Run AFTER schema.sql. Idempotent (de-dupes on name). Approximate public-domain
-- AUM / allocation figures (annual reports, Form ADV style) — refine as needed.
-- ===========================================================================

-- ---- LPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CalSTRS', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'United States', 'West Sacramento', 'West Sacramento, CA', 'https://www.calstrs.com', 'calstrs.com', 350000000000, 200, '$50M - $400M', 'Buyout, Growth, Core', 'Global', 'Second-largest US public pension; diversified total fund with a sizeable private equity and real estate program and a collaborative co-investment model.', '[{"label":"Public Equity","value":42},{"label":"Private Equity","value":17},{"label":"Real Estate","value":15},{"label":"Risk Mitigating","value":14},{"label":"Fixed Income","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('CalSTRS'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ontario Teachers'' Pension Plan', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.otpp.com', 'otpp.com', 190000000000, 150, '$100M - $1B', 'Buyout, Growth, Infrastructure', 'Global', 'Direct-investing Canadian pension plan with strong infrastructure, private equity and natural-resources teams alongside external managers.', '[{"label":"Equities","value":33},{"label":"Fixed Income","value":27},{"label":"Real Assets","value":22},{"label":"Credit","value":12},{"label":"Inflation Hedge","value":6}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Ontario Teachers'' Pension Plan'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Abu Dhabi Investment Authority', 'LP', 'Sovereign wealth fund', 'Middle East & Africa', 'Active Allocator', 'United Arab Emirates', 'Abu Dhabi', 'Abu Dhabi, UAE', 'https://www.adia.ae', 'adia.ae', 1000000000000, 250, '$100M - $2B', 'Core, Buyout, Growth', 'Global', 'One of the world largest sovereign investors, deploying across a broad reference portfolio with deep external manager and direct programs.', '[{"label":"Developed Equities","value":42},{"label":"Alternatives","value":31},{"label":"Government Bonds","value":15},{"label":"Emerging Equities","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Abu Dhabi Investment Authority'));

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
