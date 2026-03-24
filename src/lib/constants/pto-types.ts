export const PTO_TYPES = {
  VACATION: "vacation",
  SICK: "sick",
  PERSONAL: "personal",
  BEREAVEMENT: "bereavement",
  MATERNITY: "maternity",
  PATERNITY: "paternity",
} as const;

export type PtoType = (typeof PTO_TYPES)[keyof typeof PTO_TYPES];

export const PTO_TYPE_LABELS: Record<PtoType, string> = {
  vacation: "Vacation",
  sick: "Sick Leave",
  personal: "Personal",
  bereavement: "Bereavement",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
};

export const PTO_REQUEST_STATUSES = ["pending", "approved", "denied", "cancelled"] as const;
export type PtoRequestStatus = (typeof PTO_REQUEST_STATUSES)[number];
