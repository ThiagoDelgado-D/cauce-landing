import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { createAppWindow, windowHeight, windowLayout } from './hero/app-window';
import { createStudyCards } from './hero/cards';
import { createLandscape } from './hero/landscape';
import { createLights } from './hero/lights';
import { clamp01, easeOutCubic } from './hero/motion';
import { palette } from './hero/palette';
import { createHeroProgress } from './hero/progress';

const COPY_GAP_PX = 28;
const BOTTOM_MARGIN_PX = 24;
const MAX_WIDTH_SHARE = 0.86;
const RESTING_TILT = -0.12;
const LYING_TILT = -0.95;
const RISE_DROP = 1.8;
const RISE_DEPTH = 0.6;

export function mountHeroScene(
  section: HTMLElement,
  canvas: HTMLCanvasElement,
  copy: HTMLElement,
): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true });
  } catch {
    return false;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(palette.background, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(0, 0.45, 10);
  camera.lookAt(0, -0.3, 0);

  const landscape = createLandscape();
  scene.add(landscape.points);

  const appWindow = createAppWindow();
  scene.add(appWindow.group);
  const cards = createStudyCards(scene, appWindow.group);
  const lights = createLights(scene, appWindow.group);
  const progress = createHeroProgress(section);
  const rest = { y: 0, scale: 1 };

  const ray = new Vector3();
  const worldYAt = (pixelY: number, height: number) => {
    ray.set(0, 1 - (pixelY / height) * 2, 0.5).unproject(camera).sub(camera.position).normalize();
    return camera.position.y + ray.y * (-camera.position.z / ray.z);
  };

  const placeWindow = (height: number) => {
    const copyBottom = copy.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top;
    const top = worldYAt(copyBottom + COPY_GAP_PX, height);
    const bottom = worldYAt(height - BOTTOM_MARGIN_PX, height);
    const visibleWidth = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    const scale = Math.min(
      (top - bottom) / windowHeight,
      (visibleWidth * MAX_WIDTH_SHARE) / windowLayout.width,
    );
    rest.scale = scale;
    rest.y = top - (windowHeight * scale) / 2;
    cards.setSpread(Math.min(1, Math.max(0.45, camera.aspect / 1.6)));
  };

  const placeRisingWindow = (assembly: number) => {
    const rise = easeOutCubic(clamp01(assembly / 0.5));
    const group = appWindow.group;
    group.position.set(0, rest.y - RISE_DROP * (1 - rise), -RISE_DEPTH * (1 - rise));
    group.rotation.x = LYING_TILT + (RESTING_TILT - LYING_TILT) * rise;
    group.scale.setScalar(rest.scale * (0.88 + 0.12 * rise));
  };

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    placeWindow(height);
  };
  new ResizeObserver(resize).observe(canvas);
  new ResizeObserver(resize).observe(copy);
  resize();

  document.fonts?.ready.then(() => {
    appWindow.redraw();
    cards.redraw();
    resize();
  });

  let previous = performance.now();
  renderer.setAnimationLoop((milliseconds) => {
    const now = performance.now();
    const delta = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    const time = milliseconds / 1000;

    progress.update(now, delta);
    placeRisingWindow(progress.assembly);
    cards.update(progress.assembly, time);
    lights.update(progress.assembly);
    landscape.update(time, lights.glow);
    renderer.render(scene, camera);
  });
  return true;
}
