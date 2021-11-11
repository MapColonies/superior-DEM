import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import Axios, { AxiosError } from 'axios';
import qs from 'qs';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { RequestParams } from './types';

export interface CoverageResponse {
  stream: NodeJS.ReadStream;
  contentType: string;
  code: number;
}

@injectable()
export class WcsManager {
  private readonly wcsUrl: string;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {
    this.wcsUrl = config.get('wcs.url');
  }
  public async getCoverage(reqParams: RequestParams): Promise<CoverageResponse> {
    const { coverageId, ...params } = reqParams;
    try {
      const response = await Axios.get<NodeJS.ReadStream>(this.wcsUrl, {
        responseType: 'stream',
        params: { coverageId, ...params },
        paramsSerializer: (params) => qs.stringify(params, { indices: false }),
        validateStatus: null,
      });
      return { stream: response.data, contentType: response.headers['content-type'], code: response.status };
    } catch (error) {
      const axiosError = error as AxiosError<NodeJS.ReadStream>;
      if (axiosError.request !== undefined) {
        throw new Error('no response received from the upstream');
      } else {
        throw new Error('request failed to dispatch');
      }
    }
  }
}
