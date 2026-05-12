export type Vehicle = {
  vin: string;
  modelId: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  licensePlate: string;
  isPrimary: boolean;
  addedAt: string;
};

export type CustomerGarage = {
  vehicles: Vehicle[];
};

export type TCustomObject = {
  id: string;
  key: string;
  version: number;
  value: CustomerGarage;
  lastModifiedAt: string;
};

export type TCustomObjectQueryResult = {
  count: number;
  total: number;
  offset: number;
  results: TCustomObject[];
};

export type TCustomer = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type TCustomerQueryResult = {
  count: number;
  results: TCustomer[];
};
