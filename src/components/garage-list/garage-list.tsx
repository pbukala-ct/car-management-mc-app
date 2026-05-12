import { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { NOTIFICATION_KINDS_SIDE } from '@commercetools-frontend/constants';
import DataTable from '@commercetools-uikit/data-table';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { BinLinearIcon } from '@commercetools-uikit/icons';
import { useGarages, useDeleteGarage } from '../../hooks/use-garages';
import { useCustomersByIds } from '../../hooks/use-customers';
import DeleteConfirmModal from '../delete-confirm-modal';
import type { TCustomObject, TCustomer } from '../../types';
import messages from './messages';

const customerLabel = (customer: TCustomer | undefined, fallbackId: string): string => {
  if (!customer) return fallbackId;
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  return name ? `${name} (${customer.email})` : customer.email;
};

const primaryVehicleLabel = (garage: TCustomObject): string => {
  const primary = garage.value.vehicles.find((v) => v.isPrimary);
  if (!primary) {
    const first = garage.value.vehicles[0];
    return first ? `${first.model} ${first.year}` : '—';
  }
  return `${primary.model} ${primary.year}`;
};

const GarageList = () => {
  const intl = useIntl();
  const history = useHistory();
  const { url } = useRouteMatch();
  const showNotification = useShowNotification();

  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TCustomObject | null>(null);

  const { garages, total, pageSize, loading, refetch } = useGarages(page);
  const { execute: deleteGarage, loading: deleting } = useDeleteGarage();

  const customerIds = garages.map((g: TCustomObject) => g.key);
  const { customerMap } = useCustomersByIds(customerIds);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteGarage(deleteTarget.key, deleteTarget.version);
    setDeleteTarget(null);
    if (ok) {
      refetch();
    } else {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: intl.formatMessage(messages.deleteError),
      });
    }
  };

  const columns = [
    { key: 'customer', label: intl.formatMessage(messages.columnCustomer), isSortable: false },
    { key: 'vehicles', label: intl.formatMessage(messages.columnVehicles), isSortable: false },
    { key: 'primary', label: intl.formatMessage(messages.columnPrimary), isSortable: false },
    { key: 'lastModified', label: intl.formatMessage(messages.columnLastModified), isSortable: false },
    { key: 'actions', label: '', isSortable: false },
  ];

  const renderItem = (row: TCustomObject, column: { key: string }) => {
    switch (column.key) {
      case 'customer':
        return (
          <FlatButton
            tone="primary"
            label={customerLabel(customerMap.get(row.key), row.key)}
            onClick={() => history.push(`${url}/${row.key}`)}
          />
        );
      case 'vehicles':
        return <Text.Body>{String(row.value.vehicles.length)}</Text.Body>;
      case 'primary':
        return <Text.Body>{primaryVehicleLabel(row)}</Text.Body>;
      case 'lastModified':
        return (
          <Text.Body>
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              new Date(row.lastModifiedAt)
            )}
          </Text.Body>
        );
      case 'actions':
        return (
          <FlatButton
            icon={<BinLinearIcon />}
            tone="secondary"
            label={intl.formatMessage(messages.deleteTooltip)}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            isDisabled={deleting}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  return (
    <Spacings.Stack scale="l">
      <Text.Headline as="h1">{intl.formatMessage(messages.title)}</Text.Headline>

      {garages.length === 0 ? (
        <Spacings.Stack alignItems="center" scale="m">
          <Text.Headline as="h2">{intl.formatMessage(messages.emptyTitle)}</Text.Headline>
          <Text.Body>{intl.formatMessage(messages.emptyDescription)}</Text.Body>
        </Spacings.Stack>
      ) : (
        <>
          <DataTable columns={columns} rows={garages} itemRenderer={renderItem} />
          <Pagination
            page={page}
            onPageChange={setPage}
            perPage={pageSize}
            onPerPageChange={() => {}}
            totalItems={total}
          />
        </>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          itemName={customerLabel(customerMap.get(deleteTarget.key), deleteTarget.key)}
          isOpen={Boolean(deleteTarget)}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Spacings.Stack>
  );
};

GarageList.displayName = 'GarageList';
export default GarageList;
