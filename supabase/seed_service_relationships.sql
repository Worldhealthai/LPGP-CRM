-- ===========================================================================
-- LPGP Connect CRM — sample service relationships (which SPs a GP uses)
-- Run AFTER 0006_service_relationships.sql and the company seeds. Idempotent.
--
-- NOTE: these mappings are ILLUSTRATIVE / directional. Service-provider
-- engagements (counsel, auditor, fund admin, fund finance) are disclosed
-- piecemeal in fund launches, LPAs and press; replace with verified
-- relationships as you confirm them.
-- ===========================================================================

insert into public.service_relationships (client_company_id, provider_company_id, role)
select cl.id, pr.id, v.role
from (values
  ('Blackstone', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('Blackstone', 'Deloitte', 'Auditor'),
  ('Blackstone', 'State Street', 'Fund administrator'),
  ('KKR', 'Kirkland & Ellis', 'Legal counsel'),
  ('KKR', 'KPMG', 'Auditor'),
  ('KKR', 'Citco', 'Fund administrator'),
  ('Apollo Global Management', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('Apollo Global Management', 'Deloitte', 'Auditor'),
  ('Apollo Global Management', 'SS&C Technologies', 'Fund administrator'),
  ('Ares Management', 'Kirkland & Ellis', 'Legal counsel'),
  ('Ares Management', 'EY', 'Auditor'),
  ('Ares Management', 'MUFG', 'Fund finance'),
  ('The Carlyle Group', 'Latham & Watkins', 'Legal counsel'),
  ('The Carlyle Group', 'EY', 'Auditor'),
  ('EQT', 'Clifford Chance', 'Legal counsel'),
  ('EQT', 'KPMG', 'Auditor'),
  ('EQT', 'Aztec Group', 'Fund administrator'),
  ('TPG', 'Kirkland & Ellis', 'Legal counsel'),
  ('TPG', 'Goldman Sachs', 'Placement agent'),
  ('Vista Equity Partners', 'Kirkland & Ellis', 'Legal counsel'),
  ('Vista Equity Partners', 'Apex Group', 'Fund administrator'),
  ('Thoma Bravo', 'Kirkland & Ellis', 'Legal counsel'),
  ('Thoma Bravo', 'PwC', 'Auditor'),
  ('Brookfield Asset Management', 'Latham & Watkins', 'Legal counsel'),
  ('Brookfield Asset Management', 'Morgan Stanley', 'Banking'),
  ('CVC Capital Partners', 'Simpson Thacher & Bartlett', 'Legal counsel'),
  ('CVC Capital Partners', 'Aztec Group', 'Fund administrator'),
  ('Bain Capital', 'Kirkland & Ellis', 'Legal counsel'),
  ('Bain Capital', 'PwC', 'Auditor'),
  ('Warburg Pincus', 'Kirkland & Ellis', 'Legal counsel'),
  ('Warburg Pincus', 'EY', 'Auditor'),
  ('General Atlantic', 'Clifford Chance', 'Legal counsel'),
  ('BlackRock', 'PwC', 'Auditor')
) as v(client_name, provider_name, role)
join public.companies cl on lower(cl.name) = lower(v.client_name)
join public.companies pr on lower(pr.name) = lower(v.provider_name)
where not exists (
  select 1 from public.service_relationships s
  where s.client_company_id = cl.id
    and s.provider_company_id = pr.id
    and coalesce(s.role, '') = coalesce(v.role, '')
);
