import { defineMessages } from 'react-intl';

export default defineMessages({
  editTitle: { id: 'GarageEditor.editTitle', defaultMessage: 'Vehicle Garage' },
  save: { id: 'GarageEditor.save', defaultMessage: 'Save' },
  cancel: { id: 'GarageEditor.cancel', defaultMessage: 'Cancel' },
  deleteGarage: { id: 'GarageEditor.deleteGarage', defaultMessage: 'Delete Garage' },
  unsavedChanges: {
    id: 'GarageEditor.unsavedChanges',
    defaultMessage: 'You have unsaved changes. Are you sure you want to leave?',
  },
  saveSuccess: { id: 'GarageEditor.saveSuccess', defaultMessage: 'Garage saved successfully' },
  saveError: {
    id: 'GarageEditor.saveError',
    defaultMessage: 'Failed to save. Please try again.',
  },
  deleteError: {
    id: 'GarageEditor.deleteError',
    defaultMessage: 'Failed to delete the garage. Please try again.',
  },
  vehiclesTitle: { id: 'GarageEditor.vehicles.title', defaultMessage: 'Vehicles' },
  vehiclesEmpty: {
    id: 'GarageEditor.vehicles.empty',
    defaultMessage: 'No vehicles in this garage.',
  },
  addVehicle: { id: 'GarageEditor.addVehicle', defaultMessage: 'Add Vehicle' },
  removeVehicle: { id: 'GarageEditor.removeVehicle', defaultMessage: 'Remove' },
  setPrimary: { id: 'GarageEditor.setPrimary', defaultMessage: 'Set as Primary' },
  editVehicle: { id: 'GarageEditor.editVehicle', defaultMessage: 'Edit' },
  selectVehicleHint: {
    id: 'GarageEditor.selectVehicleHint',
    defaultMessage: 'Select a vehicle on the left to edit its details.',
  },
  newVehicleTitle: { id: 'GarageEditor.newVehicleTitle', defaultMessage: 'New Vehicle' },
  editVehicleTitle: { id: 'GarageEditor.editVehicleTitle', defaultMessage: 'Edit Vehicle' },
  fieldVin: { id: 'GarageEditor.field.vin', defaultMessage: 'VIN' },
  fieldModel: { id: 'GarageEditor.field.model', defaultMessage: 'Model' },
  fieldModelId: { id: 'GarageEditor.field.modelId', defaultMessage: 'Model ID' },
  fieldTrim: { id: 'GarageEditor.field.trim', defaultMessage: 'Trim' },
  fieldYear: { id: 'GarageEditor.field.year', defaultMessage: 'Year' },
  fieldColor: { id: 'GarageEditor.field.color', defaultMessage: 'Color' },
  fieldLicensePlate: { id: 'GarageEditor.field.licensePlate', defaultMessage: 'License Plate' },
  fieldIsPrimary: { id: 'GarageEditor.field.isPrimary', defaultMessage: 'Primary Vehicle' },
  addVehicleConfirm: { id: 'GarageEditor.addVehicleConfirm', defaultMessage: 'Add' },
  cancelNewVehicle: { id: 'GarageEditor.cancelNewVehicle', defaultMessage: 'Cancel' },
  vinRequired: { id: 'GarageEditor.validation.vinRequired', defaultMessage: 'VIN is required' },
  vinDuplicate: {
    id: 'GarageEditor.validation.vinDuplicate',
    defaultMessage: 'A vehicle with this VIN already exists',
  },
  modelRequired: { id: 'GarageEditor.validation.modelRequired', defaultMessage: 'Model is required' },
  primaryBadge: { id: 'GarageEditor.primaryBadge', defaultMessage: 'Primary' },
});
