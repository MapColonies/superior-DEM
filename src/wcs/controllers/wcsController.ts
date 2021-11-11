import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import Ajv, { ValidateFunction } from 'ajv';
import { SERVICES } from '../../common/constants';
import { WcsManager } from '../models/wcsManager';
import { RequestParams, requestParamsSchema } from '../models/types';

type GetHandler = RequestHandler<unknown, string | ArrayBuffer[]>;

@injectable()
export class WcsController {
  private readonly paramsValidator: ValidateFunction<RequestParams>;
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(WcsManager) private readonly manager: WcsManager) {
    const ajv = new Ajv();
    this.paramsValidator = ajv.compile(requestParamsSchema);
  }

  public getCoverage: GetHandler = async (req, res,next) => {
    const query = req.query;
    if (!this.paramsValidator(query)) {
      this.logger.warn(this.paramsValidator.errors as object);
      throw new Error(this.paramsValidator.errors?.[0].message ?? 'validation failed');
    }
    try {
      const coverage = await this.manager.getCoverage(query);
      res.status(coverage.code);
      res.setHeader('transfer-encoding', 'chunked');
      res.setHeader('Content-Type', coverage.contentType);
      coverage.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}
