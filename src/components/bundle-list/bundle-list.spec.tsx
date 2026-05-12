import { screen } from '@testing-library/react';
import { renderApplication as renderApp } from '../../test-utils';
import BundleList from './bundle-list';

// Mock the useBundles hook so tests don't need real Apollo
jest.mock('../../hooks/use-bundles', () => ({
  useBundles: () => ({
    bundles: [],
    total: 0,
    pageSize: 20,
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  }),
  useDeleteBundle: () => ({
    execute: jest.fn(),
    loading: false,
  }),
}));

describe('BundleList', () => {
  it('shows empty state when no bundles exist', async () => {
    renderApp(<BundleList />, {});
    expect(await screen.findByText(/no looks yet/i)).toBeInTheDocument();
  });

  it('shows create button', async () => {
    renderApp(<BundleList />, {});
    expect(await screen.findAllByText(/create new look/i)).not.toHaveLength(0);
  });
});
