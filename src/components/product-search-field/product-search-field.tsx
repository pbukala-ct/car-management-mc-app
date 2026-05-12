import { useState } from 'react';
import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextInput from '@commercetools-uikit/text-input';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useProductSearch } from '../../hooks/use-product-search';
import type { TProductSearchResult } from '../../types';
import messages from './messages';

type Props = {
  existingProductIds: string[];
  onAdd: (product: TProductSearchResult) => void;
};

const ProductSearchField = ({ existingProductIds, onAdd }: Props) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const { products, loading, hasQuery } = useProductSearch(query);

  const getProductName = (product: TProductSearchResult) => {
    const en = product.masterData.current.nameAllLocales.find((n) => n.locale === 'en');
    return en?.value ?? product.masterData.current.nameAllLocales[0]?.value ?? product.id;
  };

  const handleAdd = (product: TProductSearchResult) => {
    if (existingProductIds.includes(product.id)) {
      setDuplicateId(product.id);
      return;
    }
    setDuplicateId(null);
    onAdd(product);
    setQuery('');
  };

  return (
    <Spacings.Stack scale="s">
      <TextInput
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setDuplicateId(null);
        }}
        placeholder={intl.formatMessage(messages.placeholder)}
        aria-label={intl.formatMessage(messages.placeholder)}
      />
      {loading && (
        <Spacings.Inline alignItems="center">
          <LoadingSpinner scale="s" />
        </Spacings.Inline>
      )}
      {!loading && hasQuery && products.length === 0 && (
        <Text.Detail tone="warning">
          {intl.formatMessage(messages.noResults, { query })}
        </Text.Detail>
      )}
      {!loading && products.length > 0 && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: 4,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {products.map((product) => {
            const name = getProductName(product);
            const sku = product.masterData.current.masterVariant.sku;
            const image = product.masterData.current.masterVariant.images[0]?.url;
            const isDuplicate = duplicateId === product.id || existingProductIds.includes(product.id);
            return (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderBottom: '1px solid #eee',
                  background: isDuplicate ? '#fff8e1' : undefined,
                }}
              >
                {image && (
                  <img
                    src={image}
                    alt={name}
                    style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <Spacings.Stack scale="xs">
                    <Text.Body isBold>{name}</Text.Body>
                    {sku && <Text.Detail>{sku}</Text.Detail>}
                    {isDuplicate && (
                      <Text.Detail tone="warning">
                        {intl.formatMessage(messages.duplicateWarning)}
                      </Text.Detail>
                    )}
                  </Spacings.Stack>
                </div>
                <FlatButton
                  label={intl.formatMessage(messages.addProduct)}
                  tone="primary"
                  onClick={() => handleAdd(product)}
                  isDisabled={isDuplicate}
                />
              </div>
            );
          })}
        </div>
      )}
    </Spacings.Stack>
  );
};

ProductSearchField.displayName = 'ProductSearchField';
export default ProductSearchField;
