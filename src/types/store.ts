/** Lottery store that has had at least one 1st-prize winner */
export interface WinningStore {
  /** Store name */
  name: string;
  /** Full street address */
  address: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Rounds where 1st prize was won at this store */
  rounds: number[];
  /** Total 1st prize count */
  totalWins: number;
  /** Region (시/도) */
  region: string;
}

export interface StoreDataFile {
  lastUpdated: string;
  totalStores: number;
  stores: WinningStore[];
}
