export interface RateSchedule {
  timing: string;
  subTiming?: string;
  rate: string;
  rateUnit?: string;
  remarks: string;
  isSpecial?: boolean;
  highlightColor?: 'green' | 'red' | 'default';
}

export interface Carpark {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  availableLots: number;
  totalLots: number;
  lastUpdatedMins: number;
  isNearest?: boolean;
  tag?: string;
  evInfo: {
    hasEV: boolean;
    provider: string;
    description: string;
    portsCount: number;
  };
  seasonInfo: {
    pricePerMonth: string;
    description: string;
    type: 'commercial' | 'tenant' | 'ura';
  };
  schedules: RateSchedule[];
  gracePeriodMins: number;
  maxHeight: string;
  paymentMethods: string[];
  mapCoords: {
    x: number; // SVG coordinates 0-600
    y: number; // SVG coordinates 0-400
  };
  comparison: {
    oneHrWkday: string;
    twoHrWkend: string;
    evBaysDisplay: string;
    seasonDisplay: string;
    weekendHighlight?: 'green' | 'red' | 'default';
  };
}

export type FilterState = {
  evCharging: boolean;
  seasonLots: boolean;
  lotsOver20: boolean;
  graceOver10: boolean;
  freeNightCap: boolean;
  heightOver2m: boolean;
  motorcycle: boolean;
};

export type SortOption =
  | 'nearest'
  | 'cheapest'
  | 'most_lots'
  | 'ev_capacity';
