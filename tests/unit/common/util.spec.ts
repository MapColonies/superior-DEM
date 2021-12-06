import jsLogger from '@map-colonies/js-logger';
import { owsBoundingBoxToBbox, subsetToBBox } from '../../../src/common/util';

describe('util', () => {
  describe('#owsBoundingBoxToBbox', () => {
    it('should return a tuple of numbers', function () {
      const owsBbox = { lowerCorner: '-180 -90', upperCorner: '180 90' };

      const result = owsBoundingBoxToBbox(owsBbox);

      expect(result).toEqual([-180, -90, 180, 90]);
    });
  });
  describe('#subsetToBBox', () => {
    it('should parse the subset to bbox', function () {
      const subset: [string, string] = ['Long(-180,180)', 'Lat(-90,90)'];

      const result = subsetToBBox(subset);

      expect(result).toEqual([-180, -90, 180, 90]);
    });

    it('should throw an error if the subset does not include lat and long', function () {
      const subset: [string, string] = ['Lat(-180,180)', 'Lat(-90,90)'];

      expect(() => subsetToBBox(subset)).toThrow();
    });

    it('should throw an error if the format is wrong', function () {
      const subset: [string, string] = ['Long(180)', 'Lat(-90,90)'];

      expect(() => subsetToBBox(subset)).toThrow();
    });
  });
});
