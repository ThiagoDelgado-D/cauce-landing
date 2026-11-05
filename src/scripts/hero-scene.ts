import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { createAppWindow, windowHeight, windowLayout } from './hero/app-window';
import { createLandscape } from './hero/landscape';
import { palette } from './hero/palette';

const COPY_GAP_PX = 28;
const BOTTOM_MARGIN_PX = 24;
const MAX_WIDTH_SHARE = 0.86;
const TILT = -0.12;

export function mountHeroScene(canvas: HTMLCanvasElement, copy: HTMLElement): boolean {
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
  appWindow.group.rotation.x = TILT;
  scene.add(appWindow.group);

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
    appWindow.group.scale.setScalar(scale);
    appWindow.group.position.set(0, top - (windowHeight * scale) / 2, 0);
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
    resize();
  });

  renderer.setAnimationLoop((milliseconds) => {
    landscape.update(milliseconds / 1000);
    renderer.render(scene, camera);
  });
  return true;
}
