import { defineMessages } from 'react-intl';

export default defineMessages({
  title: { id: 'BundleList.title', defaultMessage: 'Shop the Look' },
  createButton: { id: 'BundleList.createButton', defaultMessage: 'Create New Look' },
  emptyTitle: { id: 'BundleList.emptyState.title', defaultMessage: 'No looks yet' },
  emptyDescription: { id: 'BundleList.emptyState.description', defaultMessage: 'Create your first Shop the Look.' },
  columnName: { id: 'BundleList.column.name', defaultMessage: 'Name' },
  columnProducts: { id: 'BundleList.column.products', defaultMessage: 'Products' },
  columnStatus: { id: 'BundleList.column.status', defaultMessage: 'Status' },
  columnLastModified: { id: 'BundleList.column.lastModified', defaultMessage: 'Last Modified' },
  deleteTooltip: { id: 'BundleList.delete.tooltip', defaultMessage: 'Delete' },
  deleteError: { id: 'BundleEditor.deleteError', defaultMessage: 'Failed to delete the look. Please try again.' },
});
