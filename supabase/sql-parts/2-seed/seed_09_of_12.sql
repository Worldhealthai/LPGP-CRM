-- seed: part 9 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

-- ===========================================================================
-- LPGP Connect CRM -- SP contacts wave (work emails via Lusha; emails only)
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
