import { BBox } from 'geojson';
import Axios, { Method } from 'axios';
import { injectable } from 'tsyringe';

import {getTraversalObj, convertToJson} from 'fast-xml-parser';
import he from 'he';

const options = {
  attributeNamePrefix: '@_',
  attrNodeName: 'attr', //default is 'false'
  textNodeName: '#text',
  ignoreAttributes: true,
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
  attrValueProcessor: (val: string, attrName: string): string => he.decode(val, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: (val: string, tagName: string): string => he.decode(val), //default is a=>a
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

@injectable()
export class CswClient {
  public constructor() {}

  public async getRecords(
    url: string,
    bbox: BBox,
    sortOrder: 'DESC' | 'ASC',
    sortColumn: string,
    startPosition: number,
    maxRecords?: number
  ): Promise<string> {
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
                <gml:lowerCorner>${bbox[0]} ${bbox[1]}</gml:lowerCorner>
                <gml:upperCorner>${bbox[2]} ${bbox[3]}</gml:upperCorner>
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
      const res = await Axios.post(url, body, { headers: { 'Content-Type': 'text/xml' } });
      const tObj = getTraversalObj(res.data, options);
      const jsonObj = convertToJson(tObj, options);
    } catch (error) {
      console.log(error);
    }

    return 'avi__bad-quality_cog';
  }
}
