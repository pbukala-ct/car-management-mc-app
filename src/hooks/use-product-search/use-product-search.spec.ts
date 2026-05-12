import { useProductSearch, useBatchProducts } from './use-product-search';

describe('useProductSearch', () => {
  it('is a function', () => {
    expect(typeof useProductSearch).toBe('function');
  });
});

describe('useBatchProducts', () => {
  it('is a function', () => {
    expect(typeof useBatchProducts).toBe('function');
  });
});
