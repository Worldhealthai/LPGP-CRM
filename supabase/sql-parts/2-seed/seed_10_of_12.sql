-- seed: part 10 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

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
