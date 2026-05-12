import { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams, useRouteMatch, Prompt } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { NOTIFICATION_KINDS_SIDE } from '@commercetools-frontend/constants';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import SelectField from '@commercetools-uikit/select-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { BinLinearIcon, ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon } from '@commercetools-uikit/icons';
import {
  useBundle,
  useCreateBundle,
  useUpdateBundle,
  useDeleteBundle,
} from '../../hooks/use-bundles';
import { useBatchProducts } from '../../hooks/use-product-search';
import { getVariantPrice } from '../../helpers';
import type {
  BundleProduct,
  BundleStatus,
  TCustomObject,
  TProductSearchResult,
  TProductVariant,
} from '../../types';
import ProductSearchField from '../product-search-field';
import VariantSelector from '../variant-selector';
import DeleteConfirmModal from '../delete-confirm-modal';
import StatusBadge from '../status-badge';
import messages from './messages';

type FormState = {
  name: string;
  description: string;
  status: BundleStatus;
  products: BundleProduct[];
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  status: 'draft',
  products: [],
};

type VariantSelectorState = {
  productId: string;
  variants: TProductVariant[];
  currentVariantId: number;
} | null;

type Props = { isNew: boolean };

const BundleEditor = ({ isNew }: Props) => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();
  const { bundleKey } = useParams<{ bundleKey?: string }>();
  const showNotification = useShowNotification();
  // Pending navigation target — set after save so the redirect fires inside a
  // useEffect, which runs after React has committed isDirty=false and the
  // <Prompt> has already been disabled for that render.
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Load existing bundle when editing
  const { bundle, loading: bundleLoading } = useBundle(bundleKey ?? '');

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isDirty, setIsDirty] = useState(false);
  const [nameError, setNameError] = useState('');
  const [variantSelector, setVariantSelector] = useState<VariantSelectorState>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch full product data for pre-populated products
  const productIds = form.products.map((p) => p.productId);
  const { productMap, loading: productsLoading } = useBatchProducts(productIds);

  const { execute: createBundle, loading: creating } = useCreateBundle();
  const { execute: updateBundle, loading: updating } = useUpdateBundle();
  const { execute: deleteBundle, loading: deleting } = useDeleteBundle();

  // Populate form from loaded bundle
  useEffect(() => {
    if (!isNew && bundle) {
      // Sort by stored position (fall back to array index for legacy data without position)
      const sorted = [...bundle.value.products]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((p, i) => ({ ...p, position: i }));
      setForm({
        name: bundle.value.name,
        description: bundle.value.description ?? '',
        status: bundle.value.status,
        products: sorted,
      });
      setIsDirty(false);
    }
  }, [isNew, bundle]);

  // Navigate only after the render where isDirty was set to false has committed,
  // so <Prompt when={isDirty}> is already disabled before history.replace fires.
  useEffect(() => {
    if (redirectTo && !isDirty) {
      history.replace(redirectTo);
    }
  }, [redirectTo, isDirty, history]);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    []
  );

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setNameError(intl.formatMessage(messages.nameRequired));
      return false;
    }
    if (form.name.length > 255) {
      setNameError(intl.formatMessage(messages.nameTooLong));
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      // Normalise positions to sequential integers based on current array order
      products: form.products.map((p, i) => ({ ...p, position: i })),
    };
    try {
      let saved: TCustomObject | null;
      if (isNew) {
        saved = await createBundle(payload);
      } else {
        saved = await updateBundle(bundleKey!, bundle!, payload);
      }
      if (saved) {
        setIsDirty(false);
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: 'side',
          text: intl.formatMessage(messages.saveSuccess),
        });
        // Navigate back to the list. Strip the last path segment ("/new" or
        // "/:bundleKey") so we always land on the shop-the-look root.
        // This is deferred via setRedirectTo so the navigation fires in a
        // useEffect — after React has committed isDirty=false and disabled
        // <Prompt> — rather than synchronously here where the Prompt would
        // still see the stale isDirty=true.
        const baseUrl = match.url.replace(/\/[^/]+$/, '');
        setRedirectTo(baseUrl);
      }
    } catch {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: intl.formatMessage(messages.saveError),
      });
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    if (!bundleKey || !bundle) return;
    const ok = await deleteBundle(bundleKey, bundle.version);
    if (ok) {
      setIsDirty(false);
      history.push('..');
    } else {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: intl.formatMessage(messages.deleteError),
      });
    }
  };

  const handleAddProduct = (product: TProductSearchResult) => {
    const variants = [
      product.masterData.current.masterVariant,
      ...product.masterData.current.variants,
    ];
    const variantId = variants[0]?.id ?? 1;
    setField('products', [
      ...form.products,
      { productId: product.id, variantId, position: form.products.length },
    ]);
    // Auto-select single variant; open selector if multiple
    if (variants.length > 1) {
      setVariantSelector({ productId: product.id, variants, currentVariantId: variantId });
    }
  };

  const handleVariantConfirm = (variantId: number) => {
    if (!variantSelector) return;
    setField(
      'products',
      form.products.map((p) =>
        p.productId === variantSelector.productId ? { ...p, variantId } : p
      )
    );
    setVariantSelector(null);
  };

  const handleRemoveProduct = (productId: string) => {
    setField(
      'products',
      form.products.filter((p) => p.productId !== productId)
    );
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const next = [...form.products];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    // Keep position fields in sync with array order
    setField('products', next.map((p, i) => ({ ...p, position: i })));
  };

  const getProductName = (product: TProductSearchResult) => {
    const en = product.masterData.current.nameAllLocales.find((n) => n.locale === 'en');
    return en?.value ?? product.masterData.current.nameAllLocales[0]?.value ?? '';
  };

  const isSaving = creating || updating;

  if (!isNew && bundleLoading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  const title = isNew
    ? intl.formatMessage(messages.createTitle)
    : intl.formatMessage(messages.editTitle);

  return (
    <>
      <Prompt when={isDirty} message={intl.formatMessage(messages.unsavedChanges)} />

      <Spacings.Stack scale="l">
        {/* Header */}
        <Spacings.Inline justifyContent="space-between" alignItems="center">
          <Spacings.Inline alignItems="center" scale="m">
            <FlatButton
              icon={<ArrowLeftIcon />}
              tone="secondary"
              label="Back to list"
              onClick={() => history.push('..')}
            />
            <Text.Headline as="h1">{title}</Text.Headline>
          </Spacings.Inline>
          <Spacings.Inline scale="m">
            {!isNew && (
              <FlatButton
                icon={<BinLinearIcon />}
                tone="secondary"
                label={intl.formatMessage(messages.delete)}
                onClick={() => setShowDeleteModal(true)}
                isDisabled={deleting}
              />
            )}
            <SecondaryButton
              label={intl.formatMessage(messages.cancel)}
              onClick={() => history.push('..')}
            />
            <PrimaryButton
              label={intl.formatMessage(messages.save)}
              onClick={handleSave}
              isDisabled={isSaving}
            />
          </Spacings.Inline>
        </Spacings.Inline>

        {/* Split-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left panel: form fields + product search */}
          <Spacings.Stack scale="m">
            <TextField
              title={intl.formatMessage(messages.fieldName)}
              hint={intl.formatMessage(messages.fieldNameHint)}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              errors={nameError ? { missing: true } : undefined}
              renderError={() => nameError}
              isRequired
            />
            <TextField
              title={intl.formatMessage(messages.fieldDescription)}
              hint={intl.formatMessage(messages.fieldDescriptionHint)}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            <SelectField
              title={intl.formatMessage(messages.fieldStatus)}
              value={form.status}
              onChange={(e) => setField('status', e.target.value as BundleStatus)}
              options={[
                { value: 'draft', label: intl.formatMessage(messages.statusDraft) },
                { value: 'active', label: intl.formatMessage(messages.statusActive) },
              ]}
            />
            <Text.Subheadline as="h4">Add Products</Text.Subheadline>
            <ProductSearchField
              existingProductIds={form.products.map((p) => p.productId)}
              onAdd={handleAddProduct}
            />
          </Spacings.Stack>

          {/* Right panel: selected products */}
          <Spacings.Stack scale="m">
            <Text.Subheadline as="h4">
              {intl.formatMessage(messages.productsTitle)} ({form.products.length})
            </Text.Subheadline>
            {form.products.length === 0 ? (
              <Text.Body tone="secondary">
                {intl.formatMessage(messages.productsEmpty)}
              </Text.Body>
            ) : (
              <Spacings.Stack scale="s">
                {form.products.map((bp, index) => {
                  const product = productMap.get(bp.productId);
                  const allVariants = product
                    ? [
                        product.masterData.current.masterVariant,
                        ...product.masterData.current.variants,
                      ]
                    : [];
                  const variant = allVariants.find((v) => v.id === bp.variantId);
                  const image = variant?.images[0]?.url ?? allVariants[0]?.images[0]?.url;
                  const name = product ? getProductName(product) : bp.productId;
                  const sku = variant?.sku ?? allVariants[0]?.sku;
                  const price = variant ? getVariantPrice(variant) : null;
                  return (
                    <div
                      key={bp.productId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 6,
                        background: '#fafafa',
                      }}
                    >
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                        />
                      )}
                      {productsLoading && !product && (
                        <LoadingSpinner scale="s" />
                      )}
                      <div style={{ flex: 1 }}>
                        <Spacings.Stack scale="xs">
                          <Text.Body isBold>{name}</Text.Body>
                          {sku && <Text.Detail>SKU: {sku}</Text.Detail>}
                          {price && <Text.Detail>{price}</Text.Detail>}
                        </Spacings.Stack>
                      </div>
                      <Spacings.Inline scale="s" alignItems="center">
                        {/* Reorder buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <FlatButton
                            icon={<ArrowUpIcon />}
                            tone="secondary"
                            label=""
                            onClick={() => handleMoveProduct(index, 'up')}
                            isDisabled={index === 0}
                          />
                          <FlatButton
                            icon={<ArrowDownIcon />}
                            tone="secondary"
                            label=""
                            onClick={() => handleMoveProduct(index, 'down')}
                            isDisabled={index === form.products.length - 1}
                          />
                        </div>
                        {allVariants.length > 1 && (
                          <FlatButton
                            label={intl.formatMessage(messages.productSelectVariant)}
                            tone="primary"
                            onClick={() =>
                              setVariantSelector({
                                productId: bp.productId,
                                variants: allVariants,
                                currentVariantId: bp.variantId,
                              })
                            }
                          />
                        )}
                        <FlatButton
                          icon={<BinLinearIcon />}
                          tone="secondary"
                          label={intl.formatMessage(messages.productRemove)}
                          onClick={() => handleRemoveProduct(bp.productId)}
                        />
                      </Spacings.Inline>
                    </div>
                  );
                })}
              </Spacings.Stack>
            )}

            {/* Status preview */}
            <Spacings.Inline alignItems="center" scale="s">
              <Text.Detail>Current status:</Text.Detail>
              <StatusBadge status={form.status} />
            </Spacings.Inline>
          </Spacings.Stack>
        </div>
      </Spacings.Stack>

      {/* Variant selector modal */}
      {variantSelector && (
        <VariantSelector
          variants={variantSelector.variants}
          selectedVariantId={variantSelector.currentVariantId}
          isOpen={Boolean(variantSelector)}
          onConfirm={handleVariantConfirm}
          onClose={() => setVariantSelector(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && bundle && (
        <DeleteConfirmModal
          bundleName={bundle.value.name}
          isOpen={showDeleteModal}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

BundleEditor.displayName = 'BundleEditor';
export default BundleEditor;
