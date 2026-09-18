-- seed: part 4 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

-- KKR
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Tara','Davies','Partner, Head of European Infrastructure','Partner','General Management','tara.davies@kkr.com','https://www.linkedin.com/in/tara-courtney-davies','United Kingdom','London','665840378'
where not exists (select 1 from public.contacts where lusha_contact_id='665840378');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Vincent','Policard','Partner','Partner','General Management','vincent.policard@kkr.com','https://www.linkedin.com/in/vincent-policard-790b999b','United Kingdom','London','743914871'
where not exists (select 1 from public.contacts where lusha_contact_id='743914871');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KKR') limit 1), 'Shreya','Malik','Managing Director','Director','General Management','shreya.malik@kkr.com','https://www.linkedin.com/in/shreyamalik','United Kingdom',null,'19029368'
where not exists (select 1 from public.contacts where lusha_contact_id='19029368');

-- Ares Management
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Michael','Arougheti','Co-Founder & Chief Executive Officer','Founder','General Management','marougheti@aresmgmt.com','https://www.linkedin.com/in/michael-arougheti','United States','New York','465136760'
where not exists (select 1 from public.contacts where lusha_contact_id='465136760');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Daniel','Taylor','Partner, Co-Head of Global Product & Investor Relations','Partner','Investor Relations','dtaylor@aresmgmt.com','https://www.linkedin.com/in/daniel-j-taylor-4067382','United Kingdom','London','462129709'
where not exists (select 1 from public.contacts where lusha_contact_id='462129709');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ares Management') limit 1), 'Eli','Appelbaum','Partner, Co-Head of Europe, Alternative Credit','Partner','Finance','eappelbaum@aresmgmt.com','https://www.linkedin.com/in/eli-appelbaum','United Kingdom','London','75431114'
where not exists (select 1 from public.contacts where lusha_contact_id='75431114');

-- CPP Investments
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'John','Graham','President & Chief Executive Officer','C-Suite','General Management','jgraham@cppib.ca','https://www.linkedin.com/in/johngrahamcppib','Canada','Toronto','108838240'
where not exists (select 1 from public.contacts where lusha_contact_id='108838240');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'Amy','Flikerski','Managing Director, Head of External Portfolio Management','Director','Finance','amy.flikerski@cppinvestments.com','https://www.linkedin.com/in/amy-flikerski-1730b023','United Kingdom',null,'834110304'
where not exists (select 1 from public.contacts where lusha_contact_id='834110304');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CPP Investments') limit 1), 'Maximilian','Biagosch','Senior Managing Director','Director','General Management','maximilian.biagosch@cppinvestments.com','https://www.linkedin.com/in/maximilian-biagosch-79aa369','United Kingdom','London','711450727'
where not exists (select 1 from public.contacts where lusha_contact_id='711450727');
-- ===========================================================================
-- LPGP Connect CRM -- company expansion (12 more major firms)
-- Run AFTER schema.sql. Idempotent (de-dupes on name). Approximate public-domain
-- AUM / allocation figures (annual reports, Form ADV style) -- refine as needed.
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
