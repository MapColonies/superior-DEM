import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import Axios, { AxiosError } from 'axios';
import qs from 'qs';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { UpstreamUnavailableError } from '../../common/errors';
import { CATALOG_SYMBOL, ICatalog } from '../../catalog/catalog';
import { subsetToBBox } from '../../common/util';
import { RequestParams, SearchTypes } from './types';

export interface CoverageResponse {
  stream: NodeJS.ReadStream;
  contentType: string;
  code: number;
}

@injectable()
export class WcsManager {
  private readonly wcsUrl: string;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(CATALOG_SYMBOL) private readonly catalog: ICatalog
  ) {
    this.wcsUrl = config.get('wcs.url');
  }
  public async getCoverage(params: Omit<RequestParams, 'coverageId'>, searchType:SearchTypes): Promise<CoverageResponse> {
    const bbox = subsetToBBox(params.subset)
    const a = await this.catalog.getCoverageId(bbox, searchType)
    console.log(a);
    
    return this.getCoverageFromWCS({ ...params, coverageId: 'dem__mideast_cog' });
  }

  private async getCoverageFromWCS(params: Omit<RequestParams,'coverageId'> & {coverageId: string}): Promise<CoverageResponse> {
    try {
      const response = await Axios.get<NodeJS.ReadStream>(this.wcsUrl, {
        responseType: 'stream',
        params: params,
        paramsSerializer: (params) => qs.stringify(params, { indices: false }),
        validateStatus: null,
      });
      return { stream: response.data, contentType: response.headers['content-type'], code: response.status };
    } catch (error) {
      const axiosError = error as AxiosError<NodeJS.ReadStream>;
      if (axiosError.request !== undefined) {
        throw new UpstreamUnavailableError('no response received from the upstream');
      } else {
        this.logger.error(axiosError.message);
        throw new Error('wcs request failed to dispatch');
      }
    }
  }
}
