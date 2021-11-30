import jsLogger from '@map-colonies/js-logger';
import { AxiosInstance } from 'axios';
import { IConfig } from '../../../src/common/interfaces';
import { SearchTypes } from '../../../src/wcs/models/types';
import { WcsManager } from '../../../src/wcs/models/wcsManager';
import { UpstreamUnavailableError } from '../../../dist/common/errors';

let wcsManager: WcsManager;
let getCoverageIdMock: jest.Mock;
let httpGetMock: jest.Mock;
describe('WcsManager', () => {
  beforeEach(function () {
    getCoverageIdMock = jest.fn();
    httpGetMock = jest.fn();

    wcsManager = new WcsManager(
      jsLogger({ enabled: false }),
      { get: () => 'http://avi' } as unknown as IConfig,
      { getCoverageId: getCoverageIdMock },
      { get: httpGetMock } as unknown as AxiosInstance
    );
  });
  describe('#getCoverage', () => {
    it('should return a stream content type and status code', async function () {
      getCoverageIdMock.mockResolvedValue('avi');
      const returnValue = { data: 'test', headers: { 'content-type': 'application/octet-stream' }, status: 200 };
      httpGetMock.mockResolvedValue(returnValue);

      const res = await wcsManager.getCoverage(
        { request: 'GetCoverage', service: 'WCS', version: '2.0.1', subset: ['Long(-90,90)', 'Lat(-90,90)'] },
        SearchTypes.MAX_RES
      );

      expect(res).toHaveProperty('stream', 'test');
      expect(res).toHaveProperty('contentType', 'application/octet-stream');
      expect(res).toHaveProperty('code', 200);
    });

    it('should throw the error thrown by the catalog if an it throws an error', async function () {
      getCoverageIdMock.mockRejectedValue(new Error('test'));

      await expect(
        wcsManager.getCoverage(
          { request: 'GetCoverage', service: 'WCS', version: '2.0.1', subset: ['Long(-90,90)', 'Lat(-90,90)'] },
          SearchTypes.MAX_RES
        )
      ).rejects.toThrow('test');
    });

    it('should throw an Upstream unavailable error if the error contains request', async function () {
      getCoverageIdMock.mockResolvedValue('avi');
      httpGetMock.mockRejectedValue({ request: {} });

      await expect(
        wcsManager.getCoverage(
          { request: 'GetCoverage', service: 'WCS', version: '2.0.1', subset: ['Long(-90,90)', 'Lat(-90,90)'] },
          SearchTypes.MAX_RES
        )
      ).rejects.toThrow(new UpstreamUnavailableError('no response received from the upstream'));
    });

    it('should throw an error if the request failed before sending', async function () {
      getCoverageIdMock.mockResolvedValue('avi');
      httpGetMock.mockRejectedValue({});

      await expect(
        wcsManager.getCoverage(
          { request: 'GetCoverage', service: 'WCS', version: '2.0.1', subset: ['Long(-90,90)', 'Lat(-90,90)'] },
          SearchTypes.MAX_RES
        )
      ).rejects.toThrow(new Error('wcs request failed to dispatch'));
    });
  });
});
