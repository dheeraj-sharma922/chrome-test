import { PortalHistoryValue } from './portal-history.value'

export interface PortalValue {
  portal: string;
  retailer: string;
  categories: string[];
  featured: boolean;
  type: string;
  url: string;
  value?: number;
  updatedAt?: Date;
  week?: PortalHistoryValue;
  month?: PortalHistoryValue;
  halfyear?: PortalHistoryValue;
  year?: PortalHistoryValue;
}
