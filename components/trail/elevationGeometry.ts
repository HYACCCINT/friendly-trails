// The chart's scales, shared by the static <ElevationProfile> (server or client) and the
// v3 hover layer, which draws its cursor on top of the server-rendered chart.

export const ELEVATION_CHART = {
  width: 640,
  height: 220,
  padTop: 16,
  padRight: 18,
  padBottom: 30,
  padLeft: 52,
} as const;

function niceTicks(min: number, max: number) {
  let step = max - min > 300 ? 100 : max - min > 120 ? 50 : 20;
  let low = Math.floor(min / step) * step;
  let high = Math.max(Math.ceil(max / step) * step, low + step);
  while ((high - low) / step > 5) {
    step *= 2;
    low = Math.floor(min / step) * step;
    high = Math.max(Math.ceil(max / step) * step, low + step);
  }
  const ticks: number[] = [];
  for (let value = low; value <= high; value += step) ticks.push(value);
  return { low, high, ticks };
}

export function elevationGeometry(elevation: number[]) {
  const { width, height, padTop, padRight, padBottom, padLeft } = ELEVATION_CHART;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  const min = Math.min(...elevation);
  const max = Math.max(...elevation);
  const { low, high, ticks } = niceTicks(min, max);
  const last = elevation.length - 1;

  return {
    min,
    max,
    ticks,
    last,
    innerWidth,
    baseline: padTop + innerHeight,
    x: (index: number) => padLeft + (index / last) * innerWidth,
    y: (meters: number) => padTop + (1 - (meters - low) / (high - low)) * innerHeight,
  };
}
