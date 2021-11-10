import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';

export interface IResourceNameModel {
  id?: number;
  name: string;
  description: string;
}

@injectable()
export class WcsManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}
  public getResource(): IResourceNameModel {
    this.logger.info('logging');
    return resourceInstance;
  }
}
