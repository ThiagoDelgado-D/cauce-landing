import { CanvasTexture, SRGBColorSpace } from 'three';

export const ink = {
  base: '#12130f',
  raised: '#1a1c17',
  sidebar: '#16180f',
  strong: '#f2efe6',
  dim: '#9d9787',
  faint: '#4b4e43',
  line: '#2c2f27',
  pine: '#7ec9a3',
  pineWash: 'rgba(126, 201, 163, 0.16)',
  ochre: '#dcae55',
  ember: '#e88a63',
} as const;

export const fonts = {
  display: '"Fraunces Variable", Georgia, serif',
  sans: '"IBM Plex Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

export function canvasTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
