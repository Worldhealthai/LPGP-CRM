-- ===========================================================================
-- LPGP Connect CRM — contacts wave 2 (work emails via Lusha; emails only)
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

-- GIC (LP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('GIC') limit 1), 'Matthew','Lim','Managing Director','Director','General Management','matthewlim@gic.com.sg','https://www.linkedin.com/in/matthew-lim-6011a42','Singapore','Singapore','18383484'
where not exists (select 1 from public.contacts where lusha_contact_id='18383484');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('GIC') limit 1), 'Richard','Massey','Managing Director, Head of Real Estate','Director','General Management','richardmassey@gic.com.sg','https://www.linkedin.com/in/richard-massey-10ba0742','Australia',null,'390039085'
where not exists (select 1 from public.contacts where lusha_contact_id='390039085');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('GIC') limit 1), 'Kenneth','Ho','Portfolio Manager','Manager','Finance','kennethho@gic.com.sg','https://www.linkedin.com/in/hkykenneth','Singapore','Singapore','629821525'
where not exists (select 1 from public.contacts where lusha_contact_id='629821525');

-- Apollo Global Management (GP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apollo Global Management') limit 1), 'Olivia','Wassenaar','Partner, Global Head of Infrastructure','Partner','General Management','owassenaar@apollo.com','https://www.linkedin.com/in/olivia-wassenaar-apollo','United States',null,'201572331'
where not exists (select 1 from public.contacts where lusha_contact_id='201572331');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apollo Global Management') limit 1), 'Christine','Moy','Partner, Head of Digital Assets, Data & AI Strategy','Partner','General Management','christine.moy@apollo.com','https://www.linkedin.com/in/christine-moy','United States','New York','240978350'
where not exists (select 1 from public.contacts where lusha_contact_id='240978350');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Apollo Global Management') limit 1), 'Alex','Van Hoek','Lead Partner, European Private Equity','Partner','General Management','vanhoek@apollo.com','https://www.linkedin.com/in/alex-vanhoek-apollo','United Kingdom',null,'968009012'
where not exists (select 1 from public.contacts where lusha_contact_id='968009012');

-- The Carlyle Group (GP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('The Carlyle Group') limit 1), 'Constantin','Boye','Managing Director, Head of Carlyle Growth Europe','Director','General Management','constantin.boye@carlyle.com','https://www.linkedin.com/in/constantinboye','United Kingdom','London','10122668'
where not exists (select 1 from public.contacts where lusha_contact_id='10122668');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('The Carlyle Group') limit 1), 'Joshua','Pang','Managing Director','Director','General Management','joshua.pang@carlyle.com','https://www.linkedin.com/in/joshpang','United States','New York','255710962'
where not exists (select 1 from public.contacts where lusha_contact_id='255710962');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('The Carlyle Group') limit 1), 'Michael','Wand','Managing Director','Director','General Management','michael.wand@carlyle.com','https://www.linkedin.com/in/michael-wand-43b3a7','United Kingdom',null,'747821358'
where not exists (select 1 from public.contacts where lusha_contact_id='747821358');

-- EQT (GP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('EQT') limit 1), 'Felice','Verduyn Van Weegen','Partner','Partner','General Management','felice.verduyn@eqtpartners.com','https://www.linkedin.com/in/felice-verduyn-van-weegen-9286198','Netherlands','Amsterdam','350183023'
where not exists (select 1 from public.contacts where lusha_contact_id='350183023');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('EQT') limit 1), 'Robert','Maclean','Partner','Partner','General Management','robert.maclean@eqtpartners.com','https://www.linkedin.com/in/robert-maclean-b330a67','United Kingdom',null,'310577595'
where not exists (select 1 from public.contacts where lusha_contact_id='310577595');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('EQT') limit 1), 'Victor','Englesson','Partner, Global Co-Head of TMT','Partner','General Management','victor.englesson@eqtpartners.com','https://www.linkedin.com/in/victor-englesson-476a413','Sweden','Stockholm','755275706'
where not exists (select 1 from public.contacts where lusha_contact_id='755275706');

-- Sequoia Capital (GP)
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Sequoia Capital') limit 1), 'Roelof','Botha','Partner','Partner','General Management','roelof@sequoiacap.com','https://www.linkedin.com/in/roelofbotha','United States','Menlo Park','449122374'
where not exists (select 1 from public.contacts where lusha_contact_id='449122374');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Sequoia Capital') limit 1), 'Luciana','Lixandru','Partner','Partner','General Management','luciana@sequoiacap.com','https://www.linkedin.com/in/luciana-lixandru-11042875','United Kingdom',null,'363043142'
where not exists (select 1 from public.contacts where lusha_contact_id='363043142');
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Sequoia Capital') limit 1), 'George','Robson','Partner','Partner','General Management','grobson@sequoiacap.com','https://www.linkedin.com/in/georgerobson','United Kingdom','London','694902507'
where not exists (select 1 from public.contacts where lusha_contact_id='694902507');
