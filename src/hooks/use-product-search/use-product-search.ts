import { useState, useEffect } from 'react';
import {
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TProductSearchResult } from '../../types';
import SearchProductsQuery from './search-products.ctp.graphql';
import FetchProductsByIdsQuery from './fetch-products-by-ids.ctp.graphql';

type TProductsQuery = { products: { results: TProductSearchResult[] } };

// --- useProductSearch ---

export const useProductSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Build a where clause that matches by name (en locale) or SKU
  const where = debouncedQuery
    ? `masterData(current(masterVariant(sku="${debouncedQuery}") or variants(sku="${debouncedQuery}"))) or masterData(current(name(en="${debouncedQuery}")))`
    : undefined;

  const { data, loading, error } = useMcQuery<
    TProductsQuery,
    { where?: string; limit: number }
  >(SearchProductsQuery, {
    variables: { where, limit: 20 },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    skip: !debouncedQuery,
    // no-cache prevents Apollo from normalising ProductVariant by id:1 across
    // different products — variant IDs are product-scoped, not globally unique.
    fetchPolicy: 'no-cache',
  });

  const products: TProductSearchResult[] = data?.products.results ?? [];
  return {
    products,
    loading,
    error,
    hasQuery: debouncedQuery.length >= 2,
  };
};

// --- useBatchProducts ---

export const useBatchProducts = (productIds: string[]) => {
  const where =
    productIds.length > 0
      ? `id in (${productIds.map((id) => `"${id}"`).join(', ')})`
      : undefined;

  const { data, loading, error } = useMcQuery<
    TProductsQuery,
    { where: string; limit: number }
  >(FetchProductsByIdsQuery, {
    variables: { where: where ?? '', limit: productIds.length || 1 },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    skip: productIds.length === 0,
    // no-cache for same reason as SearchProducts: variant id:1 is not globally
    // unique — each product has its own master variant with id 1.
    fetchPolicy: 'no-cache',
  });

  const results: TProductSearchResult[] = data?.products.results ?? [];
  const productMap = new Map<string, TProductSearchResult>(
    results.map((p) => [p.id, p])
  );

  return { productMap, loading, error };
};
