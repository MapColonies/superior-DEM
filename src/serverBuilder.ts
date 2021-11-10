import express, { Router } from 'express';
import { OpenapiViewerRouter, OpenapiRouterConfig } from '@map-colonies/openapi-express-viewer';
import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import { inject, injectable } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import httpLogger from '@map-colonies/express-access-log-middleware';
import { SERVICES } from './common/constants';
import { IConfig } from './common/interfaces';
import { WCS_ROUTER_SYMBOL } from './wcs/routes/wcsRouter';

@injectable()
export class ServerBuilder {
  private readonly serverInstance: express.Application;

  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(WCS_ROUTER_SYMBOL) private readonly wcsRouter: Router,
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerPreRoutesMiddleware();
    this.buildRoutes();
    this.registerPostRoutesMiddleware();

    return this.serverInstance;
  }

  private buildRoutes(): void {
    this.serverInstance.use('/wcs', this.wcsRouter);
  }

  private registerPreRoutesMiddleware(): void {
    this.serverInstance.use(httpLogger({ logger: this.logger }));
    // do we need this? dont think so
    // if (this.config.get<boolean>('server.response.compression.enabled')) {
    //   this.serverInstance.use(compression(this.config.get<compression.CompressionFilter>('server.response.compression.options')));
    // }
  }

  private registerPostRoutesMiddleware(): void {
    this.serverInstance.use(getErrorHandlerMiddleware());
  }
}
