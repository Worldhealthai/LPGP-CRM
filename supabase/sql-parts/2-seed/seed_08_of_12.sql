-- seed: part 8 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

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
