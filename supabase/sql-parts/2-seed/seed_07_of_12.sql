-- seed: part 7 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Aztec Group', 'SP', 'Fund administrator', 'Europe', 'Vendor', 'Jersey', 'St Helier', 'St Helier, Jersey', 'https://www.aztecgroup.co.uk', 'aztecgroup.co.uk', '2,000+', 'Independent European fund and corporate services administrator specialising in private equity, real assets, debt and venture funds.'
where not exists (select 1 from public.companies where lower(name)=lower('Aztec Group'));
-- ===========================================================================
-- LPGP Connect CRM -- contacts wave 2 (work emails via Lusha; emails only)
-- Run AFTER schema.sql and seed.sql. Idempotent (de-dupes on Lusha contact id).
-- Covers the remaining seeded LPs/GPs. (Harvard returned only university admin
-- staff via Lusha, so it is left without contacts for now.)
-- ===========================================================================

-- CalPERS (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CalPERS') limit 1), 'Stephen','Gilmore','Chief Investment Officer','C-Suite','Finance','stephen.gilmore@calpers.ca.gov','https://www.linkedin.com/in/stephen-gilmore-a68015169','United States','Sacramento','324549214'
where not exists (select 1 from public.contacts where lusha_contact_id='324549214');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CalPERS') limit 1), 'Dan','Bienvenue','Managing Director of Global Equity','Director','Finance','dan_bienvenue@calpers.ca.gov','https://www.linkedin.com/in/dan-bienvenue-cfa-caia-7031a15','United States','Folsom','233522483'
where not exists (select 1 from public.contacts where lusha_contact_id='233522483');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('CalPERS') limit 1), 'Mascha','Canio','Managing Director of Private Debt','Director','Finance','mascha.canio@calpers.ca.gov','https://www.linkedin.com/in/mascha-canio-095a39a','United States','Sacramento','201487979'
where not exists (select 1 from public.contacts where lusha_contact_id='201487979');

-- Yale Investments Office (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Yale Investments Office') limit 1), 'Vincent','Clarke','Director of Capital Markets','Director','Finance','vincent.clarke@yale.edu','https://www.linkedin.com/in/vincent-clarke-cfa-4823365','United States','New York','30428658'
where not exists (select 1 from public.contacts where lusha_contact_id='30428658');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Yale Investments Office') limit 1), 'Amy','Chivetta','Managing Director','Director','General Management','amy.chivetta@yale.edu','https://www.linkedin.com/in/amy-chivetta-70895475','United States','New Haven','584300200'
where not exists (select 1 from public.contacts where lusha_contact_id='584300200');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Yale Investments Office') limit 1), 'Cole','Weston','Director','Director','Investments','cole.weston@yale.edu','https://www.linkedin.com/in/cole-weston-ab7888a6','United States','New York','517916808'
where not exists (select 1 from public.contacts where lusha_contact_id='517916808');

-- Wellcome Trust (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Wellcome Trust') limit 1), 'Audrey','Duncanson','Senior Portfolio Manager','Manager','Finance','a.duncanson@wellcome.org','https://www.linkedin.com/in/audrey-duncanson-4404a249','United Kingdom','London','496452213'
where not exists (select 1 from public.contacts where lusha_contact_id='496452213');

-- Ford Foundation (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ford Foundation') limit 1), 'Emily','O''Leary','Associate Director of Investments','Director','Finance','e.oleary@fordfoundation.org','https://www.linkedin.com/in/emily-o-leary-95932a5','United States',null,'319726128'
where not exists (select 1 from public.contacts where lusha_contact_id='319726128');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ford Foundation') limit 1), 'Pat','Uttamobol','Investment Director','Director','Finance','p.uttamobol@fordfoundation.org','https://www.linkedin.com/in/patuttamobol','United States','New York','19143054'
where not exists (select 1 from public.contacts where lusha_contact_id='19143054');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Ford Foundation') limit 1), 'Michael','Walden','Director of Public Investments','Director','Finance','m.walden@fordfoundation.org','https://www.linkedin.com/in/michael-walden-cfa-93026135','United States','Princeton','634158200'
where not exists (select 1 from public.contacts where lusha_contact_id='634158200');

-- AustralianSuper (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('AustralianSuper') limit 1), 'Mark','Delaney','Chief Investment Officer','C-Suite','Finance','mdelaney@australiansuper.com','https://www.linkedin.com/in/mark-delaney-99313238','Australia','Melbourne','782155862'
where not exists (select 1 from public.contacts where lusha_contact_id='782155862');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('AustralianSuper') limit 1), 'Paul','Dawson','Senior Investment Director, Infrastructure','Director','Finance','pdawson@australiansuper.com','https://www.linkedin.com/in/paul-dawson-cfa-54a9a344','Australia','Melbourne','516551552'
where not exists (select 1 from public.contacts where lusha_contact_id='516551552');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('AustralianSuper') limit 1), 'Deborah','Kelly','Senior Investment Director, Real Assets','Director','Finance','deborahkelly@australiansuper.com','https://www.linkedin.com/in/deborah-kelly-b62b4855','Australia','Sydney','442172102'
where not exists (select 1 from public.contacts where lusha_contact_id='442172102');
