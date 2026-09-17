-- ===========================================================================
-- all_in_one — part 2 of 3
--
-- Run the parts IN ORDER, each on its own in the SQL editor. They were cut
-- only at statement boundaries, so every part is valid SQL by itself, and
-- each one is safe to re-run.
-- ===========================================================================

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'TPG', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Fort Worth', 'Fort Worth, TX', 'https://www.tpg.com', 'tpg.com', 250000000000, '$50M - $2B', 'Buyout, Growth, Impact', 'Global', 'Diversified alternatives platform spanning buyout (TPG Capital), growth, impact (Rise), real estate and market solutions / credit (Angelo Gordon).', '[{"label":"Capital (Buyout)","value":38},{"label":"Growth","value":22},{"label":"Market Solutions / Credit","value":18},{"label":"Impact","value":12},{"label":"Real Estate","value":10}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('TPG'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Vista Equity Partners', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Austin', 'Austin, TX', 'https://www.vistaequitypartners.com', 'vistaequitypartners.com', 100000000000, '$50M - $1.5B', 'Buyout, Growth', 'North America, Europe', 'Enterprise-software specialist using operational value creation across flagship buyout, mid-market and credit strategies.', '[{"label":"Flagship Buyout","value":55},{"label":"Foundation (Mid)","value":25},{"label":"Endeavor (Growth)","value":12},{"label":"Credit","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Vista Equity Partners'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, aum_usd, check_size, preferred_stages, geographic_focus, investment_thesis, allocations)
select 'Thoma Bravo', 'GP', 'Private equity', 'North America', 'Core GP', 'United States', 'Chicago', 'Chicago, IL', 'https://www.thomabravo.com', 'thomabravo.com', 160000000000, '$50M - $2B', 'Buyout, Growth', 'North America, Europe', 'Software-focused buyout firm scaling flagship, mid-market (Discover) and lower-mid (Explore) funds plus a credit platform.', '[{"label":"Flagship Buyout","value":60},{"label":"Discover (Mid)","value":22},{"label":"Explore (Lower-Mid)","value":10},{"label":"Credit","value":8}]'::jsonb
where not exists (select 1 from public.companies where lower(name)=lower('Thoma Bravo'));

-- ---- SPs ----
insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'EY', 'SP', 'Audit & advisory', 'Global', 'Vendor', 'United Kingdom', 'London', 'London, UK', 'https://www.ey.com', 'ey.com', '395,000+', 'Big Four assurance, tax, strategy and transactions firm serving asset managers, GPs and institutional investors.'
where not exists (select 1 from public.companies where lower(name)=lower('EY'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Goldman Sachs', 'SP', 'Bank', 'North America', 'Vendor', 'United States', 'New York', 'New York, NY', 'https://www.goldmansachs.com', 'goldmansachs.com', '46,000+', 'Global investment bank providing financial sponsors coverage, financing, M&A advisory and prime services to private markets.'
where not exists (select 1 from public.companies where lower(name)=lower('Goldman Sachs'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'SS&C Technologies', 'SP', 'Fund administrator', 'North America', 'Vendor', 'United States', 'Windsor', 'Windsor, CT', 'https://www.ssctech.com', 'ssctech.com', '27,000+', 'Financial technology and fund administration provider for alternatives, delivering accounting, transfer agency and operations software.'
where not exists (select 1 from public.companies where lower(name)=lower('SS&C Technologies'));

insert into public.companies (name, category, sub_type, region, status, country, city, hq_location, website, domain, employee_range, investment_thesis)
select 'Latham & Watkins', 'SP', 'Law firm', 'North America', 'Vendor', 'United States', 'Los Angeles', 'Los Angeles, CA', 'https://www.lw.com', 'lw.com', '7,000+', 'Global law firm with leading fund formation, private equity, finance and capital-markets practices.'
where not exists (select 1 from public.companies where lower(name)=lower('Latham & Watkins'));


-- ##################################################################
-- ## seed_companies_3.sql
-- ##################################################################

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


-- ##################################################################
-- ## seed_contacts_2.sql
-- ##################################################################

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


-- ##################################################################
-- ## seed_contacts_3.sql
-- ##################################################################

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
