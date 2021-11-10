import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import Axios, { AxiosError } from 'axios';
import { SERVICES } from '../../common/constants';

import { WcsManager } from '../models/wcsManager';
import { streamToString } from '../../common/util';

type GetHandler = RequestHandler<undefined, string | ArrayBuffer[]>;

@injectable()
export class WcsController {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(WcsManager) private readonly manager: WcsManager) {}

  public getCoverage: GetHandler = async (req, res) => {
    try {
      const response = await Axios.get<NodeJS.ReadStream>('http://localhost:8080/geoserver/avi/wcs', { responseType: 'stream', params: req.query });
      response.data.pipe(res);
    } catch (error) {
      const axiosError = error as AxiosError<NodeJS.ReadStream>;

      if (axiosError.response) {
        const resData = await streamToString(axiosError.response.data);
        res.setHeader('Content-Type', 'application/xml');
        res.send(resData);
      } else if (axiosError.request !== undefined) {
        throw new Error('no response received');
      } else {
        throw new Error('request failed to dispatch');
      }
    }
  };
}
