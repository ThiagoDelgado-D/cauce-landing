import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createLandscape } from './hero/landscape';
import { palette } from './hero/palette';

export function mountHeroScene(canvas: HTMLCanvasElement): boolean {
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

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  renderer.setAnimationLoop((milliseconds) => {
    landscape.update(milliseconds / 1000);
    renderer.render(scene, camera);
  });
  return true;
}
