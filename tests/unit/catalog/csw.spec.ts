import jsLogger from '@map-colonies/js-logger';
import { AxiosError, AxiosInstance } from 'axios';
import { CswClient, CSWResponse } from '../../../src/catalog/csw';
import { UpstreamUnavailableError } from '../../../src/common/errors';
import { IConfig } from '../../../src/common/interfaces';
import { emptyResponse, multipleRecordsResponse, singleRecordResponse } from '../../cswBodies';

let cswClient: CswClient;
let httpPostMock: jest.Mock;
describe('CswClient', () => {
  beforeEach(function () {
    httpPostMock = jest.fn();

    cswClient = new CswClient({ get: () => 'http://avi' } as unknown as IConfig, jsLogger({ enabled: false }), {
      post: httpPostMock,
    } as unknown as AxiosInstance);
  });

  describe('#getRecords', () => {
    it('should return the records mapped to CswResponse object', async () => {
      httpPostMock.mockResolvedValue({
        data: multipleRecordsResponse,
      });

      const response = await cswClient.getRecords([0, 0, 0, 0], 'ASC', 'imagingTimeEndUTC', 0);

      expect(response).toEqual({
        nextRecord: '0',
        recordsMatched: '2',
        recordsReturned: '2',
        records: [
          {
            coverageId: 'dem__30n030e_20101117_gmted_min075',
            resolution: 250,
            imagingEndDate: '2010-11-17T17:43:00Z',
          },
          {
            coverageId: 'dem__n32_e035_1arc_v3',
            resolution: 30,
            imagingEndDate: '2000-02-11T17:43:00Z',
          },
        ],
      });
    });

    it('should return a single record as an array', async () => {
      httpPostMock.mockResolvedValue({
        data: singleRecordResponse,
      });

      const response = await cswClient.getRecords([0, 0, 0, 0], 'DESC', 'imagingTimeEndUTC', 0, 10);

      expect(response).toEqual({
        nextRecord: '0',
        recordsMatched: '1',
        recordsReturned: '1',
        records: [
          {
            coverageId: 'dem__30n030e_20101117_gmted_min075',
            resolution: 250,
            imagingEndDate: '2010-11-17T17:43:00Z',
          },
        ],
      });
    });

    it('should return empty array if no results are returned', async () => {
      httpPostMock.mockResolvedValue({
        data: emptyResponse,
      });

      const response = await cswClient.getRecords([0, 0, 0, 0], 'DESC', 'imagingTimeEndUTC', 0, 10);

      expect(response).toEqual({
        nextRecord: '0',
        recordsMatched: '0',
        recordsReturned: '0',
        records: [],
      });
    });

    it('should return and error with csw failed when the csw response is an error', async () => {
      httpPostMock.mockRejectedValue({ response: {}, request: {}, toJSON: jest.fn() });

      await expect(cswClient.getRecords([0, 0, 0, 0], 'DESC', 'imagingTimeEndUTC', 0, 10)).rejects.toThrow(
        new Error('request to the catalog has failed')
      );
    });

    it('should return and error with csw failed when the csw does not respond', async () => {
      httpPostMock.mockRejectedValue({ request: {}, toJSON: jest.fn() });

      await expect(cswClient.getRecords([0, 0, 0, 0], 'DESC', 'imagingTimeEndUTC', 0, 10)).rejects.toThrow(
        new UpstreamUnavailableError('catalog did not respond')
      );
    });

    it('should rethrow any error that doesnt contain request or response object', async () => {
      const err = new Error('test') as AxiosError;
      err.toJSON = jest.fn();
      httpPostMock.mockRejectedValue(err);

      await expect(cswClient.getRecords([0, 0, 0, 0], 'DESC', 'imagingTimeEndUTC', 0, 10)).rejects.toThrow(new Error('test'));
    });
  });
});
