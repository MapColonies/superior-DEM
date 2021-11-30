import * as supertest from 'supertest';
import qs from 'qs';

export class WcsRequestSender {
  public constructor(private readonly app: Express.Application) {}

  public async getCoverage(query: any): Promise<supertest.Response> {
    const queryString = qs.stringify(query, { indices: false });

    return supertest.agent(this.app).get(`/wcs?${queryString}`)
  }
}
