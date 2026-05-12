import { useDeleteBundle, useCreateBundle, useUpdateBundle } from './use-bundles';

// Smoke tests — full integration tests require MC test utils with Apollo mocking
describe('useDeleteBundle', () => {
  it('is a function', () => {
    expect(typeof useDeleteBundle).toBe('function');
  });
});

describe('useCreateBundle', () => {
  it('is a function', () => {
    expect(typeof useCreateBundle).toBe('function');
  });
});

describe('useUpdateBundle', () => {
  it('is a function', () => {
    expect(typeof useUpdateBundle).toBe('function');
  });
});
