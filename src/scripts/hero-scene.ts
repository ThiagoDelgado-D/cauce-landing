import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { createAppWindow, windowHeight, windowLayout } from './hero/app-window';
import { createStudyCards } from './hero/cards';
import { GROUND_Y, createLandscape } from './hero/landscape';
import { createLights } from './hero/lights';
import { clamp01, easeInOutCubic, easeOutCubic, smoothstep } from './hero/motion';
import { palette } from './hero/palette';
import { createHeroProgress } from './hero/progress';

const COPY_GAP_PX = 32;
const BELOW_FOLD_SHARE = 0.2;
const WIDE_WIDTH_SHARE = 0.62;
const NARROW_WIDTH_SHARE = 0.86;
const RIPPLE_INTERVAL_MS = 140;
const FILLED_WIDTH_SHARE = 0.88;
const FILLED_HEIGHT_SHARE = 0.8;
const COPY_LIFT_PX = 60;
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
  const filled = { y: 0, scale: 1 };

  const ray = new Vector3();
  const worldYAt = (pixelY: number, height: number) => {
    ray.set(0, 1 - (pixelY / height) * 2, 0.5).unproject(camera).sub(camera.position).normalize();
    return camera.position.y + ray.y * (-camera.position.z / ray.z);
  };

  const placeWindow = (height: number) => {
    const copyBottom = copy.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top;
    const top = worldYAt(copyBottom + COPY_GAP_PX, height);
    const bottom = worldYAt(height * (1 + BELOW_FOLD_SHARE), height);
    const visibleWidth = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    const widthShare = camera.aspect > 1.2 ? WIDE_WIDTH_SHARE : NARROW_WIDTH_SHARE;
    const scale = Math.min(
      (top - bottom) / windowHeight,
      (visibleWidth * widthShare) / windowLayout.width,
    );
    rest.scale = scale;
    rest.y = top - (windowHeight * scale) / 2;
    filled.scale = Math.min(
      (visibleWidth * FILLED_WIDTH_SHARE) / windowLayout.width,
      ((worldYAt(0, height) - worldYAt(height, height)) * FILLED_HEIGHT_SHARE) / windowHeight,
    );
    filled.y = worldYAt(height / 2, height);
    cards.setSpread(Math.min(1, Math.max(0.45, camera.aspect / 1.6)));
  };

  const placeWindow3d = (assembly: number, handoff: number) => {
    const rise = easeOutCubic(clamp01(assembly / 0.5));
    const grow = easeInOutCubic(handoff);
    const group = appWindow.group;
    const risingY = rest.y - RISE_DROP * (1 - rise);
    const risingScale = rest.scale * (0.88 + 0.12 * rise);
    group.position.set(0, risingY + (filled.y - risingY) * grow, -RISE_DEPTH * (1 - rise) * (1 - grow));
    group.rotation.x = (LYING_TILT + (RESTING_TILT - LYING_TILT) * rise) * (1 - grow);
    group.scale.setScalar(risingScale + (filled.scale - risingScale) * grow);
  };

  const fadeCopy = (handoff: number) => {
    const fade = smoothstep(0, 0.55, handoff);
    copy.style.opacity = String(1 - fade);
    copy.style.transform = `translateY(${-handoff * COPY_LIFT_PX}px)`;
    copy.style.visibility = fade >= 0.999 ? 'hidden' : '';
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

  const pointer = new Vector3();
  const groundPoint = (event: PointerEvent): Vector3 | null => {
    const bounds = canvas.getBoundingClientRect();
    pointer
      .set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    if (pointer.y > -0.01) return null;
    return camera.position.clone().addScaledVector(pointer, (GROUND_Y - camera.position.y) / pointer.y);
  };

  let clock = 0;
  let lastRipple = 0;
  const stage = canvas.parentElement ?? canvas;
  stage.addEventListener('pointermove', (event) => {
    const now = performance.now();
    if (now - lastRipple < RIPPLE_INTERVAL_MS) return;
    const point = groundPoint(event);
    if (!point) return;
    landscape.ripple(point.x, point.z, clock, false);
    lastRipple = now;
  });
  stage.addEventListener('pointerdown', (event) => {
    const point = groundPoint(event);
    if (point) landscape.ripple(point.x, point.z, clock, true);
  });

  let previous = performance.now();
  renderer.setAnimationLoop((milliseconds) => {
    const now = performance.now();
    const delta = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    const time = milliseconds / 1000;
    clock = time;

    progress.update(now, delta);
    placeWindow3d(progress.assembly, progress.handoff);
    fadeCopy(progress.handoff);
    cards.update(progress.assembly, time, progress.handoff);
    lights.update(progress.assembly, progress.handoff);
    landscape.update(time, lights.glow, progress.handoff);
    renderer.render(scene, camera);
  });
  return true;
}
