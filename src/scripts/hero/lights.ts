import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  type Texture,
} from 'three';
import { canvasTexture } from './canvas';
import { windowHeight, windowLayout } from './app-window';
import { GROUND_Y } from './landscape';
import { smoothstep } from './motion';

function glowCanvas(stops: [number, string][]): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return canvas;
}

function horizonCanvas(): HTMLCanvasElement {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const band = context.createLinearGradient(0, 0, 0, height);
  band.addColorStop(0, 'rgba(0, 0, 0, 0)');
  band.addColorStop(0.45, 'rgba(126, 201, 163, 0.10)');
  band.addColorStop(0.68, 'rgba(126, 201, 163, 0.38)');
  band.addColorStop(0.8, 'rgba(220, 174, 85, 0.55)');
  band.addColorStop(0.88, 'rgba(232, 138, 99, 0.25)');
  band.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = band;
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = 'destination-in';
  const falloff = context.createRadialGradient(width / 2, height * 0.8, 0, width / 2, height * 0.8, width * 0.55);
  falloff.addColorStop(0, 'rgba(0, 0, 0, 1)');
  falloff.addColorStop(0.6, 'rgba(0, 0, 0, 0.6)');
  falloff.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = falloff;
  context.fillRect(0, 0, width, height);
  return canvas;
}

const additive = (map: Texture) =>
  new MeshBasicMaterial({ map, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });

export interface Lights {
  glow: number;
  update(assembly: number): void;
}

export function createLights(scene: Scene, windowGroup: Group): Lights {
  const horizon = new Mesh(new PlaneGeometry(36, 18), additive(canvasTexture(horizonCanvas())));
  horizon.position.set(0, -0.6, -14);
  scene.add(horizon);

  const rim = new Mesh(
    new PlaneGeometry(windowLayout.width * 1.9, windowHeight * 2.2),
    additive(
      canvasTexture(
        glowCanvas([
          [0, 'rgba(126, 201, 163, 0.5)'],
          [0.45, 'rgba(126, 201, 163, 0.14)'],
          [1, 'rgba(0, 0, 0, 0)'],
        ]),
      ),
    ),
  );
  rim.position.z = -0.25;
  windowGroup.add(rim);

  const reflection = new Mesh(
    new PlaneGeometry(7, 4.5),
    additive(
      canvasTexture(
        glowCanvas([
          [0, 'rgba(126, 201, 163, 0.55)'],
          [0.5, 'rgba(126, 201, 163, 0.12)'],
          [1, 'rgba(0, 0, 0, 0)'],
        ]),
      ),
    ),
  );
  reflection.rotation.x = -Math.PI / 2;
  reflection.position.set(0, GROUND_Y + 0.02, -1.6);
  scene.add(reflection);

  const lights: Lights = {
    glow: 0,
    update(assembly) {
      const glow = smoothstep(0.15, 0.7, assembly);
      lights.glow = glow;
      horizon.material.opacity = glow;
      rim.material.opacity = (0.35 + 0.65 * smoothstep(0.6, 1, assembly)) * glow;
      reflection.material.opacity = glow * 0.9;
      reflection.position.x = windowGroup.position.x;
    },
  };
  return lights;
}
