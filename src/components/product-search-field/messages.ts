import { defineMessages } from 'react-intl';

export default defineMessages({
  placeholder: { id: 'ProductSearch.placeholder', defaultMessage: 'Search by name or SKU (min. 2 characters)' },
  noResults: { id: 'ProductSearch.noResults', defaultMessage: 'No products found for "{query}"' },
  addProduct: { id: 'ProductSearch.addProduct', defaultMessage: 'Add' },
  duplicateWarning: { id: 'BundleEditor.products.duplicateWarning', defaultMessage: 'This product is already in this look' },
});
