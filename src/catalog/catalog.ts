import {BBox} from 'geojson';
import { SearchTypes } from '../wcs/models/types';

export interface ICatalog {
  getCoverageId: (bbox: BBox, searchType: SearchTypes) => Promise<string>;
}

export const CATALOG_SYMBOL = Symbol('ICatalog');
