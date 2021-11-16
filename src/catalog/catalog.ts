import {BBox} from 'geojson';

export interface ICatalog {
  getCoverageId: (bbox: BBox, searchType: string) => Promise<string>;
}

export const CATALOG_SYMBOL = Symbol('ICatalog');
