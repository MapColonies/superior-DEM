import { BBox } from 'geojson';
import Axios, {AxiosError} from 'axios';
import { inject, injectable } from 'tsyringe';

import { getTraversalObj, convertToJson } from 'fast-xml-parser';
import { Logger } from 'pino';
import he from 'he';
import { owsBoundingBoxToBbox } from '../common/util';
import { IConfig } from '../common/interfaces';
import { SERVICES } from '../common/constants';
import { UpstreamUnavailableError } from '../common/errors';

const options = {
  attributeNamePrefix: '',
  attrNodeName: 'attr', //default is 'false'
  textNodeName: '#text',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', //default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  numParseOptions: {
    hex: true,
    leadingZeros: true,
    //skipLike: /\+[0-9]{10}/
  },
  arrayMode: false, //"strict"
  attrValueProcessor: (val: string): string => he.decode(val, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: (val: string): string => he.decode(val), //default is a=>a
  stopNodes: ['parse-me-as-string'],
  alwaysCreateTextNode: false,
};

const NAMESPACES = {
  csw: 'http://www.opengis.net/cat/csw/2.0.2',
  ogc: 'http://www.opengis.net/ogc',
  gml: 'http://www.opengis.net/gml',
  ows: 'http://www.opengis.net/ows',
  mc: 'http://schema.mapcolonies.com/3d',
};

const namespaceString = Object.entries(NAMESPACES)
  .map(([key, value]) => `xmlns:${key}="${value}"`)
  .join(' ');

export interface CswRecord {
  productName: string;
  resolution: number;
  bbox: BBox;
  date: string;
}
export interface CSWResponse {
  nextRecord: number;
  recordsMatched: number;
  recordsReturned: number;
  records: CswRecord[];
}

@injectable()
export class CswClient {
  private readonly cswUrl: string;
  public constructor(@inject(SERVICES.CONFIG) private readonly config: IConfig, @inject(SERVICES.LOGGER) private readonly logger: Logger,) {
    this.cswUrl = this.config.get('csw.url');
  }

  public async getRecords(
    bbox: BBox,
    sortOrder: 'DESC' | 'ASC',
    sortColumn: string,
    startPosition: number,
    maxRecords?: number
  ): Promise<CSWResponse> {
    const body = `<csw:GetRecords xmlns="http://www.opengis.net/cat/csw/2.0.2" ${namespaceString} service="CSW" version="2.0.2" resultType="results" outputSchema="http://schema.mapcolonies.com/raster" startPosition="${startPosition}" ${
      maxRecords !== undefined ? `maxRecords="${maxRecords}"` : ''
    }>
    <csw:Query typeNames="csw:Record">
      <csw:ElementSetName>full</csw:ElementSetName>
      <csw:Constraint version="2.0.2">
        <ogc:Filter>
            <ogc:Within>
              <ogc:PropertyName>ows:BoundingBox</ogc:PropertyName>
              <gml:Envelope>
                <gml:lowerCorner>${bbox[1]} ${bbox[0]}</gml:lowerCorner>
                <gml:upperCorner>${bbox[3]} ${bbox[2]}</gml:upperCorner>
              </gml:Envelope>
            </ogc:Within>
        </ogc:Filter>
      </csw:Constraint>
              <ogc:SortBy>
              <ogc:SortProperty>
                  <ogc:PropertyName>${sortColumn}</ogc:PropertyName>
                  <ogc:SortOrder>${sortOrder}</ogc:SortOrder>
              </ogc:SortProperty>
          </ogc:SortBy>
    </csw:Query>
  </csw:GetRecords>`;
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const res = await Axios.post(this.cswUrl, body, { headers: { 'Content-Type': 'text/xml' } });
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const tObj = getTraversalObj(res.data as string, options);
      const jsonObj = convertToJson(tObj, options);
      const result = jsonObj['csw:GetRecordsResponse']['csw:SearchResults'];
      return {
        nextRecord: result['attr']['nextRecord'],
        recordsMatched: result['attr']['numberOfRecordsMatched'],
        recordsReturned: result['attr']['numberOfRecordsReturned'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        records: result['mc:MCRasterRecord'].map((record: any) => ({
          productName: record['mc:productName'],
          resolution: record['mc:maxResolutionMeter'],
          date: record['mc:creationDateUTC'],
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          bbox: owsBoundingBoxToBbox({lowerCorner:record['ows:BoundingBox']['ows:LowerCorner'], upperCorner:record['ows:BoundingBox']['ows:UpperCorner']}),
        })),
      };
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    } catch (err) {
      const error = err as AxiosError;
      if (error.response) {
        this.logger.error('request to csw failed', {headers: error.response.headers, status: error.response.status, });
        throw Error('request to the catalog has failed')
      } else if (error.request !== undefined) {
        throw new UpstreamUnavailableError('catalog did not respond')
      } else {
        throw err;
      }
    }
  }
}
