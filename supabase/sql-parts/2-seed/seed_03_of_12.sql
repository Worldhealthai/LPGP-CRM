-- seed: part 3 of 12
-- Run the parts in order. Each one is whole statements, so a part
-- never ends mid-statement. Safe to re-run.

-- ----------------------------------------------------------------------------
-- SPs -- solution providers (no AUM/allocation; service firms)
-- ----------------------------------------------------------------------------
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'KPMG', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'Netherlands', 'Amstelveen', 'Amstelveen, Netherlands', 'https://www.kpmg.com', 'kpmg.com', '270,000+', 'Big Four audit, tax and advisory network serving asset managers and institutional investors worldwide.'
where not exists (select 1 from public.companies where lower(name) = lower('KPMG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'PwC', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.pwc.com', 'pwc.com', '364,000+', 'Big Four professional services firm covering audit, deals, tax and consulting for the private markets industry.'
where not exists (select 1 from public.companies where lower(name) = lower('PwC'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Deloitte', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.deloitte.com', 'deloitte.com', '457,000+', 'Largest professional services network; audit, consulting, financial advisory and tax for GPs and LPs.'
where not exists (select 1 from public.companies where lower(name) = lower('Deloitte'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'MUFG', 'SP', 'Bank', 'Asia Pacific', 'Vendor', 'Japan', 'Tokyo', 'Tokyo, Japan', 'https://www.mufg.jp', 'mufg.jp', '120,000+', 'Global banking group providing financing, fund finance and transaction banking to alternative asset managers.'
where not exists (select 1 from public.companies where lower(name) = lower('MUFG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Apex Group', 'SP', 'Fund administrator', 'Global', 'Vendor', 'Bermuda', 'Hamilton', 'Hamilton, Bermuda', 'https://www.apexgroup.com', 'apexgroup.com', '13,000+', 'Single-source fund administration, depositary and middle-office services for funds across strategies.'
where not exists (select 1 from public.companies where lower(name) = lower('Apex Group'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Citco', 'SP', 'Fund administrator', 'Global', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.citco.com', 'citco.com', '8,000+', 'Leading hedge fund and private markets administrator providing NAV, treasury and investor services.'
where not exists (select 1 from public.companies where lower(name) = lower('Citco'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Kirkland & Ellis', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'Chicago', 'Chicago, IL', 'https://www.kirkland.com', 'kirkland.com', '7,000+', 'Top private equity law firm advising on fund formation, M&A and financing for sponsors globally.'
where not exists (select 1 from public.companies where lower(name) = lower('Kirkland & Ellis'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Simpson Thacher & Bartlett', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.stblaw.com', 'stblaw.com', '2,000+', 'Premier fund formation and private equity legal practice advising leading global GPs and LPs.'
where not exists (select 1 from public.companies where lower(name) = lower('Simpson Thacher & Bartlett'));

-- ----------------------------------------------------------------------------
-- Contacts (work emails via Lusha; de-dupe on Lusha contact id)
-- ----------------------------------------------------------------------------
-- BlackRock
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Gavin','Lewis','Managing Director, Head of Institutional','Director','General Management','gavin.lewis@blackrock.com','https://www.linkedin.com/in/gavin-lewis-19b0664','United Kingdom','London','494938814'
where not exists (select 1 from public.contacts where lusha_contact_id='494938814');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Claire','Lane','Managing Director & Chief Marketing Officer, EMEA','C-Suite','Marketing','claire.lane@blackrock.com','https://www.linkedin.com/in/claire-lane-b1ab864a','United Kingdom',null,'92629316'
where not exists (select 1 from public.contacts where lusha_contact_id='92629316');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('BlackRock') limit 1), 'Stephen','Scharf','Managing Director & Global CISO','C-Suite','Information Technology','stephen.scharf@blackrock.com','https://www.linkedin.com/in/stephen-scharf-75373113','United States','Boston','1314712489'
where not exists (select 1 from public.contacts where lusha_contact_id='1314712489');

-- Blackstone
insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'Kenneth','Caplan','Global Co-Chief Investment Officer','C-Suite','Finance','kenneth.caplan@blackstone.com','https://www.linkedin.com/in/ken-caplan','United States','New York','355761437'
where not exists (select 1 from public.contacts where lusha_contact_id='355761437');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'Mukesh','Mehta','Chief Investment Officer & Senior MD, Private Equity','C-Suite','Finance','mukesh.mehta@blackstone.com','https://www.linkedin.com/in/mukesh-mehta-1920012','India','Mumbai','426796744'
where not exists (select 1 from public.contacts where lusha_contact_id='426796744');

insert into public.contacts (company_id, first_name, last_name, job_title, seniority, department, email, linkedin_url, country, city, lusha_contact_id)
select (select id from public.companies where lower(name)=lower('Blackstone') limit 1), 'James','Seppala','Senior Managing Director & Head of Real Estate','Director','General Management','james.seppala@blackstone.com','https://www.linkedin.com/in/james-seppala','United Kingdom','London','826352526'
where not exists (select 1 from public.contacts where lusha_contact_id='826352526');
