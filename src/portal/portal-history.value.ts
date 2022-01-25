export interface PortalHistoryDateValue {
  date: Date,
  value: number
}

export interface PortalHistoryValue {
  average: number;
  high: number;
  low: number;
  data: PortalHistoryDateValue[]
}
