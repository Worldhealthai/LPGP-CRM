-- seed: part 2 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, active_funds, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'GIC', 'LP', 'Sovereign wealth fund', 'Asia Pacific', 'Active Allocator', 'Singapore', 'Singapore', 'Singapore', 'https://www.gic.com.sg', 'gic.com.sg', 770000000000, 200, '$100M - $1B', 'Core, Growth, Buyout', 'Global', 'Manages Singapore foreign reserves with a long-term, all-weather portfolio across public and private asset classes.', '[{"label":"Developed Equities","value":30},{"label":"Nominal Bonds","value":30},{"label":"Emerging Equities","value":16},{"label":"Real Estate","value":13},{"label":"Inflation-linked Bonds","value":6},{"label":"Private Equity","value":5}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('GIC'));

-- ----------------------------------------------------------------------------
-- GPs -- fund managers & VCs
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'BlackRock', 'GP', 'Asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.blackrock.com', 'blackrock.com', '5743592', 11500000000000, '$50M - $5B', 'All stages', 'Global', 'World largest asset manager spanning index, active, multi-asset and alternatives via iShares and institutional mandates.', '[{"label":"Equities","value":52},{"label":"Fixed Income","value":27},{"label":"Multi-Asset","value":8},{"label":"Cash","value":10},{"label":"Alternatives","value":3}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('BlackRock'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Blackstone', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.blackstone.com', 'blackstone.com', '16189032', 1100000000000, '$100M - $5B', 'Buyout, Core+, Credit', 'Global', 'Largest alternatives manager with leading real estate, credit, private equity and hedge fund solutions franchises.', '[{"label":"Credit & Insurance","value":33},{"label":"Real Estate","value":30},{"label":"Private Equity","value":22},{"label":"Multi-Asset","value":15}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Blackstone'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'KKR', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.kkr.com', 'kkr.com', '40628456', 624000000000, '$100M - $3B', 'Buyout, Growth, Infrastructure', 'Global', 'Global investment firm across private equity, credit, infrastructure and real assets with a strong balance-sheet model.', '[{"label":"Credit","value":36},{"label":"Private Equity","value":30},{"label":"Real Assets","value":24},{"label":"Other","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('KKR'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Apollo Global Management', 'GP', 'Alternative asset manager', 'North America', 'Core GP', 'United States', 'New York', 'New York, NY', 'https://www.apollo.com', 'apollo.com', 751000000000, '$100M - $5B', 'Credit, Buyout, Hybrid', 'Global', 'Credit-led alternatives manager pairing investment-grade and opportunistic credit with private equity and real assets.', '[{"label":"Credit","value":76},{"label":"Private Equity","value":14},{"label":"Real Assets","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Apollo Global Management'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, lusha_company_id, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Ares Management', 'GP', 'Private credit', 'North America', 'Core GP', 'United States', 'Los Angeles', 'Los Angeles, CA', 'https://www.aresmgmt.com', 'aresmgmt.com', '53826888', 464000000000, '$50M - $2B', 'Credit, Buyout, Secondaries', 'Global', 'Leading private credit manager with adjacent private equity, real assets and secondaries platforms.', '[{"label":"Credit","value":70},{"label":"Real Assets","value":13},{"label":"Private Equity","value":9},{"label":"Secondaries","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Ares Management'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'The Carlyle Group', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Washington', 'Washington, DC', 'https://www.carlyle.com', 'carlyle.com', 447000000000, '$50M - $2B', 'Buyout, Growth, Credit', 'Global', 'Global private equity, credit and investment-solutions manager across corporate, real assets and fund-of-funds strategies.', '[{"label":"Global Credit","value":42},{"label":"Global Private Equity","value":36},{"label":"Investment Solutions","value":22}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('The Carlyle Group'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'EQT', 'GP', 'Private equity', 'Europe', 'Core GP', 'Sweden', 'Stockholm', 'Stockholm, Sweden', 'https://www.eqtgroup.com', 'eqtgroup.com', 140000000000, '€100M - €2B', 'Buyout, Infrastructure', 'Europe, North America, APAC', 'European-rooted global manager focused on private equity and infrastructure with a thematic, value-creation approach.', '[{"label":"Private Equity","value":60},{"label":"Infrastructure","value":30},{"label":"Real Estate","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('EQT'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Sequoia Capital', 'GP', 'Venture capital', 'North America', 'Core GP', 'United States', 'Menlo Park', 'Menlo Park, CA', 'https://www.sequoiacap.com', 'sequoiacap.com', 85000000000, '$1M - $250M', 'Seed, Venture, Growth', 'US, Europe, India', 'Storied venture firm backing founders from seed through growth across technology and healthcare.', '[{"label":"Venture","value":55},{"label":"Growth","value":30},{"label":"Public / Other","value":15}]'::jsonb
where not exists (select 1 from public.companies where lower(name) = lower('Sequoia Capital'));
