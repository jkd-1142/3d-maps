const LON0 = 120.95;
const LAT0 = 23.75;
const SCALE = 24;
const LONGITUDE_FACTOR = Math.cos((LAT0 * Math.PI) / 180);

export function project(lon, lat) {
  return {
    x: (lon - LON0) * LONGITUDE_FACTOR * SCALE,
    z: -(lat - LAT0) * SCALE,
  };
}

function signedAreaTwice(ring) {
  let sum = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    sum += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
  }
  return sum;
}

export function ringArea(ring) {
  return Math.abs(signedAreaTwice(ring) / 2);
}

export function ringCentroid(ring) {
  const twiceArea = signedAreaTwice(ring);
  if (Math.abs(twiceArea) < Number.EPSILON) {
    throw new Error('Cannot compute centroid of a degenerate ring');
  }
  let x = 0;
  let y = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const cross = ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
    x += (ring[previous][0] + ring[index][0]) * cross;
    y += (ring[previous][1] + ring[index][1]) * cross;
  }
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export function easeOutBack(t) {
  const overshoot = 2.2;
  return 1 + (overshoot + 1) * (t - 1) ** 3 + overshoot * (t - 1) ** 2;
}
