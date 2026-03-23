export const DEPARTMENTS = {
  PRODUCTION: "Production",
  PROCESSING: "Processing",
  TRANSPORTATION: "Transportation",
  ACCOUNTING: "Accounting",
  MAINTENANCE: "Maintenance",
} as const;

export const DEPARTMENT_CODES: Record<string, string> = {
  Production: "PROD",
  Processing: "PROC",
  Transportation: "TRANS",
  Accounting: "ACCT",
  Maintenance: "MAINT",
};

export const LOCATION_TYPES = [
  "chicken_house",
  "processing_plant",
  "office",
  "fleet",
  "maintenance",
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  chicken_house: "Chicken House / Barn",
  processing_plant: "Processing Plant",
  office: "Office",
  fleet: "Fleet / Transportation",
  maintenance: "Maintenance Area",
};
