begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(25);

select has_schema('private', 'non-exposed workflow helper schema exists');
select has_table('public', 'product_categories', 'product_categories exists');
select has_table('public', 'product_series', 'product_series exists');
select has_table('public', 'products', 'products exists');
select has_table('public', 'product_variants', 'product_variants exists');
select has_table('public', 'series_components', 'series_components exists');
select has_table('public', 'technical_field_definitions', 'technical_field_definitions exists');
select has_table('public', 'technical_values', 'technical_values exists');
select has_table('public', 'evidence_sources', 'evidence_sources exists');
select has_table('public', 'compatibility_relationships', 'compatibility_relationships exists');
select has_table('public', 'media_assets', 'media_assets exists');
select has_table('public', 'import_batches', 'import_batches exists');
select has_table('public', 'verification_events', 'verification_events exists');
select has_table('public', 'release_candidates', 'release_candidates exists');
select has_table('public', 'release_qa_results', 'release_qa_results exists');
select has_table('public', 'audit_events', 'audit_events exists');
select has_view('public', 'pi_variant_readiness', 'readiness view exists');
select has_view('public', 'pi_dashboard_metrics', 'dashboard metrics view exists');
select has_function(
  'public',
  'pi_is_valid_lifecycle_transition',
  array['pi_product_lifecycle', 'pi_product_lifecycle'],
  'lifecycle validator exists'
);
select has_function(
  'public',
  'pi_reconcile_shadow_batch',
  array['uuid'],
  'shadow reconciliation function exists'
);
select col_is_pk('public', 'product_variants', 'id', 'product variant id is primary key');
select col_is_unique('public', 'product_variants', 'sku', 'product SKU is unique');
select col_is_unique('public', 'product_variants', 'public_slug', 'product slug is unique');
select has_column(
  'public',
  'release_candidates',
  'current_qa_run_id',
  'release candidate tracks the active QA run'
);
select has_column(
  'public',
  'release_qa_results',
  'qa_run_id',
  'QA results are scoped to an immutable run'
);

select * from finish();
rollback;
