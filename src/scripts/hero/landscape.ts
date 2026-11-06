import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three';
import { palette } from './palette';

const DENSE = { columns: 170, rows: 56 };
const SPARSE = { columns: 110, rows: 36 };
const WIDTH = 26;
const NEAR_Z = -0.4;
const FAR_Z = -13;
export const GROUND_Y = -2.7;
const DIM_BRIGHTNESS = 0.55;
const MAX_RIPPLES = 8;
const RIPPLE_LIFETIME = 4;
const RIPPLE_SPEED = 2.6;
const RIPPLE_WIDTH = 0.18;
const RIPPLE_AMPLITUDE = 0.32;
const BIG_RIPPLE_AMPLITUDE = 0.75;

interface Ripple {
  x: number;
  z: number;
  startedAt: number;
  amplitude: number;
}

export interface Landscape {
  points: Points;
  ripple(x: number, z: number, time: number, big: boolean): void;
  update(time: number, glow: number, sink: number): void;
}

export function createLandscape(sparse: boolean): Landscape {
  const { columns: COLUMNS, rows: ROWS } = sparse ? SPARSE : DENSE;
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

  const ripples: Ripple[] = [];

  return {
    points,
    ripple(x, z, time, big) {
      ripples.push({ x, z, startedAt: time, amplitude: big ? BIG_RIPPLE_AMPLITUDE : RIPPLE_AMPLITUDE });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    },
    update(time, glow, sink) {
      points.position.y = GROUND_Y - sink * 1.6;
      material.opacity = 0.95 * (1 - sink * 0.85);
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (time - ripples[i].startedAt > RIPPLE_LIFETIME) ripples.splice(i, 1);
      }
      const rippling = ripples.length > 0;
      if (!rippling && Math.abs(glow - appliedGlow) > 0.002) applyGlow(glow);
      const brightness = DIM_BRIGHTNESS + (1 - DIM_BRIGHTNESS) * glow;

      for (let index = 0; index < count; index++) {
        const x = positions[index * 3];
        const z = positions[index * 3 + 2];
        let y =
          Math.sin(x * 0.5 + time * 0.35) * 0.2 +
          Math.cos(z * 0.6 - time * 0.28) * 0.16 +
          Math.sin((x + z) * 0.27 + time * 0.18) * 0.1;

        if (rippling) {
          let lift = 0;
          for (const ripple of ripples) {
            const age = time - ripple.startedAt;
            const offset = Math.hypot(x - ripple.x, z - ripple.z) - age * RIPPLE_SPEED;
            const wave =
              ripple.amplitude *
              Math.exp(-age * 0.9) *
              Math.exp(-(offset * offset) / RIPPLE_WIDTH) *
              Math.cos(offset * 5);
            y += wave;
            lift += Math.abs(wave);
          }
          const lit = brightness + Math.min(0.9, lift * 2.2);
          colors[index * 3] = baseColors[index * 3] * lit;
          colors[index * 3 + 1] = baseColors[index * 3 + 1] * lit;
          colors[index * 3 + 2] = baseColors[index * 3 + 2] * lit;
        }
        positions[index * 3 + 1] = y;
      }

      geometry.attributes.position.needsUpdate = true;
      if (rippling) {
        geometry.attributes.color.needsUpdate = true;
        appliedGlow = -1;
      }
    },
  };
}
