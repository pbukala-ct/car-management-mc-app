import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type {
  TCustomObject,
  TCustomObjectQueryResult,
  CustomerGarage,
} from '../../types';
import FetchGaragesQuery from './fetch-garages.ctp.graphql';
import FetchGarageQuery from './fetch-garage.ctp.graphql';
import UpdateGarageMutation from './update-garage.ctp.graphql';
import DeleteGarageMutation from './delete-garage.ctp.graphql';

const CONTAINER = 'customer-vehicles';
const PAGE_SIZE = 20;

type TFetchGaragesQuery = { customObjects: TCustomObjectQueryResult };
type TFetchGaragesVariables = { limit: number; offset: number };

export const useGarages = (page: number) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchGaragesQuery,
    TFetchGaragesVariables
  >(FetchGaragesQuery, {
    variables: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    fetchPolicy: 'network-only',
  });

  return {
    garages: data?.customObjects.results ?? [],
    total: data?.customObjects.total ?? 0,
    pageSize: PAGE_SIZE,
    error,
    loading,
    refetch,
  };
};

type TFetchGarageQuery = { customObject: TCustomObject | null };
type TFetchGarageVariables = { key: string };

export const useGarage = (key: string) => {
  const { data, error, loading } = useMcQuery<
    TFetchGarageQuery,
    TFetchGarageVariables
  >(FetchGarageQuery, {
    variables: { key },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    skip: !key,
  });

  return { garage: data?.customObject ?? null, error, loading };
};

type TUpdateGarageMutation = { createOrUpdateCustomObject: TCustomObject };
type TUpdateGarageVariables = {
  draft: { container: string; key: string; value: string };
};

export const useUpdateGarage = () => {
  const [mutate, { loading }] = useMcMutation<
    TUpdateGarageMutation,
    TUpdateGarageVariables
  >(UpdateGarageMutation);

  const execute = async (key: string, value: CustomerGarage) => {
    const result = await mutate({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { draft: { container: CONTAINER, key, value: JSON.stringify(value) } },
    });
    return result.data?.createOrUpdateCustomObject ?? null;
  };

  return { execute, loading };
};

type TDeleteGarageMutation = { deleteCustomObject: { id: string; key: string } };
type TDeleteGarageVariables = { key: string; version: number };

export const useDeleteGarage = () => {
  const [deleteMutate, { loading }] = useMcMutation<
    TDeleteGarageMutation,
    TDeleteGarageVariables
  >(DeleteGarageMutation);

  const execute = async (key: string, version: number): Promise<boolean> => {
    try {
      await deleteMutate({
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
