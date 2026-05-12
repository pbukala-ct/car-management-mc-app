export type BundleProduct = {
  productId: string;
  variantId: number;
  position: number;
};

export type BundleStatus = 'active' | 'draft';

export type ShopTheLookBundle = {
  name: string;
  description?: string;
  status: BundleStatus;
  products: BundleProduct[];
  createdAt: string;
  updatedAt: string;
};

// Shape returned by the GraphQL customObject / customObjects queries
export type TCustomObject = {
  id: string;
  key: string;
  version: number;
  value: ShopTheLookBundle;
  lastModifiedAt: string;
};

export type TCustomObjectQueryResult = {
  count: number;
  total: number;
  offset: number;
  results: TCustomObject[];
};

// Product shapes from the products GraphQL query
export type TProductPrice = {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
};

export type TProductVariant = {
  id: number;
  sku?: string | null;
  images: Array<{ url: string }>;
  prices: Array<{ value: TProductPrice }>;
};

export type TProductSearchResult = {
  id: string;
  masterData: {
    current: {
      nameAllLocales: Array<{ locale: string; value: string }>;
      masterVariant: TProductVariant;
      variants: TProductVariant[];
    };
  };
};
