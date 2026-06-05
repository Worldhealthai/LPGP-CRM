-- ===========================================================================
-- LPGP Connect CRM — SP contacts wave (work emails via Lusha; emails only)
-- Run AFTER schema.sql and seed.sql. Idempotent (de-dupes on Lusha contact id).
-- ===========================================================================

-- KPMG (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KPMG') limit 1), 'Vincent','Delmas','Head of Private Equity','Director','Finance','vdelmas@kpmg.fr','https://www.linkedin.com/in/vdelmas-kpmg','France',null,'214485094'
where not exists (select 1 from public.contacts where lusha_contact_id='214485094');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KPMG') limit 1), 'Nicolas','Cottis','Partner, ESG Private Equity Lead, Deal Advisory','Partner','Finance','ncottis@kpmg.fr','https://www.linkedin.com/in/nicolascottis','France','Paris','23292353'
where not exists (select 1 from public.contacts where lusha_contact_id='23292353');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('KPMG') limit 1), 'Benoit','Durand','Head of Risk and Compliance, Financial Services','Director','Finance','bdurand@kpmg.fr','https://www.linkedin.com/in/benoit-d-9250012','France','Paris','83141647'
where not exists (select 1 from public.contacts where lusha_contact_id='83141647');

-- PwC (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('PwC') limit 1), 'Ben','Cox','Partner, Finance','Partner','Finance','ben.cox@pwc.com','https://www.linkedin.com/in/ben-cox','United Kingdom','London','535310737'
where not exists (select 1 from public.contacts where lusha_contact_id='535310737');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('PwC') limit 1), 'Leonie','Schreve','Partner','Partner','General Management','leonie.schreve@pwc.com','https://www.linkedin.com/in/leonieschreve','Netherlands',null,'574612213'
where not exists (select 1 from public.contacts where lusha_contact_id='574612213');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('PwC') limit 1), 'Anand','Balasubramanian','Partner, Financial Services Consulting','Partner','Consulting','anand.x.balasubramanian@pwc.com','https://www.linkedin.com/in/anand-balasubramanian-5120028','United Arab Emirates','Dubai','206079539'
where not exists (select 1 from public.contacts where lusha_contact_id='206079539');

-- Deloitte (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Deloitte') limit 1), 'Marieke','''T Hart','Partner, Private Equity Leader','Partner','Finance','hartm@deloitte.com','https://www.linkedin.com/in/marieke-t-hart-impactinvesteerder','Netherlands','Amsterdam','9481520'
where not exists (select 1 from public.contacts where lusha_contact_id='9481520');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Deloitte') limit 1), 'Hans','Scholtes','Partner','Partner','Finance','hscholtes@deloitte.com','https://www.linkedin.com/in/hans-scholtes-96b9936','Netherlands',null,'163276109'
where not exists (select 1 from public.contacts where lusha_contact_id='163276109');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Deloitte') limit 1), 'Dominika','Tomek','Partner, Financial Services Digital Transformation','Partner','Finance','dtomek@deloitte.co.uk','https://www.linkedin.com/in/dominika-tomek-144b261','United Kingdom',null,'532324407'
where not exists (select 1 from public.contacts where lusha_contact_id='532324407');

-- MUFG (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('MUFG') limit 1), 'Guillaume','Rey','Managing Director, Corporate Solutions EMEA & Global Financial Solutions','Director','Finance','guillaume.rey@uk.mufg.jp','https://www.linkedin.com/in/guillaume-rey-481639','France',null,'327658022'
where not exists (select 1 from public.contacts where lusha_contact_id='327658022');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('MUFG') limit 1), 'Robert','Kilcullen','Managing Director, Head of Advisory','Director','Consulting','rkilcullen@us.mufg.jp','https://www.linkedin.com/in/robert-kilcullen-809b6830','United States','New York','550160035'
where not exists (select 1 from public.contacts where lusha_contact_id='550160035');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('MUFG') limit 1), 'Jayaram','Palli','Managing Director','Director','General Management','jayaram.palli@uk.mufg.jp','https://www.linkedin.com/in/jayaram-palli-8564584','United Kingdom','London','642810429'
where not exists (select 1 from public.contacts where lusha_contact_id='642810429');

