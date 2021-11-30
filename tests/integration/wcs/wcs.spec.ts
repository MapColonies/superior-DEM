/* eslint-disable @typescript-eslint/naming-convention */
import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import nock from 'nock';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { emptyResponse, errorResponse, multipleRecordsResponse } from '../../cswBodies';
import { WcsRequestSender } from './helpers/requestSender';

const buffer = Buffer.from('this is a test', 'utf8');

describe('wcs', function () {
  let requestSender: WcsRequestSender;

  beforeEach(function () {
    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    requestSender = new WcsRequestSender(app);
  });

  describe('Happy Path', function () {
    it('should return 200 status code and return the image', async function () {
      const scope = nock('http://localhost:8080')
        .get(/.*wcs.*/)
        .reply(httpStatusCodes.OK, buffer, { 'Content-Type': 'image/geotiff' })
        .post(/.*csw.*/)
        .reply(httpStatusCodes.OK, multipleRecordsResponse, { 'Content-Type': 'application/xml' });
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response.body).toEqual(buffer);
      expect(response.headers).toHaveProperty('content-type', 'image/geotiff');

      scope.done();
    });

    it('should proxy the response from wcs even if its an error', async function () {
      const scope = nock('http://localhost:8080')
        .post(/.*csw.*/)
        .reply(httpStatusCodes.OK, multipleRecordsResponse, { 'Content-Type': 'application/xml' })
        .get(/.*wcs.*/)
        .reply(httpStatusCodes.IM_A_TEAPOT, errorResponse, { 'Content-Type': 'application/xml' });

      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMMinResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.IM_A_TEAPOT);
      expect(response.text).toEqual(errorResponse);
      expect(response.headers).toHaveProperty('content-type', 'application/xml');

      scope.done();
    });
  });
  describe('Bad Path', function () {
    it('should return 400 status code if the coverageId is not provided', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("must have required property 'coverageId'");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it('should return 400 status code if the coverageId is not from the list of available coverages', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'not-available',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain('coverageId must be equal to one of the allowed values: DTMBestResolution, DTMMinResolution');
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it('should return 400 status code if the version is missing', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        request: 'GetCoverage',
        coverageId: 'DTMBestResolution',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("must have required property 'version'");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it('should return 400 status code if the request query param is missing', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("must have required property 'request'");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it('should return 400 if subset is missing', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("must have required property 'subset'");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it("should return 400 if subset doesn't contain long and lat", async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("subset: type must be array");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });

    it('should return 400 if subset contains invalid long and lat', async function () {
      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-200,200)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response.text).toContain("subset: contains must contain at least 1 valid item(s)");
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');
    });
  });
  describe('Sad Path', function () {
    it('should return 503 if the catalog is not available', async function () {
      const scope = nock('http://localhost:8080')
        .post(/.*csw.*/)
        .replyWithError({code: 'ETIMEDOUT'})

      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.SERVICE_UNAVAILABLE);

      scope.done();
    });

    it('should return an error if the catalog response is empty', async function () {
      const scope = nock('http://localhost:8080')
        .post(/.*csw.*/)
        .reply(200, emptyResponse, {'Content-Type': 'application/xml'});

      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');

      scope.done();
    });

    it('should return an error if the catalog returns an error' , async function () {
      const scope = nock('http://localhost:8080')
        .post(/.*csw.*/)
        .reply(500, {});

      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');

      scope.done();
    })

    it('should return 503 if the wcs service is not available', async function () {
      const scope = nock('http://localhost:8080')
        .post(/.*csw.*/)
        .reply(200, multipleRecordsResponse, {'Content-Type': 'application/xml'})
        .get(/.*wcs.*/)
        .replyWithError({code: 'ETIMEDOUT'});

      const response = await requestSender.getCoverage({
        service: 'WCS',
        version: '2.0.1',
        coverageId: 'DTMBestResolution',
        request: 'GetCoverage',
        subset: ['Long(-90,90)', 'Lat(-90,90)'],
      });

      expect(response.status).toBe(httpStatusCodes.SERVICE_UNAVAILABLE);
      expect(response.headers).toHaveProperty('content-type', 'application/xml; charset=utf-8');

      scope.done();
    });
  });
});
