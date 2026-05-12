import { isApolloError, ApolloError, type ServerError } from '@apollo/client';
import type { TProductPrice, TProductVariant } from './types';

export const formatPrice = (price: TProductPrice): string => {
  const amount = price.centAmount / Math.pow(10, price.fractionDigits);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: price.currencyCode,
  }).format(amount);
};

export const getVariantPrice = (variant: TProductVariant): string | null => {
  const price = variant.prices[0]?.value;
  return price ? formatPrice(price) : null;
};

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => {
  return Boolean((error as ServerError)?.result);
};

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof Error && isApolloError(graphQlResponse)) {
    if (
      isServerError(graphQlResponse.networkError) &&
      typeof graphQlResponse.networkError?.result !== 'string' &&
      graphQlResponse.networkError?.result?.errors.length > 0
    ) {
      return graphQlResponse?.networkError?.result.errors;
    }

    if (graphQlResponse.graphQLErrors?.length > 0) {
      return graphQlResponse.graphQLErrors;
    }
  }

  return graphQlResponse;
};