-- Apex Group (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apex Group') limit 1), 'Yuko','Shimizu','Director of Business Development','Director','Business Development','yuko.shimizu@apexgroup.com','https://www.linkedin.com/in/yuko-shimizu','United Kingdom','London','36082160'
where not exists (select 1 from public.contacts where lusha_contact_id='36082160');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apex Group') limit 1), 'Bryan','Atkinson','Managing Director','Director','General Management','bryan.atkinson@apexgroup.com','https://www.linkedin.com/in/bryan-atkinson-64596097','Ireland',null,'11080732'
where not exists (select 1 from public.contacts where lusha_contact_id='11080732');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apex Group') limit 1), 'Alyson','Yule','Managing Director','Director','General Management','alyson.yule@apexgroup.com','https://www.linkedin.com/in/alyson-yule-15281332','United Kingdom',null,'50569466'
where not exists (select 1 from public.contacts where lusha_contact_id='50569466');

-- Citco (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Citco') limit 1), 'Bocar','Kante','Head of Business Development','Director','Business Development','bkante@citco.com','https://www.linkedin.com/in/bocar-kante-24215514','United Kingdom','London','450743225'
where not exists (select 1 from public.contacts where lusha_contact_id='450743225');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Citco') limit 1), 'William','Daunt','Managing Director','Director','General Management','wdaunt@citco.com','https://www.linkedin.com/in/william-daunt-a10b4437','Ireland','Dublin','517053446'
where not exists (select 1 from public.contacts where lusha_contact_id='517053446');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Citco') limit 1), 'Eef','Verachtert','Managing Director','Director','General Management','everachtert@citco.com','https://www.linkedin.com/in/eef-verachtert-46399b12','Luxembourg','Luxembourg','88672271'
where not exists (select 1 from public.contacts where lusha_contact_id='88672271');

-- Kirkland & Ellis (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Kirkland & Ellis') limit 1), 'Sandipan','De','Partner, Debt and Fund Finance','Partner','Finance','sandipan.de@kirkland.com','https://www.linkedin.com/in/sandikirklandfundfinance','United Kingdom','London','765319642'
where not exists (select 1 from public.contacts where lusha_contact_id='765319642');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Kirkland & Ellis') limit 1), 'Rebecca','Perlman','Partner','Partner','General Management','rebecca.perlman@kirkland.com','https://www.linkedin.com/in/rebecca-perlman-9b61304a','United Kingdom','London','372203794'
where not exists (select 1 from public.contacts where lusha_contact_id='372203794');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Kirkland & Ellis') limit 1), 'Suril','Patel','Partner','Partner','General Management','suril.patel@kirkland.com','https://www.linkedin.com/in/surilp','United Kingdom','London','83665288'
where not exists (select 1 from public.contacts where lusha_contact_id='83665288');

-- Simpson Thacher & Bartlett (SP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Simpson Thacher & Bartlett') limit 1), 'Alan','Klein','Partner','Partner','General Management','aklein@stblaw.com','https://www.linkedin.com/in/alan-m-klein-esq','United States','New York','157939310'
where not exists (select 1 from public.contacts where lusha_contact_id='157939310');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Simpson Thacher & Bartlett') limit 1), 'Adam','Furber','Partner','Partner','General Management','afurber@stblaw.com','https://www.linkedin.com/in/adam-c-furber-17786611','Hong Kong',null,'918780889'
where not exists (select 1 from public.contacts where lusha_contact_id='918780889');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Simpson Thacher & Bartlett') limit 1), 'Adam','Gallagher','Partner','Partner','General Management','adam.gallagher@stblaw.com','https://www.linkedin.com/in/adam-gallagher-745186','United Kingdom',null,'415333065'
where not exists (select 1 from public.contacts where lusha_contact_id='415333065');
