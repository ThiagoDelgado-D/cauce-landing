import {
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';
import { heroWindow } from '../../content/copy';
import { canvasTexture, fonts, ink, roundedRect } from './canvas';
import { palette } from './palette';

export const windowLayout = {
  textureWidth: 1280,
  textureHeight: 790,
  width: 4.4,
  rows: { x: 270, y: 190, width: 560, height: 58, step: 74, count: 6 },
  idealMatch: { x: 870, y: 190, width: 370, height: 250 },
} as const;

export const windowHeight = (windowLayout.width * windowLayout.textureHeight) / windowLayout.textureWidth;

export function toWindowSpace(x: number, y: number): Vector3 {
  return new Vector3(
    (x / windowLayout.textureWidth - 0.5) * windowLayout.width,
    (0.5 - y / windowLayout.textureHeight) * windowHeight,
    0,
  );
}

function drawApp(canvas: HTMLCanvasElement): void {
  const { textureWidth: width, textureHeight: height, rows, idealMatch } = windowLayout;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.save();
  roundedRect(context, 0, 0, width, height, 22);
  context.fillStyle = ink.base;
  context.fill();
  context.clip();
  context.fillStyle = ink.raised;
  context.fillRect(0, 0, width, 46);
  context.fillStyle = ink.sidebar;
  context.fillRect(0, 46, 230, height - 46);
  context.restore();

  [ink.ember, ink.ochre, ink.pine].forEach((color, index) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(28 + index * 22, 23, 7, 0, Math.PI * 2);
    context.fill();
  });

  context.textBaseline = 'middle';
  context.font = `500 18px ${fonts.mono}`;
  context.fillStyle = ink.faint;
  context.textAlign = 'center';
  context.fillText(heroWindow.appName, width / 2, 23);
  context.textAlign = 'left';

  context.font = `500 22px ${fonts.mono}`;
  heroWindow.navigation.forEach((label, index) => {
    const active = index === 0;
    if (active) {
      context.fillStyle = ink.pineWash;
      roundedRect(context, 14, 76, 200, 38, 8);
      context.fill();
    }
    context.fillStyle = active ? ink.pine : ink.dim;
    context.fillText(label, 34, 95 + index * 50);
  });

  context.font = `500 44px ${fonts.display}`;
  context.fillStyle = ink.strong;
  context.fillText(heroWindow.title, rows.x, 104);
  context.font = `400 22px ${fonts.sans}`;
  context.fillStyle = ink.dim;
  context.fillText(heroWindow.context, rows.x + 2, 148);

  context.setLineDash([8, 8]);
  context.lineWidth = 2;
  context.strokeStyle = ink.line;
  for (let index = 0; index < rows.count; index++) {
    roundedRect(context, rows.x, rows.y + index * rows.step, rows.width, rows.height, 10);
    context.stroke();
  }
  roundedRect(context, idealMatch.x, idealMatch.y, idealMatch.width, idealMatch.height, 14);
  context.stroke();
  context.setLineDash([]);

  context.font = `500 18px ${fonts.mono}`;
  context.fillStyle = ink.faint;
  context.fillText(heroWindow.emptyList, rows.x + 20, rows.y + rows.count * rows.step + 22);
}

export interface AppWindow {
  group: Group;
  redraw(): void;
}

export function createAppWindow(): AppWindow {
  const canvas = document.createElement('canvas');
  drawApp(canvas);
  const texture = canvasTexture(canvas);

  const group = new Group();
  const surface = new Mesh(
    new PlaneGeometry(windowLayout.width, windowHeight),
    new MeshBasicMaterial({ map: texture }),
  );
  group.add(surface);

  const corners = [
    toWindowSpace(0, 0),
    toWindowSpace(windowLayout.textureWidth, 0),
    toWindowSpace(windowLayout.textureWidth, windowLayout.textureHeight),
    toWindowSpace(0, windowLayout.textureHeight),
  ];
  const frame = new LineLoop(
    new BufferGeometry().setFromPoints(corners),
    new LineBasicMaterial({ color: palette.pine, transparent: true, opacity: 0.4 }),
  );
  frame.position.z = 0.002;
  group.add(frame);

  return {
    group,
    redraw() {
      drawApp(canvas);
      texture.needsUpdate = true;
    },
  };
}
