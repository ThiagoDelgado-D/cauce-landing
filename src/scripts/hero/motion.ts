export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const smoothstep = (from: number, to: number, value: number): number => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3);

export const easeInOutCubic = (value: number): number =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
