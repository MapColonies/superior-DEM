import { SearchTypes } from '../../../../src/wcs/models/types';
import { SimpleCatalog } from '../../../../src/catalog/simpleCatalog/simpleCatalog';
import { CswClient, CSWResponse } from '../../../../src/catalog/csw';

let simpleCatalog: SimpleCatalog;
let getRecordsMock: jest.Mock;
describe('SimpleCatalog', () => {
  beforeEach(function () {
    getRecordsMock = jest.fn();

    simpleCatalog = new SimpleCatalog({ getRecords: getRecordsMock } as unknown as CswClient);
  });

  describe('#getCoverageId', () => {
    it('should return a single coverageId from the csw response', async function () {
      const cswResponse: CSWResponse = {
        nextRecord: 0,
        recordsMatched: 1,
        recordsReturned: 1,
        records: [
          {
            coverageId: 'avi',
            imagingEndDate: '2020-01-01T19:32:30Z',
            resolution: 1,
          },
        ],
      };
      getRecordsMock.mockResolvedValue(cswResponse);

      const coverageId = await simpleCatalog.getCoverageId([0, 0, 0, 0], SearchTypes.MAX_RES);

      expect(coverageId).toBe('avi');
    });

    it('should return the most recent coverage when more than one result is returned', async function () {
      const cswResponse: CSWResponse = {
        nextRecord: 0,
        recordsMatched: 2,
        recordsReturned: 2,
        records: [
          {
            coverageId: 'avi',
            imagingEndDate: '2020-01-01T19:32:30Z',
            resolution: 1,
          },
          {
            coverageId: 'avi2',
            imagingEndDate: '2020-01-02T19:32:31Z',
            resolution: 1,
          },
          {
            coverageId: 'avi3',
            imagingEndDate: '2020-01-02T19:32:31Z',
            resolution: 2,
          },
        ],
      };
      getRecordsMock.mockResolvedValue(cswResponse);

      const coverageId = await simpleCatalog.getCoverageId([0, 0, 0, 0], SearchTypes.MIN_RES);

      expect(coverageId).toBe('avi2');
    });

    it('should throw an error if no records are found', async function () {
      getRecordsMock.mockResolvedValue({
        nextRecord: 0,
        recordsMatched: 0,
        recordsReturned: 0,
        records: [],
      });

      await expect(simpleCatalog.getCoverageId([0, 0, 0, 0], SearchTypes.MAX_RES)).rejects.toThrow(new Error('No matching record was found'));
    });
  });
});
