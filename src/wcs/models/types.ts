import { JSONSchemaType } from 'ajv';

export interface RequestParams {
  coverageId: string;
  subset: string[];
  version: '2.0.1';
  service: 'WCS';
  request: 'GetCoverage';
}

export const requestParamsSchema: JSONSchemaType<RequestParams> = {
  type: 'object',
  properties: {
    request: { const: 'GetCoverage', type: 'string' },
    version: { const: '2.0.1', type: 'string' },
    coverageId: { type: 'string',  },
    service: { const: 'WCS', type: 'string' },
    subset: {
      type: 'array',
      items: { type: 'string' },
      allOf: [
        { contains: { type: 'string', pattern: String.raw`^Lat\([-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\)$` } },
        {
          contains: {
            type: 'string',
            pattern: String.raw`^Long\([-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)\)`,
          },
        },
      ],
      minItems: 2,
      maxItems: 2,
    },
  },
  required: ['coverageId', 'request', 'service', 'subset', 'version'],
  additionalProperties: true,
};
