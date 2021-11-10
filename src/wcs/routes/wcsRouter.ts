import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { WcsController } from '../controllers/wcsController';

const wcsRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(WcsController);

  router.get('/', controller.getCoverage);
  return router;
};

export const WCS_ROUTER_SYMBOL = Symbol('wcsRouterFactory');

export { wcsRouterFactory };
