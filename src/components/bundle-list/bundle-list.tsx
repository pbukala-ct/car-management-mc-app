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
import PrimaryButton from '@commercetools-uikit/primary-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { BinLinearIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import { useBundles, useDeleteBundle } from '../../hooks/use-bundles';
import { useBatchProducts } from '../../hooks/use-product-search';
import StatusBadge from '../status-badge';
import DeleteConfirmModal from '../delete-confirm-modal';
import type { TCustomObject, TProductSearchResult } from '../../types';
import messages from './messages';

// Max thumbnails + names shown per row in the list
const PREVIEW_LIMIT = 4;

type BundlePreviewProps = {
  bundle: TCustomObject;
  productMap: Map<string, TProductSearchResult>;
};

const BundlePreview = ({ bundle, productMap }: BundlePreviewProps) => {
  const preview = bundle.value.products.slice(0, PREVIEW_LIMIT);
  if (preview.length === 0) {
    return <Text.Detail tone="secondary">—</Text.Detail>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {preview.map((bp) => {
        const product = productMap.get(bp.productId);
        const variant = product
          ? [
              product.masterData.current.masterVariant,
              ...product.masterData.current.variants,
            ].find((v) => v.id === bp.variantId) ??
            product.masterData.current.masterVariant
          : null;
        const image = variant?.images[0]?.url;
        const name = product
          ? (
              product.masterData.current.nameAllLocales.find((n) => n.locale === 'en') ??
              product.masterData.current.nameAllLocales[0]
            )?.value ?? ''
          : bp.productId;

        return (
          <div
            key={bp.productId}
            title={name}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 60 }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #e0e0e0' }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#aaa',
                }}
              >
                ?
              </div>
            )}
            <Text.Detail
              tone="secondary"
              // truncate long names
            >
              <span
                style={{
                  display: 'block',
                  maxWidth: 56,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 10,
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}
              >
                {name}
              </span>
            </Text.Detail>
          </div>
        );
      })}
      {bundle.value.products.length > PREVIEW_LIMIT && (
        <Text.Detail tone="secondary">
          +{bundle.value.products.length - PREVIEW_LIMIT} more
        </Text.Detail>
      )}
    </div>
  );
};

const BundleList = () => {
  const intl = useIntl();
  const history = useHistory();
  const { url } = useRouteMatch();
  const showNotification = useShowNotification();

  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TCustomObject | null>(null);

  const { bundles, total, pageSize, loading, refetch } = useBundles(page);
  const { execute: deleteBundle, loading: deleting } = useDeleteBundle();

  // Collect unique product IDs from all visible bundles for one batch fetch
  const allProductIds: string[] = Array.from(
    new Set(
      bundles.flatMap((b: TCustomObject) =>
        b.value.products.slice(0, PREVIEW_LIMIT).map((p) => p.productId)
      )
    )
  );
  const { productMap } = useBatchProducts(allProductIds);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteBundle(deleteTarget.key, deleteTarget.version);
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
    { key: 'preview', label: 'Products', isSortable: false },
    { key: 'name', label: intl.formatMessage(messages.columnName), isSortable: false },
    { key: 'count', label: '#', isSortable: false },
    { key: 'status', label: intl.formatMessage(messages.columnStatus), isSortable: false },
    { key: 'lastModified', label: intl.formatMessage(messages.columnLastModified), isSortable: false },
    { key: 'actions', label: '', isSortable: false },
  ];

  const renderItem = (row: TCustomObject, column: { key: string }) => {
    switch (column.key) {
      case 'preview':
        return <BundlePreview bundle={row} productMap={productMap} />;
      case 'name':
        return (
          <FlatButton
            tone="primary"
            label={row.value.name}
            onClick={() => history.push(`${url}/${row.key}`)}
          />
        );
      case 'count':
        return <Text.Body>{String(row.value.products.length)}</Text.Body>;
      case 'status':
        return <StatusBadge status={row.value.status} />;
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
      <Spacings.Inline justifyContent="space-between" alignItems="center">
        <Text.Headline as="h1">{intl.formatMessage(messages.title)}</Text.Headline>
        <PrimaryButton
          iconLeft={<PlusBoldIcon />}
          label={intl.formatMessage(messages.createButton)}
          onClick={() => history.push(`${url}/new`)}
        />
      </Spacings.Inline>

      {bundles.length === 0 ? (
        <Spacings.Stack alignItems="center" scale="m">
          <Text.Headline as="h2">{intl.formatMessage(messages.emptyTitle)}</Text.Headline>
          <Text.Body>{intl.formatMessage(messages.emptyDescription)}</Text.Body>
          <PrimaryButton
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.createButton)}
            onClick={() => history.push(`${url}/new`)}
          />
        </Spacings.Stack>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={bundles}
            itemRenderer={renderItem}
          />
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
          bundleName={deleteTarget.value.name}
          isOpen={Boolean(deleteTarget)}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Spacings.Stack>
  );
};

BundleList.displayName = 'BundleList';
export default BundleList;
