-- ===========================================================================
-- LPGP Connect CRM — company expansion wave 3 (12 more major firms)
-- Run AFTER schema.sql. Idempotent (de-dupes on name). Approximate public-domain
-- AUM / allocation figures (annual reports, regulatory disclosures).
-- ===========================================================================

-- ---- LPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Temasek', 'LP', 'Sovereign wealth fund', 'Asia Pacific', 'Active Allocator', 'Singapore', 'Singapore', 'Singapore', 'https://www.temasek.com.sg', 'temasek.com.sg', 285000000000, 180, '$50M - $1B', 'Growth, Buyout, Direct', 'Global', 'Singapore state investor running a concentrated, conviction-led direct portfolio across technology, financial services, consumer and sustainability.', '[{"label":"Singapore","value":27},{"label":"Asia (ex-SG/China)","value":23},{"label":"Americas","value":22},{"label":"China","value":19},{"label":"EMEA","value":9}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Temasek'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Teacher Retirement System of Texas', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'United States', 'Austin', 'Austin, TX', 'https://www.trs.texas.gov', 'trs.texas.gov', 210000000000, 220, '$50M - $500M', 'Buyout, Growth, Core', 'Global', 'One of the largest US public pensions; sophisticated private markets and principal-investment programs with extensive co-investment.', '[{"label":"Global Equity","value":54},{"label":"Real Return","value":21},{"label":"Stable Value","value":16},{"label":"Risk Parity","value":8},{"label":"Cash","value":1}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Teacher Retirement System of Texas'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Future Fund', 'LP', 'Sovereign wealth fund', 'Asia Pacific', 'Active Allocator', 'Australia', 'Melbourne', 'Melbourne, Australia', 'https://www.futurefund.gov.au', 'futurefund.gov.au', 160000000000, 120, 'A$50M - A$1B', 'Core, Growth, Buyout', 'Global', 'Australia sovereign wealth fund with a flexible, whole-of-portfolio approach and significant alternatives and private equity exposure.', '[{"label":"Global Equities","value":36},{"label":"Private Equity","value":17},{"label":"Alternatives","value":15},{"label":"Infrastructure & Property","value":14},{"label":"Cash","value":10},{"label":"Debt","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Future Fund'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'OMERS', 'LP', 'Pension fund', 'North America', 'Active Allocator', 'Canada', 'Toronto', 'Toronto, Canada', 'https://www.omers.com', 'omers.com', 95000000000, 130, '$50M - $750M', 'Buyout, Infrastructure, Direct', 'Global', 'Ontario municipal pension with a direct-drive model across private equity, infrastructure (OMERS Infrastructure) and real estate (Oxford).', '[{"label":"Infrastructure","value":23},{"label":"Public Equity","value":22},{"label":"Credit / Bonds","value":20},{"label":"Private Equity","value":18},{"label":"Real Estate","value":17}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('OMERS'));

-- ---- GPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'CVC Capital Partners', 'GP', 'Private equity', 'Europe', 'Core GP', 'Luxembourg', 'Luxembourg', 'Luxembourg', 'https://www.cvc.com', 'cvc.com', 200000000000, '€100M - €2B', 'Buyout, Growth, Credit', 'Europe, Americas, Asia', 'Global private markets manager across European/American buyout, Asia, strategic opportunities, secondaries and credit.', '[{"label":"Private Equity (Europe/Americas)","value":55},{"label":"Credit","value":20},{"label":"Strategic Opportunities","value":13},{"label":"Asia","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('CVC Capital Partners'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Bain Capital', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Boston', 'Boston, MA', 'https://www.baincapital.com', 'baincapital.com', 185000000000, '$50M - $2B', 'Buyout, Credit, Venture', 'Global', 'Multi-asset alternatives firm spanning private equity, credit, special situations, ventures, real estate and public equity.', '[{"label":"Private Equity","value":40},{"label":"Credit","value":30},{"label":"Special Situations","value":12},{"label":"Ventures","value":8},{"label":"Real Estate","value":6},{"label":"Public Equity","value":4}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Bain Capital'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Warburg Pincus', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.warburgpincus.com', 'warburgpincus.com', 86000000000, '$50M - $1B', 'Growth, Buyout', 'Global', 'Growth-oriented private equity investor across technology, financial services, healthcare and industrials with a global footprint.', '[{"label":"Technology","value":35},{"label":"Financial Services","value":20},{"label":"Healthcare","value":18},{"label":"Industrial & Business Services","value":15},{"label":"Real Estate","value":12}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Warburg Pincus'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'General Atlantic', 'GP', 'Growth equity', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.generalatlantic.com', 'generalatlantic.com', 100000000000, '$25M - $1B', 'Growth, Late Venture', 'Global', 'Global growth equity firm partnering with category-leading companies across technology, financial services, healthcare, consumer and climate.', '[{"label":"Technology","value":40},{"label":"Financial Services","value":18},{"label":"Healthcare","value":17},{"label":"Consumer","value":15},{"label":"Climate","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('General Atlantic'));

-- ---- SPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'State Street', 'SP', 'Fund administrator', 'North America', 'Vendor', 'United States', 'Boston', 'Boston, MA', 'https://www.statestreet.com', 'statestreet.com', '46,000+', 'Global custodian and asset servicer providing fund administration, custody and middle-office services to institutional investors and managers.'
where not exists (select 1 from public.companies where lower(name)=lower('State Street'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Morgan Stanley', 'SP', 'Bank', 'North America', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.morganstanley.com', 'morganstanley.com', '80,000+', 'Global investment bank offering financial sponsors coverage, capital raising, M&A advisory and prime brokerage to private markets.'
where not exists (select 1 from public.companies where lower(name)=lower('Morgan Stanley'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Clifford Chance', 'SP', 'Law firm', 'Europe', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.cliffordchance.com', 'cliffordchance.com', '7,000+', 'Global law firm with leading funds, private equity, finance and regulatory practices across Europe, US, Middle East and Asia.'
where not exists (select 1 from public.companies where lower(name)=lower('Clifford Chance'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Aztec Group', 'SP', 'Fund administrator', 'Europe', 'Vendor', 'Jersey', 'St Helier', 'St Helier, Jersey', 'https://www.aztecgroup.co.uk', 'aztecgroup.co.uk', '2,000+', 'Independent European fund and corporate services administrator specialising in private equity, real assets, debt and venture funds.'
where not exists (select 1 from public.companies where lower(name)=lower('Aztec Group'));
