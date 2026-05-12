import type { ApolloError } from '@apollo/client';
import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type {
  TCustomObject,
  TCustomObjectQueryResult,
  ShopTheLookBundle,
} from '../../types';
import FetchBundlesQuery from './fetch-bundles.ctp.graphql';
import FetchBundleQuery from './fetch-bundle.ctp.graphql';
import CreateOrUpdateBundleMutation from './create-or-update-bundle.ctp.graphql';
import DeleteBundleMutation from './delete-bundle.ctp.graphql';

const CONTAINER = 'shop-the-look';
const PAGE_SIZE = 20;

// --- useBundles ---

type TFetchBundlesQuery = { customObjects: TCustomObjectQueryResult };
type TFetchBundlesVariables = { limit: number; offset: number };

export const useBundles = (page: number) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchBundlesQuery,
    TFetchBundlesVariables
  >(FetchBundlesQuery, {
    variables: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    // Always fetch fresh data — list must reflect creates/updates/deletes
    // without requiring a manual refetch call after navigation.
    fetchPolicy: 'network-only',
  });

  return {
    bundles: data?.customObjects.results ?? [],
    total: data?.customObjects.total ?? 0,
    pageSize: PAGE_SIZE,
    error,
    loading,
    refetch,
  };
};

// --- useBundle ---

type TFetchBundleQuery = { customObject: TCustomObject | null };
type TFetchBundleVariables = { key: string };

export const useBundle = (key: string) => {
  const { data, error, loading } = useMcQuery<
    TFetchBundleQuery,
    TFetchBundleVariables
  >(FetchBundleQuery, {
    variables: { key },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    skip: !key,
  });

  return {
    bundle: data?.customObject ?? null,
    error,
    loading,
  };
};

// --- useCreateBundle ---

type TCreateOrUpdateBundleMutation = { createOrUpdateCustomObject: TCustomObject };
// The CT GraphQL API expects `value` as a JSON string, not an inline object
type TCreateOrUpdateBundleVariables = {
  draft: { container: string; key: string; value: string };
};

export const useCreateBundle = () => {
  const [createOrUpdate, { loading }] = useMcMutation<
    TCreateOrUpdateBundleMutation,
    TCreateOrUpdateBundleVariables
  >(CreateOrUpdateBundleMutation);

  const execute = async (value: Omit<ShopTheLookBundle, 'createdAt' | 'updatedAt'>) => {
    const key = crypto.randomUUID();
    const now = new Date().toISOString();
    const draft: ShopTheLookBundle = { ...value, createdAt: now, updatedAt: now };
    const result = await createOrUpdate({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { draft: { container: CONTAINER, key, value: JSON.stringify(draft) } },
    });
    return result.data?.createOrUpdateCustomObject ?? null;
  };

  return { execute, loading };
};

// --- useUpdateBundle ---

export const useUpdateBundle = () => {
  const [createOrUpdate, { loading }] = useMcMutation<
    TCreateOrUpdateBundleMutation,
    TCreateOrUpdateBundleVariables
  >(CreateOrUpdateBundleMutation);

  const execute = async (
    key: string,
    current: TCustomObject,
    next: Omit<ShopTheLookBundle, 'createdAt' | 'updatedAt'>
  ) => {
    const updatedValue: ShopTheLookBundle = {
      ...next,
      createdAt: current.value.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const result = await createOrUpdate({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { draft: { container: CONTAINER, key, value: JSON.stringify(updatedValue) } },
    });
    return result.data?.createOrUpdateCustomObject ?? null;
  };

  return { execute, loading };
};

// --- useDeleteBundle ---

type TDeleteBundleMutation = { deleteCustomObject: { id: string; key: string } };
type TDeleteBundleVariables = { key: string; version: number };

export const useDeleteBundle = () => {
  const [deleteBundle, { loading }] = useMcMutation<
    TDeleteBundleMutation,
    TDeleteBundleVariables
  >(DeleteBundleMutation);

  const execute = async (key: string, version: number): Promise<boolean> => {
    try {
      await deleteBundle({
        context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
        variables: { key, version },
      });
      return true;
    } catch {
      return false;
    }
  };

  return { execute, loading };
};

export type { ApolloError };
