import { defineMessages } from 'react-intl';

export default defineMessages({
  title: { id: 'GarageList.title', defaultMessage: 'Customer Garages' },
  emptyTitle: { id: 'GarageList.emptyState.title', defaultMessage: 'No garages found' },
  emptyDescription: {
    id: 'GarageList.emptyState.description',
    defaultMessage: 'No customer vehicle garages exist in this project yet.',
  },
  columnCustomer: { id: 'GarageList.column.customer', defaultMessage: 'Customer' },
  columnVehicles: { id: 'GarageList.column.vehicles', defaultMessage: '# Vehicles' },
  columnPrimary: { id: 'GarageList.column.primary', defaultMessage: 'Primary Vehicle' },
  columnLastModified: { id: 'GarageList.column.lastModified', defaultMessage: 'Last Modified' },
  deleteTooltip: { id: 'GarageList.delete.tooltip', defaultMessage: 'Delete' },
  deleteError: {
    id: 'GarageList.deleteError',
    defaultMessage: 'Failed to delete the garage. Please try again.',
  },
});
