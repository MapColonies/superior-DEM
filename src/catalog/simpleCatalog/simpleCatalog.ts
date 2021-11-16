import { BBox } from 'geojson';
import { injectable } from 'tsyringe';
import { ICatalog } from '../catalog';
import { CswClient } from '../csw';

@injectable()
export class SimpleCatalog implements ICatalog {
  public constructor(private readonly cswClient: CswClient) {}

  public async getCoverageId(bbox: BBox, searchType: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    try {
      const res = await this.cswClient.getRecords('http://raster-qa-catalog-raster-catalog-pycsw-route-raster.apps.v0h0bdx6.eastus.aroapp.io/',[-90,-90,90,90],'ASC', 'mc:minHorizontalAccuracyCE90', 1, 5)
      return res;      
    } catch (error) {
      console.log(error);
    }
    
    return 'avi__bad-quality_cog';
  }
}
