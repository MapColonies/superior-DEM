import { BBox } from 'geojson';

const subsetRegex = /.+\((.+),(.+)\)/;

export function subsetToBBox(subset: [string, string]): BBox {
  const orderedSubset = subset[0].startsWith('Long') ? [subset[1], subset[0]] : subset;
  const latMatch = orderedSubset[0].match(subsetRegex);
  const longMatch = orderedSubset[1].match(subsetRegex);
  if (latMatch === null || longMatch === null) {
    throw new Error('Invalid subset');
  }
  return [parseFloat(longMatch[1]), parseFloat(latMatch[1]), parseFloat(longMatch[2]), parseFloat(latMatch[2])];
}

export function owsBoundingBoxToBbox(owsBbox: { lowerCorner: string; upperCorner: string }): BBox {
  const [longMin, latMin] = owsBbox.lowerCorner.split(' ');
  const [longMax, latMax] = owsBbox.upperCorner.split(' ');
  return [parseFloat(longMin), parseFloat(latMin), parseFloat(longMax), parseFloat(latMax)];
}

export async function streamToString(stream: NodeJS.ReadStream): Promise<string> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}
