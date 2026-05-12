import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TCustomer, TCustomerQueryResult } from '../../types';
import FetchCustomersByIdsQuery from './fetch-customers-by-ids.ctp.graphql';

type TFetchCustomersQuery = { customers: TCustomerQueryResult };
type TFetchCustomersVariables = { where: string; limit: number };

export const useCustomersByIds = (ids: string[]) => {
  const where =
    ids.length > 0
      ? `id in (${ids.map((id) => `"${id}"`).join(', ')})`
      : 'id = ""';

  const { data, loading } = useMcQuery<
    TFetchCustomersQuery,
    TFetchCustomersVariables
  >(FetchCustomersByIdsQuery, {
    variables: { where, limit: Math.max(ids.length, 1) },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    skip: ids.length === 0,
  });

  const customerMap = new Map<string, TCustomer>(
    (data?.customers.results ?? []).map((c: TCustomer) => [c.id, c])
  );

  return { customerMap, loading };
};
