import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three';
import { palette } from './palette';

const COLUMNS = 170;
const ROWS = 56;
const WIDTH = 26;
const NEAR_Z = -0.4;
const FAR_Z = -13;
export const GROUND_Y = -2.7;
const DIM_BRIGHTNESS = 0.55;

export interface Landscape {
  points: Points;
  update(time: number, glow: number): void;
}

export function createLandscape(): Landscape {
  const count = COLUMNS * ROWS;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const baseColors = new Float32Array(count * 3);

  const near = new Color(palette.pine);
  const far = new Color(palette.ochre);
  const tone = new Color();
  const depth = NEAR_Z - FAR_Z;

  for (let column = 0; column < COLUMNS; column++) {
    for (let row = 0; row < ROWS; row++) {
      const index = column * ROWS + row;
      const x = (column / (COLUMNS - 1) - 0.5) * WIDTH;
      const z = FAR_Z + Math.pow(row / (ROWS - 1), 0.85) * depth;
      const distance = 1 - (z - FAR_Z) / depth;
      const brightness = 0.25 + (1 - distance) * 0.55;

      tone.copy(near).lerp(far, Math.min(1, distance * 1.1 + Math.abs(x) / 30));
      positions[index * 3] = x;
      positions[index * 3 + 2] = z;
      baseColors[index * 3] = tone.r * brightness;
      baseColors[index * 3 + 1] = tone.g * brightness;
      baseColors[index * 3 + 2] = tone.b * brightness;
    }
  }

  let appliedGlow = -1;
  const applyGlow = (glow: number) => {
    const brightness = DIM_BRIGHTNESS + (1 - DIM_BRIGHTNESS) * glow;
    for (let i = 0; i < baseColors.length; i++) colors[i] = baseColors[i] * brightness;
    geometry.attributes.color.needsUpdate = true;
    appliedGlow = glow;
  };

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  applyGlow(0);

  const points = new Points(geometry, material);
  points.position.y = GROUND_Y;

  return {
    points,
    update(time, glow) {
      if (Math.abs(glow - appliedGlow) > 0.002) applyGlow(glow);
      for (let index = 0; index < count; index++) {
        const x = positions[index * 3];
        const z = positions[index * 3 + 2];
        positions[index * 3 + 1] =
          Math.sin(x * 0.5 + time * 0.35) * 0.2 +
          Math.cos(z * 0.6 - time * 0.28) * 0.16 +
          Math.sin((x + z) * 0.27 + time * 0.18) * 0.1;
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}
