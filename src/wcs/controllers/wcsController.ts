import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import Ajv, { ValidateFunction,  } from 'ajv';
import { extension } from 'mime-types';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '@map-colonies/error-express-handler';
import { SERVICES } from '../../common/constants';
import { WcsManager } from '../models/wcsManager';
import { RequestParams, requestParamsSchema } from '../models/types';
import { UpstreamUnavailableError } from '../../common/errors';

type GetHandler = RequestHandler<unknown, string | ArrayBuffer[]>;

@injectable()
export class WcsController {
  private readonly paramsValidator: ValidateFunction<RequestParams>;
  private readonly ajv:Ajv;
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(WcsManager) private readonly manager: WcsManager) {
    this.ajv = new Ajv();
    this.paramsValidator = this.ajv.compile(requestParamsSchema);
  }

  public getCoverage: GetHandler = async (req, res, next) => {
    const query = req.query;
    
    if (!this.paramsValidator(query)) {
      this.logger.warn(this.paramsValidator.errors as object);
      return next(new Error(this.ajv.errorsText(this.paramsValidator.errors)));
    }
    
    try {
      const coverage = await this.manager.getCoverage(query);
      res.status(coverage.code);
      res.setHeader('transfer-encoding', 'chunked');
      res.setHeader('Content-Type', coverage.contentType);
      if (coverage.code === StatusCodes.OK) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        res.setHeader('Content-Disposition', `attachment; filename="coverage.${extension(coverage.contentType) || 'tif'}"`);
      }
      coverage.stream.pipe(res);
    } catch (error) {
      if (error instanceof UpstreamUnavailableError) {
        (error as HttpError).status = StatusCodes.SERVICE_UNAVAILABLE;
      }
      next(error);
    }
  };
}
