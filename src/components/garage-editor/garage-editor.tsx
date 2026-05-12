import { useState, useEffect } from 'react';
import { useHistory, useParams, useRouteMatch, Prompt } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { NOTIFICATION_KINDS_SIDE } from '@commercetools-frontend/constants';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { BinLinearIcon, ArrowLeftIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import { useGarage, useUpdateGarage, useDeleteGarage } from '../../hooks/use-garages';
import { useCustomersByIds } from '../../hooks/use-customers';
import DeleteConfirmModal from '../delete-confirm-modal';
import type { Vehicle } from '../../types';
import messages from './messages';

type RightPanel =
  | { mode: 'idle' }
  | { mode: 'edit'; vin: string }
  | { mode: 'new' };

type NewVehicleForm = {
  vin: string;
  modelId: string;
  model: string;
  trim: string;
  year: string;
  color: string;
  licensePlate: string;
  isPrimary: boolean;
};

const EMPTY_NEW_FORM: NewVehicleForm = {
  vin: '',
  modelId: '',
  model: '',
  trim: '',
  year: '',
  color: '',
  licensePlate: '',
  isPrimary: false,
};

const GarageEditor = () => {
  const intl = useIntl();
  const history = useHistory();
  const match = useRouteMatch();
  const { customerId } = useParams<{ customerId: string }>();
  const showNotification = useShowNotification();

  const { garage, loading: garageLoading } = useGarage(customerId);
  const { customerMap } = useCustomersByIds(customerId ? [customerId] : []);
  const { execute: updateGarage, loading: saving } = useUpdateGarage();
  const { execute: deleteGarage, loading: deleting } = useDeleteGarage();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>({ mode: 'idle' });
  const [newForm, setNewForm] = useState<NewVehicleForm>(EMPTY_NEW_FORM);
  const [newFormErrors, setNewFormErrors] = useState<Partial<Record<keyof NewVehicleForm, string>>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (garage) {
      setVehicles(garage.value.vehicles);
      setIsDirty(false);
    }
  }, [garage]);

  const customer = customerMap.get(customerId);
  const customerLabel = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email
    : customerId;

  const updateVehicleField = <K extends keyof Vehicle>(
    vin: string,
    field: K,
    value: Vehicle[K]
  ) => {
    setVehicles((prev) =>
      prev.map((v) => (v.vin === vin ? { ...v, [field]: value } : v))
    );
    setIsDirty(true);
  };

  const setPrimary = (vin: string) => {
    setVehicles((prev) => prev.map((v) => ({ ...v, isPrimary: v.vin === vin })));
    setIsDirty(true);
  };

  const removeVehicle = (vin: string) => {
    setVehicles((prev) => prev.filter((v) => v.vin !== vin));
    if (rightPanel.mode === 'edit' && rightPanel.vin === vin) {
      setRightPanel({ mode: 'idle' });
    }
    setIsDirty(true);
  };

  const validateNewForm = (): boolean => {
    const errors: Partial<Record<keyof NewVehicleForm, string>> = {};
    if (!newForm.vin.trim()) {
      errors.vin = intl.formatMessage(messages.vinRequired);
    } else if (vehicles.some((v) => v.vin === newForm.vin.trim())) {
      errors.vin = intl.formatMessage(messages.vinDuplicate);
    }
    if (!newForm.model.trim()) {
      errors.model = intl.formatMessage(messages.modelRequired);
    }
    setNewFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddVehicle = () => {
    if (!validateNewForm()) return;
    const newVehicle: Vehicle = {
      vin: newForm.vin.trim(),
      modelId: newForm.modelId.trim() || newForm.model.toLowerCase().replace(/\s+/g, '-'),
      model: newForm.model.trim(),
      trim: newForm.trim.trim(),
      year: parseInt(newForm.year, 10) || new Date().getFullYear(),
      color: newForm.color.trim(),
      licensePlate: newForm.licensePlate.trim(),
      isPrimary: newForm.isPrimary,
      addedAt: new Date().toISOString(),
    };
    setVehicles((prev) => {
      const updated = newVehicle.isPrimary
        ? prev.map((v) => ({ ...v, isPrimary: false }))
        : prev;
      return [...updated, newVehicle];
    });
    setNewForm(EMPTY_NEW_FORM);
    setNewFormErrors({});
    setRightPanel({ mode: 'edit', vin: newVehicle.vin });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!garage) return;
    try {
      const saved = await updateGarage(customerId, { vehicles });
      if (saved) {
        setIsDirty(false);
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: 'side',
          text: intl.formatMessage(messages.saveSuccess),
        });
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
    if (!garage) return;
    const ok = await deleteGarage(customerId, garage.version);
    if (ok) {
      setIsDirty(false);
      const baseUrl = match.url.replace(/\/[^/]+$/, '');
      history.push(baseUrl);
    } else {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: intl.formatMessage(messages.deleteError),
      });
    }
  };

  if (garageLoading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!garage) {
    return (
      <Spacings.Stack>
        <Text.Body>Garage not found.</Text.Body>
      </Spacings.Stack>
    );
  }

  const selectedVehicle =
    rightPanel.mode === 'edit'
      ? vehicles.find((v) => v.vin === rightPanel.vin) ?? null
      : null;

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
              onClick={() => history.push(match.url.replace(/\/[^/]+$/, ''))}
            />
            <div>
              <Text.Headline as="h1">
                {intl.formatMessage(messages.editTitle)}
              </Text.Headline>
              <Text.Detail tone="secondary">{customerLabel}</Text.Detail>
            </div>
          </Spacings.Inline>
          <Spacings.Inline scale="m">
            <FlatButton
              icon={<BinLinearIcon />}
              tone="secondary"
              label={intl.formatMessage(messages.deleteGarage)}
              onClick={() => setShowDeleteModal(true)}
              isDisabled={deleting}
            />
            <SecondaryButton
              label={intl.formatMessage(messages.cancel)}
              onClick={() => history.push(match.url.replace(/\/[^/]+$/, ''))}
            />
            <PrimaryButton
              label={intl.formatMessage(messages.save)}
              onClick={handleSave}
              isDisabled={saving || !isDirty}
            />
          </Spacings.Inline>
        </Spacings.Inline>

        {/* Split panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left: vehicle list */}
          <Spacings.Stack scale="m">
            <Spacings.Inline justifyContent="space-between" alignItems="center">
              <Text.Subheadline as="h4">
                {intl.formatMessage(messages.vehiclesTitle)} ({vehicles.length})
              </Text.Subheadline>
              <FlatButton
                icon={<PlusBoldIcon />}
                tone="primary"
                label={intl.formatMessage(messages.addVehicle)}
                onClick={() => {
                  setNewForm(EMPTY_NEW_FORM);
                  setNewFormErrors({});
                  setRightPanel({ mode: 'new' });
                }}
              />
            </Spacings.Inline>

            {vehicles.length === 0 ? (
              <Text.Body tone="secondary">
                {intl.formatMessage(messages.vehiclesEmpty)}
              </Text.Body>
            ) : (
              <Spacings.Stack scale="s">
                {vehicles.map((v) => {
                  const isSelected =
                    rightPanel.mode === 'edit' && rightPanel.vin === v.vin;
                  return (
                    <div
                      key={v.vin}
                      style={{
                        padding: '12px 14px',
                        border: `2px solid ${isSelected ? '#1a73e8' : '#e0e0e0'}`,
                        borderRadius: 8,
                        background: isSelected ? '#f0f6ff' : '#fafafa',
                        cursor: 'pointer',
                      }}
                      onClick={() => setRightPanel({ mode: 'edit', vin: v.vin })}
                    >
                      <Spacings.Stack scale="xs">
                        <Spacings.Inline justifyContent="space-between" alignItems="center">
                          <Spacings.Inline scale="s" alignItems="center">
                            <Text.Body isBold>
                              {v.model} {v.year}
                            </Text.Body>
                            {v.isPrimary && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 10,
                                  background: '#1a73e8',
                                  color: '#fff',
                                }}
                              >
                                {intl.formatMessage(messages.primaryBadge)}
                              </span>
                            )}
                          </Spacings.Inline>
                          <Spacings.Inline scale="xs">
                            {!v.isPrimary && (
                              <FlatButton
                                tone="primary"
                                label={intl.formatMessage(messages.setPrimary)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrimary(v.vin);
                                }}
                              />
                            )}
                            <FlatButton
                              icon={<BinLinearIcon />}
                              tone="secondary"
                              label={intl.formatMessage(messages.removeVehicle)}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVehicle(v.vin);
                              }}
                            />
                          </Spacings.Inline>
                        </Spacings.Inline>
                        <Text.Detail tone="secondary">{v.vin}</Text.Detail>
                        <Text.Detail>
                          {v.trim} · {v.color} · {v.licensePlate}
                        </Text.Detail>
                      </Spacings.Stack>
                    </div>
                  );
                })}
              </Spacings.Stack>
            )}
          </Spacings.Stack>

          {/* Right: detail / edit form */}
          <div
            style={{
              padding: 20,
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              background: '#fff',
            }}
          >
            {rightPanel.mode === 'idle' && (
              <Text.Body tone="secondary">
                {intl.formatMessage(messages.selectVehicleHint)}
              </Text.Body>
            )}

            {rightPanel.mode === 'new' && (
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4">
                  {intl.formatMessage(messages.newVehicleTitle)}
                </Text.Subheadline>
                <TextField
                  title={intl.formatMessage(messages.fieldVin)}
                  value={newForm.vin}
                  onChange={(e) => setNewForm((p) => ({ ...p, vin: e.target.value }))}
                  errors={newFormErrors.vin ? { missing: true } : undefined}
                  renderError={() => newFormErrors.vin ?? ''}
                  isRequired
                />
                <TextField
                  title={intl.formatMessage(messages.fieldModel)}
                  value={newForm.model}
                  onChange={(e) => setNewForm((p) => ({ ...p, model: e.target.value }))}
                  errors={newFormErrors.model ? { missing: true } : undefined}
                  renderError={() => newFormErrors.model ?? ''}
                  isRequired
                />
                <TextField
                  title={intl.formatMessage(messages.fieldModelId)}
                  hint="e.g. rav4, bz4x"
                  value={newForm.modelId}
                  onChange={(e) => setNewForm((p) => ({ ...p, modelId: e.target.value }))}
                />
                <TextField
                  title={intl.formatMessage(messages.fieldTrim)}
                  value={newForm.trim}
                  onChange={(e) => setNewForm((p) => ({ ...p, trim: e.target.value }))}
                />
                <TextField
                  title={intl.formatMessage(messages.fieldYear)}
                  value={newForm.year}
                  onChange={(e) => setNewForm((p) => ({ ...p, year: e.target.value }))}
                />
                <TextField
                  title={intl.formatMessage(messages.fieldColor)}
                  value={newForm.color}
                  onChange={(e) => setNewForm((p) => ({ ...p, color: e.target.value }))}
                />
                <TextField
                  title={intl.formatMessage(messages.fieldLicensePlate)}
                  value={newForm.licensePlate}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, licensePlate: e.target.value }))
                  }
                />
                <Spacings.Inline scale="s" alignItems="center">
                  <input
                    type="checkbox"
                    id="new-isPrimary"
                    checked={newForm.isPrimary}
                    onChange={(e) =>
                      setNewForm((p) => ({ ...p, isPrimary: e.target.checked }))
                    }
                  />
                  <label htmlFor="new-isPrimary">
                    <Text.Body>{intl.formatMessage(messages.fieldIsPrimary)}</Text.Body>
                  </label>
                </Spacings.Inline>
                <Spacings.Inline scale="m">
                  <PrimaryButton
                    label={intl.formatMessage(messages.addVehicleConfirm)}
                    onClick={handleAddVehicle}
                  />
                  <SecondaryButton
                    label={intl.formatMessage(messages.cancelNewVehicle)}
                    onClick={() => setRightPanel({ mode: 'idle' })}
                  />
                </Spacings.Inline>
              </Spacings.Stack>
            )}

            {rightPanel.mode === 'edit' && selectedVehicle && (
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4">
                  {intl.formatMessage(messages.editVehicleTitle)}
                </Text.Subheadline>
                {/* VIN and Model are identifiers — shown read-only */}
                <Spacings.Stack scale="xs">
                  <Text.Detail isBold>{intl.formatMessage(messages.fieldVin)}</Text.Detail>
                  <Text.Body>{selectedVehicle.vin}</Text.Body>
                </Spacings.Stack>
                <Spacings.Stack scale="xs">
                  <Text.Detail isBold>{intl.formatMessage(messages.fieldModel)}</Text.Detail>
                  <Text.Body>{selectedVehicle.model}</Text.Body>
                </Spacings.Stack>
                <TextField
                  title={intl.formatMessage(messages.fieldTrim)}
                  value={selectedVehicle.trim}
                  onChange={(e) =>
                    updateVehicleField(selectedVehicle.vin, 'trim', e.target.value)
                  }
                />
                <TextField
                  title={intl.formatMessage(messages.fieldYear)}
                  value={String(selectedVehicle.year)}
                  onChange={(e) =>
                    updateVehicleField(
                      selectedVehicle.vin,
                      'year',
                      parseInt(e.target.value, 10) || selectedVehicle.year
                    )
                  }
                />
                <TextField
                  title={intl.formatMessage(messages.fieldColor)}
                  value={selectedVehicle.color}
                  onChange={(e) =>
                    updateVehicleField(selectedVehicle.vin, 'color', e.target.value)
                  }
                />
                <TextField
                  title={intl.formatMessage(messages.fieldLicensePlate)}
                  value={selectedVehicle.licensePlate}
                  onChange={(e) =>
                    updateVehicleField(selectedVehicle.vin, 'licensePlate', e.target.value)
                  }
                />
                <Spacings.Inline scale="s" alignItems="center">
                  <input
                    type="checkbox"
                    id={`isPrimary-${selectedVehicle.vin}`}
                    checked={selectedVehicle.isPrimary}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPrimary(selectedVehicle.vin);
                      } else {
                        updateVehicleField(selectedVehicle.vin, 'isPrimary', false);
                      }
                    }}
                  />
                  <label htmlFor={`isPrimary-${selectedVehicle.vin}`}>
                    <Text.Body>{intl.formatMessage(messages.fieldIsPrimary)}</Text.Body>
                  </label>
                </Spacings.Inline>
              </Spacings.Stack>
            )}
          </div>
        </div>
      </Spacings.Stack>

      {showDeleteModal && garage && (
        <DeleteConfirmModal
          itemName={customerLabel}
          isOpen={showDeleteModal}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

GarageEditor.displayName = 'GarageEditor';
export default GarageEditor;
